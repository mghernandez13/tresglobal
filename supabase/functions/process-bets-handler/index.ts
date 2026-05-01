import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("No authorization header");

  // 2. Initialize the Admin Client using the SERVICE_ROLE_KEY
  // Note: Do NOT use the user's JWT to initialize this client.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { data: messages, error } = await supabase
    .schema("pgmq_public")
    .rpc("read", {
      queue_name: "process-bets-queue",
      sleep_seconds: 30, // seconds
      n: 5, // number of messages to batch
    });

  if (error) {
    console.error("Error reading messages from process-bets-queue:", error);

    return new Response(
      JSON.stringify({
        error: "Error reading messages from process-bets-queue",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (messages) {
    for (const msg of messages) {
      try {
        console.log("Processing message:", msg.message);

        const {
          resultId,
          lottoTypeId,
          resultDrawDate,
          combination,
          createdBy,
        } = JSON.parse(msg.message);

        if (
          !resultId ||
          !lottoTypeId ||
          !resultDrawDate ||
          !combination ||
          !createdBy
        ) {
          console.log(
            "Missing lottoTypeId, resultDrawDate, combination, or createdBy.",
          );
          break;
        }

        // Fetch all bets matching lottoTypeId and created_at date
        const startDate = resultDrawDate + "T00:00:00";
        const endDate = resultDrawDate + "T23:59:59.999";

        //Reset all the bets before processing to ensure we can re-process if needed without duplicates
        await supabase
          .from("bets")
          .update({
            hit: false,
            prize_amount: null,
            is_super_jackpot: false,
            is_return_bet: false,
          })
          .eq("lotto_type_id", lottoTypeId)
          .gte("created_at", startDate)
          .lte("created_at", endDate);

        const { data: allBets, error: betsError } = await supabase
          .from("bets")
          .select("*")
          .eq("lotto_type_id", lottoTypeId)
          .gte("created_at", startDate)
          .lte("created_at", endDate);

        if (betsError) {
          return new Response(
            JSON.stringify({
              error: `Error fetching bets for lottoTypeId ${lottoTypeId} and draw date ${resultDrawDate}`,
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        // Process bets for super_jackpot, return_bet, and classic match

        const resultNumbers = combination.split("-").map((s) => s.trim());
        const firstThree = resultNumbers.slice(0, 3);
        const processedResults = [];
        if (allBets && Array.isArray(allBets)) {
          for (const bet of allBets) {
            const { data: betPrizeData, error: betPrizeError } = await supabase
              .from("bet_prizes")
              .select("*")
              .eq("lotto_type_id", lottoTypeId)
              .eq("bet_amount", bet.bet_amount)
              .eq("is_active", true)
              .single();

            if (betPrizeError) {
              console.error(
                `Error fetching bet prize for lottoTypeId ${lottoTypeId} and bet amount ${bet.bet_amount}:`,
                betPrizeError,
              );
            }

            let prizeAmount = 0;
            const betNumbers = bet.combination.split("-").map((s) => s.trim());
            const isSuperJackpot =
              betNumbers.length === 3 &&
              betNumbers[0] === firstThree[0] &&
              betNumbers[1] === firstThree[1] &&
              betNumbers[2] === firstThree[2] &&
              bet.bet_amount <= 25;
            const matchCount = betNumbers.filter((num) =>
              firstThree.includes(num),
            ).length;
            const isReturnBet =
              !isSuperJackpot && matchCount === 2 && bet.bet_amount >= 50;

            if (isSuperJackpot || isReturnBet) {
              if (isSuperJackpot && betPrizeData) {
                prizeAmount = betPrizeData.super_jackpot
                  ? betPrizeData.prize * betPrizeData.super_jackpot_multiplier
                  : betPrizeData.prize;
              }
              if (isReturnBet) {
                prizeAmount = 0;
              }
              await supabase
                .from("bets")
                .update({
                  hit: true,
                  prize_amount: prizeAmount,
                  is_super_jackpot: isSuperJackpot,
                  is_return_bet: isReturnBet,
                })
                .eq("id", bet.id);
              processedResults.push({
                ...bet,
                prize_amount: prizeAmount,
                hit: true,
                is_super_jackpot: isSuperJackpot,
                is_return_bet: isReturnBet,
              });
              continue;
            }
            const isClassicMatch = betNumbers.every((num) =>
              resultNumbers.includes(num),
            );
            if (isClassicMatch) {
              prizeAmount = betPrizeData ? betPrizeData.prize : 0;
              await supabase
                .from("bets")
                .update({
                  hit: true,
                  prize_amount: prizeAmount,
                  is_super_jackpot: false,
                  is_return_bet: false,
                })
                .eq("id", bet.id);
              processedResults.push({
                ...bet,
                hit: true,
                prize_amount: prizeAmount,
                is_super_jackpot: false,
                is_return_bet: false,
              });
              continue;
            }
            // If not a winner, do nothing
          }
        }
        console.log(
          `Processed bets: ${JSON.stringify(processedResults)} for resultId ${resultId}`,
        );

        // Insert log into draw_results_logs table
        const { error: logError } = await supabase
          .from("draw_results_logs")
          .insert([
            {
              draw_result_id: resultId,
              name: "PROCESS BETS",
              status: "FINISHED",
              created_by: createdBy,
            },
          ]);
        if (logError) {
          console.error("Error inserting draw results log:", logError);
        }

        // Archive the processed message
        const { error: archiveError } = await supabase
          .schema("pgmq_public")
          .rpc("archive", {
            queue_name: "process-bets-queue",
            message_id: msg.msg_id,
          });

        if (archiveError) {
          console.error(
            "Error archiving message:",
            archiveError,
            "Message ID:",
            msg.msg_id,
          );
        }
      } catch (err) {
        console.error("Failed to process message:", msg.msg_id, err);
      }
    }

    console.log("Finished processing batch of messages.");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
