import { useMutation } from "@apollo/client/react";
import Swal from "sweetalert2";
import Headline from "../../../components/generic/Headline";
import AdminTemplate from "../../../templates/AdminTemplate";
import DataTable from "../../../components/generic/table";
import { UPDATE_BET_PRIZE } from "../../../graphql/queries/betPrizes";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Eye,
  SquarePen,
  Trash2,
} from "lucide-react";
import type { SortDirection } from "../../../types/constants";
import type { UpdateBetPrizeMutation } from "../../../types/api";
import { formatTo12h } from "../../../utils/helper";
import ViewBetPrizeModal from "../../../components/modals/betPrizes/ViewBetPrizeModal";
import UpdateBetPrizeModal from "../../../components/modals/betPrizes/UpdateBetPrizeModal";
import { formatCurrency } from "../../../utils/currency";
import PrimaryButton from "../../../components/generic/buttons/Primary";
import { useCheckUserPermissions } from "../../../hooks/useCheckUserPermission";
import IconTableActionButton from "../../../components/generic/buttons/IconTableActionButton";
import { supabase } from "../../../db/supabase";
import type {
  BetPrizeListItem,
  BetPrizeSupabaseRow,
  TableError,
} from "../../../types/bets";
import {
  matchesBetPrizeSearch,
  normalizeBetPrizeRows,
  sortBetPrizes,
} from "../../../utils/bets";

const renderSortIcon = (
  activeColumn: string,
  currentColumn: string,
  direction: SortDirection,
) => {
  if (activeColumn === currentColumn) {
    return direction === "AscNullsFirst" ? (
      <ChevronUp className="absolute right-2 top-4 w-4 h-4" />
    ) : (
      <ChevronDown className="absolute right-2 top-4 w-4 h-4" />
    );
  }

  return <ChevronsUpDown className="absolute right-2 top-4 w-4 h-4" />;
};

