import AdminTemplate from "../../templates/AdminTemplate";
import DataTable from "../../components/generic/table";
import Headline from "../../components/generic/Headline";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { GET_BETS } from "../../graphql/queries/bets";
import { GET_USERS } from "../../graphql/queries/user";
import { GET_LOTTO_TYPES } from "../../graphql/queries/lotto";
import { GET_BET_TYPES } from "../../graphql/queries/betTypes";
import type {
  BetsQueryData,
  Bets,
  BetTypesQueryData,
  LottoQueryData,
  QueryParamsVariables,
  UsersQueryData,
  UsersQueryVariables,
} from "../../types/api";
import { Eye } from "lucide-react";
import ViewBetModal from "../../components/modals/bets/ViewBetModal";
import { formatTo12h } from "../../utils/helper";
import { formatCurrency } from "../../utils/currency";

const BetsPage: React.FC = () => {
  const [pageSize, setPageSize] = useState(5);
  const [selectedLottoTypes, setSelectedLottoTypes] = useState<string[]>([]);
  const [selectedBetTypes, setSelectedBetTypes] = useState<string[]>([]);
  // Date range filter state
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bets | null>(null);
  // Fetch lotto types and bet types for filters
  const { data: lottoTypesData } = useQuery<LottoQueryData>(GET_LOTTO_TYPES, {
    fetchPolicy: "network-only",
  });
  const { data: betTypesData } = useQuery<BetTypesQueryData>(GET_BET_TYPES, {
    fetchPolicy: "network-only",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const currentPage = Number(searchParams.get("page")) || 1;
  const offset = (currentPage - 1) * pageSize;

  // 1. Search users by name/email if searchQuery is present
  const { data: usersData } = useQuery<UsersQueryData, UsersQueryVariables>(
    GET_USERS,
    {
      variables: {
        first: 10,
        offset: 0,
        searchTerm: searchQuery ? `%${searchQuery}%` : "%",
        sortOrder: [],
      },
      skip: !searchQuery,
      fetchPolicy: "network-only",
    },
  );

  // 2. Extract matching user IDs
  const matchingUserIds =
    usersData?.profilesCollection?.edges?.map((edge) => edge.node.id) || [];

  // 3. Compose filter for GET_BETS
  const betsFilter: Record<string, Record<string, unknown>[]> = {
    and: [
      {
        or: [
          ...(searchQuery && matchingUserIds.length > 0
            ? [{ agent_id: { in: matchingUserIds } }]
            : []),
          ...(searchQuery
            ? [
                { combination: { ilike: `%${searchQuery}%` } },
                { id: { eq: searchQuery } },
              ]
            : []),
        ],
      },
      ...(selectedLottoTypes.length > 0
        ? [{ lotto_type_id: { in: selectedLottoTypes } }]
        : []),
      ...(selectedBetTypes.length > 0
        ? [{ bet_type_id: { in: selectedBetTypes } }]
        : []),
      ...(dateRange.start && dateRange.end
        ? [
            {
              created_at: {
                gte: dateRange.start,
                lte: dateRange.end + "T23:59:59.999",
              },
            },
          ]
        : []),
      { is_archive: { eq: false } },
    ],
  };

  // If searching and no user matches and no combination search, return no results
  if (
    searchQuery &&
    matchingUserIds.length === 0 &&
    !searchQuery // This will never be true, so skip this block
  ) {
    betsFilter.and.unshift({ agent_id: { eq: "__NO_MATCH__" } });
  }

  // 4. Query bets
  const { data, loading, error } = useQuery<
    BetsQueryData,
    QueryParamsVariables
  >(GET_BETS, {
    variables: {
      first: pageSize,
      offset,
      searchTerm: searchQuery ? `%${searchQuery}%` : "%",
      filter: betsFilter,
      sortOrder: [],
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
  });

  const columns = useMemo(() => {
    return {
      length: 7,
      render: (
        <>
          <th scope="col" className="px-4 py-3">
            Details
          </th>
          <th scope="col" className="px-4 py-3">
            Combination
          </th>
          <th scope="col" className="px-4 py-3">
            Hit
          </th>
          <th scope="col" className="px-4 py-3">
            Prize
          </th>
          <th scope="col" className="px-4 py-3">
            Draw
          </th>
          <th scope="col" className="px-4 py-3">
            Bet
          </th>
          <th scope="col" className="px-4 py-3">
            Agent
          </th>
        </>
      ),
    };
  }, []);

  const tableData = useMemo(() => {
    return (
      data?.betsCollection?.edges?.map((item) => {
        return {
          details: (
            <div>
              <div>Added By: {item.node.profiles.full_name}</div>
              <div>On: {item.node.created_at}</div>
              <div>RefID: {item.node.id}</div>
              <div>DummyBet: {item.node.is_dummy_bet ? "Yes" : "No"}</div>
            </div>
          ),
          combination: item.node.combination,
          hit: item.node.hit ? "Yes" : "No",
          prize: formatCurrency(item.node.prize_amount) || "--",
          drawDate: (
            <div>
              <div>{formatTo12h(item.node.lotto_types.draw_time)}</div>
              <div>{item.node.lotto_types.name}</div>
            </div>
          ),
          bet: (
            <div>
              <div>PHP {item.node.bet_amount}</div>
              <div>{item.node.bet_types?.name}</div>
            </div>
          ),
          agent: item.node.profiles.full_name,
          action: (
            <td className="flex gap-2 px-4 py-3 items-center justify-end">
              <div className="relative flex flex-col items-center group">
                <button
                  id="apple-imac-27-dropdown-button"
                  data-tooltip-target="tooltip-default"
                  onClick={() => {
                    setSelectedBet(item.node);
                    setViewModalOpen(true);
                  }}
                  className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100 bg-transparent"
                  type="button"
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
            </td>
          ),
        };
      }) ?? []
    );
  }, [data]);

  const totalCount = data?.betsCollection.totalCount ?? 0;
  const hasNextPage = Boolean(data?.betsCollection?.pageInfo?.hasNextPage);

  // Prepare filter data for TableHeader
  // Calculate counts for each lotto type and bet type based on current bets data
  const bets = data?.betsCollection?.edges || [];
  const lottoTypeCounts: Record<string, number> = {};
  const betTypeCounts: Record<string, number> = {};
  bets.forEach((bet) => {
    const lottoId = bet.node.lotto_types?.id;
    const betTypeId = bet.node.bet_types?.id;
    if (lottoId) lottoTypeCounts[lottoId] = (lottoTypeCounts[lottoId] || 0) + 1;
    if (betTypeId)
      betTypeCounts[betTypeId] = (betTypeCounts[betTypeId] || 0) + 1;
  });

  // Use master data for filter counts (imitate agents table)
  const lottoTypeOptions =
    lottoTypesData &&
    lottoTypesData.lotto_typesCollection &&
    Array.isArray(lottoTypesData.lotto_typesCollection.edges)
      ? lottoTypesData.lotto_typesCollection.edges.map((edge) => ({
          name: edge.node.name,
          value: edge.node.id,
          count: edge.node?.betsCollection?.totalCount ?? 0,
        }))
      : [];
  const betTypeOptions =
    betTypesData &&
    betTypesData.bet_typesCollection &&
    Array.isArray(betTypesData.bet_typesCollection.edges)
      ? betTypesData.bet_typesCollection.edges.map((edge) => ({
          name: edge.node.name,
          value: edge.node.id,
          count: edge.node?.betsCollection?.totalCount ?? 0,
        }))
      : [];

  // Compose tableFilter prop for TableHeader as an object
  const tableFilter = {
    lottoType: {
      label: "Lotto Type",
      selectedFilter: selectedLottoTypes,
      setSelectedFilter: setSelectedLottoTypes,
      data: lottoTypeOptions,
    },
    betType: {
      label: "Bet Type",
      selectedFilter: selectedBetTypes,
      setSelectedFilter: setSelectedBetTypes,
      data: betTypeOptions,
    },
    dateRange: {
      label: "Date Filter",
      selectedFilter: [], // Not used for date
      setSelectedFilter: () => {}, // Not used for date
      data: [
        {
          name: "Date Filter",
          value: "date-filter",
          count: 0,
          start: dateRange.start,
          end: dateRange.end,
          setDateRange,
        },
      ],
    },
  };

  return (
    <AdminTemplate>
      <div className="flex-col w-full sm:mx-2 py-2 md:mx-10">
        <div className="mb-5">
          <Headline>Bets</Headline>
        </div>
        <DataTable
          loading={loading}
          error={error}
          tableName="Bets"
          columns={columns}
          data={tableData}
          pagination={{
            currentPage,
            pageSize,
            totalCount,
          }}
          tableFilter={tableFilter}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          hasNextPage={hasNextPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          bulkAction={false}
        />
        <ViewBetModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          bet={selectedBet}
        />
      </div>
    </AdminTemplate>
  );
};

export default BetsPage;
