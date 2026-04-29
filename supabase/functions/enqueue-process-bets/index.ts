import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  console.log("Received request to enqueue process bets function");
  const queueName = "process-bets-queue";
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Get the JWT from the request headers
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

    const { resultId, lottoTypeId, resultDrawDate, combination, createdBy } =
      await req.json();
    console.log("Received payload for enqueueing:", {
      resultId,
      lottoTypeId,
      resultDrawDate,
      combination,
      createdBy,
    });
    const { data, error } = await supabase.schema("pgmq_public").rpc("send", {
      queue_name: queueName,
      message: JSON.stringify({
        resultId,
        lottoTypeId,
        resultDrawDate,
        combination,
        createdBy,
      }), // Your JSON payload as string
      sleep_seconds: 0, // Optional: delay visibility (default 0)
    });

    if (error) {
      console.error(`Error sending message to ${queueName} queue:`, error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!data || data.length === 0) {
      console.log("No messages in workflow_messages queue");
      return new Response(JSON.stringify({ message: "No messages in queue" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log(`Found ${data.length} messages to process`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Found ${JSON.stringify(data)} messages to process`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
