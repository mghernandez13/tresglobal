import React, { useRef, useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "../../db/supabase";
import { useMutation } from "@apollo/client/react";
import { CREATE_DRAW_RESULTS_LOG } from "../../graphql/queries/resultsLogs";
import { generateExcelFile } from "../../utils/excel";

interface UserActionsDropdownProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  resultId: number | undefined;
  lottoTypeId: string | undefined;
  resultDrawDate: string | undefined;
  userId: string | undefined;
  setEditModalOpen: (open: boolean) => void;
  handleProcessBets: () => void;
}

type Bet = {
  id: number;
  combination: string;
  bettor_name: string;
  bet_amount: number;
  prize_amount?: number;
  created_at: string;
  is_super_jackpot?: boolean;
  is_return_bet?: boolean;
  profiles?: {
    full_name?: string;
  };
};

const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({
  isLoading,
  setIsLoading,
  resultId,
  lottoTypeId,
  resultDrawDate,
  userId,
  setEditModalOpen,
  handleProcessBets,
}) => {
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const [createResultLog] = useMutation(CREATE_DRAW_RESULTS_LOG);

  React.useEffect(() => {
    if (!actionsOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target as Node)
      ) {
        setActionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionsOpen]);

  const handleDownloadJackpot = useCallback(async () => {
    if (!lottoTypeId || !resultDrawDate) return;
    setIsLoading(true);
    await createResultLog({
      variables: {
        name: `DOWNLOAD JACKPOT WINNERS`,
        status: "STARTED",
        created_by: userId,
        draw_result_id: resultId,
      },
    });
    const { data: bets, error } = await supabase
      .from("bets")
      .select(
        `id, combination, bettor_name, bet_amount, prize_amount, created_at, profiles:agent_id(full_name)`,
      )
      .eq("lotto_type_id", lottoTypeId)
      .eq("hit", true)
      .eq("is_return_bet", false)
      .gte("created_at", resultDrawDate + "T00:00:00")
      .lte("created_at", resultDrawDate + "T23:59:59.999")
      .limit(10000);
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error Fetching Jackpot Winners",
        text: error.message,
      });
      return;
    }
    if (!bets || bets.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Jackpot Winners",
        text: "No jackpot winners found for this draw.",
      });
      return;
    }
    const wsData = (bets as Bet[]).map((bet) => ({
      ID: bet.id,
      Combination: bet.combination,
      "Bettor Name": bet.bettor_name,
      "Agent Name": bet.profiles?.full_name || "-",
      Amount: bet.bet_amount,
      Prize: bet.prize_amount ?? "-",
      "Created At": bet.created_at,
    }));
    generateExcelFile(wsData, `jackpot_winners_${resultDrawDate}.xlsx`);
    await createResultLog({
      variables: {
        name: `DOWNLOAD JACKPOT WINNERS`,
        status: "FINISHED",
        created_by: userId,
        draw_result_id: resultId,
      },
    });
    setIsLoading(false);
  }, [
    createResultLog,
    lottoTypeId,
    resultDrawDate,
    resultId,
    setIsLoading,
    userId,
  ]);

  const handleDownloadRB = useCallback(async () => {
    if (!lottoTypeId || !resultDrawDate) return;
    setIsLoading(true);
    await createResultLog({
      variables: {
        name: `DOWNLOAD RB WINNERS`,
        status: "STARTED",
        created_by: userId,
        draw_result_id: resultId,
      },
    });
    const { data: bets, error } = await supabase
      .from("bets")
      .select(
        `id, combination, bettor_name, bet_amount, prize_amount, created_at, profiles:agent_id(full_name)`,
      )
      .eq("lotto_type_id", lottoTypeId)
      .eq("hit", true)
      .eq("is_return_bet", true)
      .gte("created_at", resultDrawDate + "T00:00:00")
      .lte("created_at", resultDrawDate + "T23:59:59.999")
      .limit(10000);
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error Fetching RB Winners",
        text: error.message,
      });
      return;
    }
    if (!bets || bets.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No RB Winners",
        text: "No RB winners found for this draw.",
      });
      return;
    }
    const wsData = (bets as Bet[]).map((bet) => ({
      ID: bet.id,
      Combination: bet.combination,
      "Bettor Name": bet.bettor_name,
      "Agent Name": bet.profiles?.full_name || "-",
      Amount: bet.bet_amount,
      Prize: bet.prize_amount ?? "-",
      "Created At": bet.created_at,
    }));
    generateExcelFile(wsData, `rb_winners_${resultDrawDate}.xlsx`);
    await createResultLog({
      variables: {
        name: `DOWNLOAD RB WINNERS`,
        status: "FINISHED",
        created_by: userId,
        draw_result_id: resultId,
      },
    });
    setIsLoading(false);
  }, [
    createResultLog,
    lottoTypeId,
    resultDrawDate,
    resultId,
    setIsLoading,
    userId,
  ]);

  const handleDownloadAllResults = useCallback(async () => {
    if (!lottoTypeId || !resultDrawDate) return;
    setIsLoading(true);
    await createResultLog({
      variables: {
        name: `DOWNLOAD ALL RESULTS`,
        status: "STARTED",
        created_by: userId,
        draw_result_id: resultId,
      },
    });
    const { data: bets, error } = await supabase
      .from("bets")
      .select(
        `id, combination, bettor_name, bet_amount, prize_amount, created_at, is_super_jackpot, is_return_bet, hit, profiles:agent_id(full_name)`,
      )
      .eq("lotto_type_id", lottoTypeId)
      .eq("hit", true)
      .gte("created_at", resultDrawDate + "T00:00:00")
      .lte("created_at", resultDrawDate + "T23:59:59.999")
      .limit(10000);
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error Fetching Winning Bets",
        text: error.message,
      });
      setIsLoading(false);
      return;
    }
    if (!bets || bets.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Winning Bets",
        text: "No winning bets found for this draw.",
      });
      setIsLoading(false);
      return;
    }
    const wsData = (bets as Bet[]).map((bet) => ({
      ID: bet.id,
      Combination: bet.combination,
      "Bettor Name": bet.bettor_name,
      "Agent Name": bet.profiles?.full_name || "-",
      Amount: bet.bet_amount,
      Prize: bet.prize_amount ?? "-",
      "Created At": bet.created_at,
      Type: bet.is_super_jackpot
        ? "Super Jackpot"
        : bet.is_return_bet
          ? "Return Bet"
          : "Jackpot",
    }));
    generateExcelFile(wsData, `all_winning_bets_${resultDrawDate}.xlsx`);
    await createResultLog({
      variables: {
        name: `DOWNLOAD ALL RESULTS`,
        status: "FINISHED",
        created_by: userId,
        draw_result_id: resultId,
      },
    });
    setIsLoading(false);
  }, [
    createResultLog,
    lottoTypeId,
    resultDrawDate,
    resultId,
    setIsLoading,
    userId,
  ]);

  return (
    <div className="relative" ref={actionsMenuRef}>
      <button
        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 flex"
        onClick={() => setActionsOpen((v) => !v)}
      >
        User Actions
        <ChevronDown />
      </button>
      {actionsOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded shadow-lg z-20 text-sm">
          <ul className="py-1">
            <li
              className="px-4 py-2 cursor-pointer transition-colors duration-150 hover:bg-blue-600 hover:text-white"
              aria-disabled={isLoading}
              onClick={handleProcessBets}
            >
              Process Bets
            </li>
            <li
              aria-disabled={isLoading}
              onClick={handleDownloadJackpot}
              className="px-4 py-2 cursor-pointer transition-colors duration-150 hover:bg-blue-600 hover:text-white"
            >
              Download Results - Jackpot
            </li>
            <li
              aria-disabled={isLoading}
              onClick={handleDownloadRB}
              className="px-4 py-2 cursor-pointer transition-colors duration-150 hover:bg-blue-600 hover:text-white"
            >
              Download Results - RB
            </li>
            <li
              aria-disabled={isLoading}
              onClick={handleDownloadAllResults}
              className="px-4 py-2 cursor-pointer transition-colors duration-150 hover:bg-blue-600 hover:text-white"
            >
              Download all Results
            </li>
            <li
              className="px-4 py-2 cursor-pointer transition-colors duration-150 hover:bg-blue-600 hover:text-white"
              onClick={() => setEditModalOpen(true)}
            >
              Edit Winning Combination
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserActionsDropdown;
