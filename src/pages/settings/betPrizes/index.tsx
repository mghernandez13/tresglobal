import { useMutation } from "@apollo/client/react";
import Swal from "sweetalert2";
import Headline from "../../../components/generic/Headline";
import AdminTemplate from "../../../templates/AdminTemplate";
import DataTable from "../../../components/generic/table";
import { useQuery } from "@apollo/client/react";
import {
  GET_BET_PRIZES,
  UPDATE_BET_PRIZE,
} from "../../../graphql/queries/betPrizes";
import { useSearchParams } from "react-router-dom";
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
import type {
  BetPrizesQueryData,
  BetPrizesQueryVariables,
  LottoQueryData,
  LottoQueryVariables,
} from "../../../types/api";
import { formatTo12h } from "../../../utils/helper";
import { GET_LOTTO_TYPES } from "../../../graphql/queries/lotto";
import ViewBetPrizeModal from "../../../components/modals/betPrizes/ViewBetPrizeModal";
import UpdateBetPrizeModal from "../../../components/modals/betPrizes/UpdateBetPrizeModal";
import { formatCurrency } from "../../../utils/currency";

const BetPrizesPage: React.FC = () => {
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
  const [orderBy, setOrderBy] = useState<Record<string, string>[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<
    BetPrizesQueryData["bet_prizesCollection"]["edges"][0]["node"] | null
  >(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updatePrize, setUpdatePrize] = useState<
    BetPrizesQueryData["bet_prizesCollection"]["edges"][0]["node"] | null
  >(null);
  const offset = (currentPage - 1) * pageSize;

  const searchTerm = useMemo(() => {
    return searchQuery ? `%${searchQuery}%` : "%";
  }, [searchQuery]);

  // Query lotto types for search
  const { data: lottoData } = useQuery<LottoQueryData, LottoQueryVariables>(
    GET_LOTTO_TYPES,
    {
      variables: {
        first: 100,
        offset: 0,
        searchTerm,
        filter: {
          and: [
            {
              or: [
                { game_type: { ilike: searchTerm } },
                { name: { ilike: searchTerm } },
              ],
            },
            { is_archive: { eq: false } },
          ],
        },
        sortOrder: [{ name: "AscNullsFirst" }],
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "network-only",
    },
  );

  const lottoTypeIds = useMemo(() => {
    if (!searchQuery) return undefined;
    return (
      lottoData?.lotto_typesCollection?.edges
        ?.map((e) => e.node?.id)
        .filter(Boolean) ?? []
    );
  }, [lottoData, searchQuery]);

  const betPrizesFilter = useMemo(() => {
    const and: unknown[] = [{ is_archive: { eq: false } }];

    if (searchQuery) {
      and.unshift({ lotto_type_id: { in: lottoTypeIds ?? [] } });
    }

    return { and };
  }, [lottoTypeIds, searchQuery]);

  const [updateBetPrize, { loading: updateBetPrizeLoading }] = useMutation(
    UPDATE_BET_PRIZE,
    {
      refetchQueries: [
        {
          query: GET_BET_PRIZES,
          variables: {
            first: pageSize,
            offset,
            orderBy,
            filter: betPrizesFilter,
          },
        },
      ],
    },
  );

  const { data, loading, error } = useQuery<
    BetPrizesQueryData,
    BetPrizesQueryVariables
  >(GET_BET_PRIZES, {
    variables: {
      first: pageSize,
      offset,
      orderBy,
      filter: betPrizesFilter,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
  });

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
          const prize = data?.bet_prizesCollection?.edges?.[index]?.node;
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
    [updateBetPrize, data],
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
    [updateBetPrize],
  );

  const handleViewPrize = (
    prize: BetPrizesQueryData["bet_prizesCollection"]["edges"][0]["node"],
  ) => {
    setSelectedPrize(prize);
    setViewModalOpen(true);
  };
  const handleOpenUpdateModal = (
    prize: BetPrizesQueryData["bet_prizesCollection"]["edges"][0]["node"],
  ) => {
    setUpdatePrize(prize);
    setUpdateModalOpen(true);
  };

  const handleUpdatePrize = async (fields: {
    bet_amount: number;
    prize: number;
    is_active: boolean;
  }) => {
    console.log("Updating prize with fields:", fields);
    if (!updatePrize) return;
    try {
      await updateBetPrize({
        variables: {
          id: updatePrize.id,
          betAmount: fields.bet_amount,
          prize: fields.prize,
          isActive: fields.is_active,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Update Bet Prize",
        text: "Bet prize successfully updated!",
      });
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
          </th>
          <th
            scope="col"
            onClick={() => handleSort("draw_time")}
            className="relative px-4 py-3 cursor-pointer"
          >
            Draw Time
          </th>
          <th
            scope="col"
            onClick={() => handleSort("name")}
            className="relative px-4 py-3 cursor-pointer"
          >
            Draw Name
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
      data?.bet_prizesCollection?.edges?.map((item) => {
        const prize = item.node;
        return {
          gameType: prize.lotto_types.game_type,
          drawTime: formatTo12h(prize.lotto_types.draw_time),
          drawName: prize.lotto_types.name,
          betAmount: formatCurrency(prize.bet_amount),
          prize: formatCurrency(prize.prize),
          active: prize.is_active ? (
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-green-500" />
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
                <button
                  className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                  type="button"
                  onClick={() => handleViewPrize(prize)}
                >
                  <Eye className="w-5 h-5" />
                </button>
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center">
                  <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-900 shadow-lg rounded-md">
                    View
                  </span>
                  <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-900"></div>
                </div>
              </div>
              <div className="relative flex flex-col items-center group">
                <button
                  className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                  type="button"
                  onClick={() => handleOpenUpdateModal(prize)}
                >
                  <SquarePen className="w-5 h-5" />
                </button>
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center">
                  <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-900 shadow-lg rounded-md">
                    Edit
                  </span>
                  <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-900"></div>
                </div>
              </div>
              <div className="relative flex flex-col items-center group">
                <button
                  className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                  type="button"
                  onClick={() => handleDeletePrize(prize.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
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
  }, [data?.bet_prizesCollection?.edges, handleDeletePrize]);

  const totalCount = data?.bet_prizesCollection?.totalCount ?? 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrderBy([{ [sortConfig.column]: sortConfig.direction }]);
  }, [sortConfig]);

  return (
    <AdminTemplate>
      <div className="w-full px-4 sm:mx-2 md:mx-10 py-6">
        <div className="flex items-center justify-between mb-8">
          <Headline>Bet Prizes</Headline>
        </div>
        <DataTable
          loading={loading || updateBetPrizeLoading}
          error={error}
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
          hasNextPage={
            data?.bet_prizesCollection?.pageInfo?.hasNextPage ?? false
          }
          pageSize={pageSize}
          setPageSize={setPageSize}
          onDeleteSelected={handleBulkDelete}
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
