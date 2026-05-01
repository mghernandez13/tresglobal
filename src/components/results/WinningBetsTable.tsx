import type React from "react";
import Input from "../generic/Input";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_BETS } from "../../graphql/queries/bets";
import { GET_DRAW_RESULTS_LOGS } from "../../graphql/queries/resultsLogs";
import type {
  BetsQueryData,
  DrawResultsLogsQueryData,
  QueryParamsVariables,
  Bets,
} from "../../types/api";
import { useParams } from "react-router-dom";
import Skeleton from "../generic/Skeleton";
import { formatCurrency } from "../../utils/currency";
import ViewBetModal from "../modals/bets/ViewBetModal";

interface WinningBetsTableProps {
  lottoTypeId: string;
  drawDate: string;
  winningCombination: string;
}

const WinningBetsTable: React.FC<WinningBetsTableProps> = ({
  lottoTypeId,
  drawDate,
  winningCombination,
}) => {
  const { resultId } = useParams<{ resultId: string }>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [defaultNoDataMessage, setDefaultNoDataMessage] = useState(
    "No winning bets found",
  );
  const pageSize = 10;

  // State for view modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bets | null>(null);

  const columns = [
    { name: "Details", field: "details" },
    { name: "Combination", field: "combination" },
    { name: "Hit", field: "hit" },
    { name: "Prize", field: "prize" },
    { name: "Bet", field: "bet" },
    { name: "Agent", field: "agent" },
  ];

  // Query draw results logs for 'Process Bets' for this resultId
  const { data: logsData } = useQuery<
    DrawResultsLogsQueryData,
    QueryParamsVariables
  >(GET_DRAW_RESULTS_LOGS, {
    variables: {
      first: 1,
      offset: 0,
      filter: {
        and: [
          { draw_result_id: { eq: resultId ? parseInt(resultId) : -1 } },
          { name: { eq: "PROCESS BETS" } },
        ],
      },
      sortOrder: [{ created_at: "DescNullsLast" }],
    },
    skip: !resultId,
  });

  // Prepare filter for GET_BETS with server-side search
  const filter = useMemo(() => {
    const base: Record<string, unknown>[] = [
      { lotto_type_id: { eq: lottoTypeId } },
      { hit: { eq: true } },
      {
        created_at: {
          gte: drawDate + "T00:00:00",
          lte: drawDate + "T23:59:59.999",
        },
      },
    ];
    if (debouncedSearch && debouncedSearch.trim() !== "") {
      base.push({
        or: [
          { combination: { ilike: `%${debouncedSearch}%` } },
          { bettor_name: { ilike: `%${debouncedSearch}%` } },
        ] as Record<string, unknown>[],
      });
    }
    return { and: base };
  }, [lottoTypeId, drawDate, debouncedSearch]);

  const { data, loading, error } = useQuery<
    BetsQueryData,
    QueryParamsVariables
  >(GET_BETS, {
    variables: {
      first: pageSize,
      offset: (page - 1) * pageSize,
      filter,
      // searchTerm is not used by backend for filtering, so omit or leave as "%"
      searchTerm: "%",
      sortOrder: [{ created_at: "DescNullsLast" }],
    },
    fetchPolicy: "network-only",
  });

  const winningBets =
    data?.betsCollection?.edges?.map((edge) => edge.node) || [];
  const totalCount = data?.betsCollection?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Reset to page 1 when search changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    setDefaultNoDataMessage("No Records found");
  }, [search]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (
      logsData?.draw_results_logsCollection?.edges &&
      logsData.draw_results_logsCollection.edges.length > 0
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDefaultNoDataMessage("No winning bets found");
    } else {
      setDefaultNoDataMessage("Winning Bets not yet Processed");
    }
  }, [logsData]);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-lg text-white">Winning Bets</div>
        <div className="w-64">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-400">
          <thead className="text-xs uppercase bg-gray-800 text-gray-400">
            <tr>
              {columns.map((col) => (
                <th key={col.field} className="px-4 py-2 font-semibold">
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-3">
                  <Skeleton width={"100%"} height={24} />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-3 text-red-400">
                  Error loading bets
                </td>
              </tr>
            ) : winningBets.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-4 text-center">
                  {defaultNoDataMessage}
                </td>
              </tr>
            ) : (
              winningBets.map((bet, idx: number) => (
                <tr
                  key={bet.id || idx}
                  className="border-b border-gray-700 cursor-pointer hover:bg-gray-700"
                  onClick={() => {
                    setSelectedBet(bet);
                    setViewModalOpen(true);
                  }}
                >
                  <td className="px-4 py-3 align-top">
                    <div>
                      <div>Added By: {bet.profiles?.full_name || "-"}</div>
                      <div className="text-xs text-gray-400">
                        On: {new Date(bet.created_at).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        RefID: {bet.id}
                      </div>
                      <div className="text-xs text-gray-400">
                        DummyBet: {bet.is_dummy_bet ? "Yes" : "No"}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top font-bold">
                    {bet.combination}
                    <br />
                    {winningCombination}
                  </td>
                  <td className="px-4 py-3 align-top font-bold">
                    {bet.hit
                      ? `${bet.is_return_bet ? `RETURN BET` : `JACKPOT`} - ${bet.bet_types?.name || "Normal Bet"}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {bet.prize_amount
                      ? `PHP ${formatCurrency(bet.prize_amount)}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    PHP {bet.bet_amount}
                    <br />
                    <span className="text-xs">
                      {bet.bet_types?.name || "Normal Bet"}
                    </span>
                    <br />
                    <span className="text-xs">{bet.bettor_name || "-"}</span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {bet.profiles?.full_name || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
      {/* View Bet Modal */}
      <ViewBetModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedBet(null);
        }}
        bet={selectedBet}
      />
    </div>
  );
};

export default WinningBetsTable;