const BetPrizesPage: React.FC = () => {
  useCheckUserPermissions("View Bet Prizes");

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";

  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: SortDirection;
  }>({
    column: "created_at",
    direction: "DescNullsLast",
  });
  const [pageSize, setPageSize] = useState<number>(10);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<BetPrizeListItem | null>(
    null,
  );
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updatePrize, setUpdatePrize] = useState<BetPrizeListItem | null>(null);
  const [selectedGameTypes, setSelectedGameTypes] = useState<string[]>([]);
  const [betPrizes, setBetPrizes] = useState<BetPrizeListItem[]>([]);
  const [allBetPrizes, setAllBetPrizes] = useState<BetPrizeListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TableError | null>(null);
  const offset = (currentPage - 1) * pageSize;

  const fetchBetPrizes = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("bet_prizes")
      .select(
        `
          id,
          lotto_types!inner(id, game_type, draw_time, name),
          bet_types(id, name),
          bet_amount,
          prize,
          is_active,
          super_jackpot,
          super_jackpot_multiplier
        `,
        { count: "exact" },
      )
      .eq("is_archive", false);

    if (selectedGameTypes.length > 0) {
      query = query.in("lotto_types.game_type", selectedGameTypes);
    }

    const { data, error: listError } = await query;

    if (listError) {
      setBetPrizes([]);
      setTotalCount(0);
      setHasNextPage(false);
      setError({ name: "SupabaseError", message: listError.message });
      setLoading(false);
      return;
    }

    const rows = normalizeBetPrizeRows((data ?? []) as BetPrizeSupabaseRow[]);
    const searchedRows = rows.filter((prize) =>
      matchesBetPrizeSearch(prize, searchQuery),
    );
    const ascending = sortConfig.direction === "AscNullsFirst";
    const sortedRows = sortBetPrizes(
      searchedRows,
      sortConfig.column,
      ascending,
    );
    const paginatedRows = sortedRows.slice(offset, offset + pageSize);

    setBetPrizes(paginatedRows);
    setTotalCount(sortedRows.length);
    setHasNextPage(offset + paginatedRows.length < sortedRows.length);
    setLoading(false);
  }, [
    offset,
    pageSize,
    searchQuery,
    selectedGameTypes,
    sortConfig.column,
    sortConfig.direction,
  ]);

  const fetchAllBetPrizes = useCallback(async () => {
    const { data } = await supabase
      .from("bet_prizes")
      .select(
        `
          id,
          lotto_types!inner(id, game_type, draw_time, name),
          bet_types(id, name),
          bet_amount,
          prize,
          is_active,
          super_jackpot,
          super_jackpot_multiplier
        `,
      )
      .eq("is_archive", false);

    setAllBetPrizes(
      normalizeBetPrizeRows((data ?? []) as BetPrizeSupabaseRow[]),
    );
  }, []);

  const [updateBetPrize, { loading: updateBetPrizeLoading }] =
    useMutation<UpdateBetPrizeMutation>(UPDATE_BET_PRIZE, {
      awaitRefetchQueries: false,
    });

  useEffect(() => {
    void fetchBetPrizes();
  }, [fetchBetPrizes]);

  useEffect(() => {
    void fetchAllBetPrizes();
  }, [fetchAllBetPrizes]);

  // Game type filter counts based on lotto types actually referenced by bet prizes
  const gameTypeOptions = useMemo(() => {
    const counts: Record<string, Set<string>> = {
      "2D": new Set(),
      "3D": new Set(),
      LP3: new Set(),
    };
    allBetPrizes.forEach((prize) => {
      const gt = prize.lotto_types?.game_type;
      const ltId = prize.lotto_types?.id;
      if (gt && ltId && counts[gt] !== undefined) {
        counts[gt].add(String(ltId));
      }
    });
    return [
      { name: "2D", value: "2D", count: counts["2D"].size },
      { name: "3D", value: "3D", count: counts["3D"].size },
      { name: "LP3", value: "LP3", count: counts["LP3"].size },
    ];
  }, [allBetPrizes]);

  const tableFilter = {
    gameType: {
      label: "Game Type",
      selectedFilter: selectedGameTypes,
      setSelectedFilter: setSelectedGameTypes,
      data: gameTypeOptions,
    },
  };

  const handleSort = useCallback(
    (columnName: string) => {
      let direction: SortDirection = "AscNullsFirst";
      if (
        sortConfig.column === columnName &&
        sortConfig.direction === "AscNullsFirst"
      ) {
        direction = "DescNullsLast";
      }
      setSortConfig({ column: columnName, direction });
    },
    [sortConfig.column, sortConfig.direction],
  );

  const handleBulkDelete = useCallback(
    (selectedIndexes: number[], resetSelectedRows: () => void) => {
      const selectedIds = selectedIndexes
        .map((index) => {
          const prize = betPrizes[index];
          return prize?.id;
        })
        .filter(Boolean);
      if (selectedIds.length === 0) return;
      Swal.fire({
        icon: "warning",
        title: "Delete Selected Bet Prizes",
        text: `Are you sure you want to delete ${selectedIds.length} bet prize(s)?`,
        showCancelButton: true,
        reverseButtons: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await Promise.all(
              selectedIds.map((id) =>
                updateBetPrize({ variables: { id, isArchive: true } }),
              ),
            );
            await fetchBetPrizes();
            await fetchAllBetPrizes();
            Swal.fire({
              icon: "success",
              title: "Delete Bet Prizes",
              text: `Bet prizes successfully deleted!`,
            });
            resetSelectedRows();
          } catch (e) {
            Swal.fire({
              icon: "error",
              title: "Delete Bet Prizes",
              text: `Error occurred while deleting: ${e}`,
            });
          }
        }
      });
    },
    [betPrizes, fetchAllBetPrizes, fetchBetPrizes, updateBetPrize],
  );

  const handleDeletePrize = useCallback(
    (id: string) => {
      Swal.fire({
        icon: "warning",
        title: "Delete Bet Prize",
        text: "Are you sure you want to delete this bet prize?",
        showCancelButton: true,
        reverseButtons: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await updateBetPrize({ variables: { id, isArchive: true } });
            await fetchBetPrizes();
            await fetchAllBetPrizes();
            Swal.fire({
              icon: "success",
              title: "Delete Bet Prize",
              text: "Bet prize successfully deleted!",
            });
          } catch (e) {
            Swal.fire({
              icon: "error",
              title: "Delete Bet Prize",
              text: `Error occurred while deleting: ${e}`,
            });
          }
        }
      });
    },
    [fetchAllBetPrizes, fetchBetPrizes, updateBetPrize],
  );

  const handleViewPrize = (prize: BetPrizeListItem) => {
    setSelectedPrize(prize);
    setViewModalOpen(true);
  };
  const handleOpenUpdateModal = (prize: BetPrizeListItem) => {
    setUpdatePrize(prize);
    setUpdateModalOpen(true);
  };

  const handleUpdatePrize = async (fields: {
    bet_amount: number;
    prize: number;
    is_active: boolean;
    super_jackpot?: boolean;
    super_jackpot_multiplier?: number | "";
    betTypeId: string;
  }) => {
    if (!updatePrize) return;
    try {
      const updateResponse = await updateBetPrize({
        variables: {
          id: updatePrize.id,
          betAmount: fields.bet_amount,
          prize: fields.prize,
          isActive: fields.is_active,
          betTypeId: fields.betTypeId !== "" ? fields.betTypeId : null,
          superJackpot: fields.super_jackpot,
          superJackpotMultiplier: fields.super_jackpot_multiplier
            ? Number(fields.super_jackpot_multiplier)
            : 0,
        },
      });
      if (
        updateResponse &&
        updateResponse.data?.updatebet_prizesCollection.records.length === 0
      ) {
        throw new Error("No records were updated. Please try again.");
      }

      Swal.fire({
        icon: "success",
        title: "Update Bet Prize",
        text: "Bet prize successfully updated!",
      });
      await fetchBetPrizes();
      await fetchAllBetPrizes();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Update Bet Prize",
        text: `Error occurred while updating: ${e}`,
      });
    }
    setUpdateModalOpen(false);
  };

  const columns = useMemo(() => {
    return {
      length: 7,
      render: (
        <>
          <th
            scope="col"
            onClick={() => handleSort("game_type")}
            className="relative px-4 py-3 cursor-pointer"
          >
            Game Type
            {renderSortIcon(
              sortConfig.column,
              "game_type",
              sortConfig.direction,
            )}
          </th>
          <th
            scope="col"
            onClick={() => handleSort("bet_type_name")}
            className="relative px-4 py-3 cursor-pointer"
          >
            Bet Type
            {renderSortIcon(
              sortConfig.column,
              "bet_type_name",
              sortConfig.direction,
            )}
          </th>
          <th
            scope="col"
            onClick={() => handleSort("draw_time")}
            className="relative px-4 py-3 cursor-pointer"
          >
            Draw Time
            {renderSortIcon(
              sortConfig.column,
              "draw_time",
              sortConfig.direction,
            )}
          </th>
          <th
            scope="col"
            onClick={() => handleSort("name")}
            className="relative px-4 py-3 cursor-pointer"
          >
            Draw Name
            {renderSortIcon(sortConfig.column, "name", sortConfig.direction)}
          </th>
          <th
            scope="col"
            onClick={() => handleSort("bet_amount")}
            className="relative px-4 py-3 cursor-pointer"
          >
            Bet Amount
            {sortConfig.column === "bet_amount" ? (
              sortConfig.direction === "AscNullsFirst" ? (
                <ChevronUp className="absolute right-2 top-4 w-4 h-4" />
              ) : (
                <ChevronDown className="absolute right-2 top-4 w-4 h-4" />
              )
            ) : (
              <ChevronsUpDown className="absolute right-2 top-4 w-4 h-4" />
            )}
          </th>
          <th
            scope="col"
            onClick={() => handleSort("prize")}
            className="relative px-4 py-3 cursor-pointer"
          >
            Prize
            {sortConfig.column === "prize" ? (
              sortConfig.direction === "AscNullsFirst" ? (
                <ChevronUp className="absolute right-2 top-4 w-4 h-4" />
              ) : (
                <ChevronDown className="absolute right-2 top-4 w-4 h-4" />
              )
            ) : (
              <ChevronsUpDown className="absolute right-2 top-4 w-4 h-4" />
            )}
          </th>
          <th scope="col" className="relative px-4 py-3 cursor-pointer">
            Active
          </th>
        </>
      ),
    };
  }, [handleSort, sortConfig.column, sortConfig.direction]);

  const tableData = useMemo(() => {
    return (
      betPrizes.map((prize) => {
        return {
          gameType: prize.lotto_types.game_type,
          betType: prize.bet_types?.name ?? "-",
          drawTime: formatTo12h(prize.lotto_types.draw_time),
          drawName: prize.lotto_types.name,
          betAmount: formatCurrency(prize.bet_amount),
          prize: formatCurrency(prize.prize),
          active: prize.is_active ? (
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-yellow-500" />
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
                <X className="w-3 h-3 text-red-500" />
              </div>
            </div>
          ),
          action: (
            <td className="flex gap-2 px-4 py-3 items-center justify-end">
              <div className="relative flex flex-col items-center group">
                <IconTableActionButton
                  type="button"
                  onClick={() => handleViewPrize(prize)}
                >
                  <Eye className="w-5 h-5" />
                </IconTableActionButton>
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center">
                  <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-900 shadow-lg rounded-md">
                    View
                  </span>
                  <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-900"></div>
                </div>
              </div>
              <div className="relative flex flex-col items-center group">
                <IconTableActionButton
                  type="button"
                  onClick={() => handleOpenUpdateModal(prize)}
                >
                  <SquarePen className="w-5 h-5" />
                </IconTableActionButton>
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center">
                  <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-900 shadow-lg rounded-md">
                    Edit
                  </span>
                  <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-900"></div>
                </div>
              </div>
              <div className="relative flex flex-col items-center group">
                <IconTableActionButton
                  type="button"
                  onClick={() => handleDeletePrize(prize.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </IconTableActionButton>
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center">
                  <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-900 shadow-lg rounded-md">
                    Delete
                  </span>
                  <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-900"></div>
                </div>
              </div>
            </td>
          ),
        };
      }) ?? []
    );
  }, [betPrizes, handleDeletePrize]);

  return (
    <AdminTemplate>
      <div className="w-full px-4 sm:mx-2 md:mx-10 py-6">
        <div className="flex items-center justify-between mb-8">
          <Headline>Bet Prizes</Headline>
          <PrimaryButton onClick={() => navigate("./create")}>
            Create Bet Prize
          </PrimaryButton>
        </div>
        <DataTable
          loading={loading || updateBetPrizeLoading}
          error={error ?? undefined}
          tableName="Bet Prize"
          columns={columns}
          data={tableData}
          pagination={{
            currentPage,
            totalCount,
            pageSize,
          }}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          hasNextPage={hasNextPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          onDeleteSelected={handleBulkDelete}
          tableFilter={tableFilter}
        />
        <ViewBetPrizeModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          prize={selectedPrize}
        />
        <UpdateBetPrizeModal
          open={updateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
          prize={updatePrize}
          onUpdate={handleUpdatePrize}
        />
      </div>
    </AdminTemplate>
  );
};

export default BetPrizesPage;
