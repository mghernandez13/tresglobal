import AdminTemplate from "../../templates/AdminTemplate";
import DataTable from "../../components/generic/table";
import Headline from "../../components/generic/Headline";
import { useState, useMemo, useEffect } from "react";
import UploadDummyBetModal from "../../components/modals/dummyBets/Upload";
import ViewBetModal from "../../components/modals/bets/ViewBetModal";
import { GET_AGENTS } from "../../graphql/queries/agents";
import { useQuery, useApolloClient } from "@apollo/client/react";
import { GET_LOTTO_TYPES } from "../../graphql/queries/lotto";
import { GET_BET_TYPES } from "../../graphql/queries/betTypes";
import { useSearchParams } from "react-router-dom";
import { GET_BETS } from "../../graphql/queries/bets";
import { Eye } from "lucide-react";
import { formatTo12h } from "../../utils/helper";
import type {
  AgentsQueryData,
  Bets,
  BetsQueryData,
  BetTypesQueryData,
  BetTypesQueryVariables,
  LottoQueryData,
  LottoQueryVariables,
  QueryParamsVariables,
} from "../../types/api";
import PrimaryButton from "../../components/generic/buttons/Primary";
import { formatCurrency } from "../../utils/currency";

const DummyBetsPage: React.FC = () => {
  const [pageSize, setPageSize] = useState(10);
  const [selectedLottoTypes, setSelectedLottoTypes] = useState<string[]>([]);
  const [selectedBetTypes, setSelectedBetTypes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bets | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const currentPage = Number(searchParams.get("page")) || 1;
  const offset = (currentPage - 1) * pageSize;

  const betsFilter = {
    and: [
      { is_dummy_bet: { eq: true } },
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

  const { data: lottoTypesData } = useQuery<
    LottoQueryData,
    LottoQueryVariables
  >(GET_LOTTO_TYPES, {
    variables: { first: 100, offset: 0 },
    fetchPolicy: "network-only",
  });
  const { data: betTypesData } = useQuery<
    BetTypesQueryData,
    BetTypesQueryVariables
  >(GET_BET_TYPES, {
    variables: { first: 100, offset: 0 },
    fetchPolicy: "network-only",
  });

  const { data: agentsData } = useQuery<AgentsQueryData, QueryParamsVariables>(
    GET_AGENTS,
    {
      variables: { first: 100, offset: 0, searchTerm: "%", sortOrder: [] },
      fetchPolicy: "network-only",
    },
  );

  // State to store counts
  const [lottoTypeCounts, setLottoTypeCounts] = useState<
    Record<string, number>
  >({});
  const [betTypeCounts, setBetTypeCounts] = useState<Record<string, number>>(
    {},
  );

  // Apollo client for direct queries
  const client = useApolloClient();

  // Fetch counts for all lotto types and bet types on mount or when data changes
  useEffect(() => {
    if (lottoTypesData?.lotto_typesCollection?.edges) {
      const fetchCounts = async () => {
        await Promise.all(
          lottoTypesData.lotto_typesCollection.edges.map(async (edge) => {
            const { data } = await client.query<
              BetsQueryData,
              QueryParamsVariables
            >({
              query: GET_BETS,
              variables: {
                first: 1,
                offset: 0,
                filter: {
                  and: [
                    { is_dummy_bet: { eq: true } },
                    { is_archive: { eq: false } },
                    { lotto_type_id: { eq: edge.node.id } },
                  ],
                },
                searchTerm: "%",
                sortOrder: [],
              },
              fetchPolicy: "network-only",
            });
            setLottoTypeCounts((prev) => ({
              ...prev,
              [edge.node.id]: data?.betsCollection?.totalCount || 0,
            }));
          }),
        );
      };
      fetchCounts();
    }
  }, [client, lottoTypesData]);

  useEffect(() => {
    if (betTypesData?.bet_typesCollection?.edges) {
      const fetchCounts = async () => {
        await Promise.all(
          betTypesData.bet_typesCollection.edges.map(async (edge) => {
            const { data } = await client.query<
              BetsQueryData,
              QueryParamsVariables
            >({
              query: GET_BETS,
              variables: {
                first: 1,
                offset: 0,
                filter: {
                  and: [
                    { is_dummy_bet: { eq: true } },
                    { is_archive: { eq: false } },
                    { bet_type_id: { eq: edge.node.id } },
                  ],
                },
                searchTerm: "%",
                sortOrder: [],
              },
              fetchPolicy: "network-only",
            });
            setBetTypeCounts((prev) => ({
              ...prev,
              [edge.node.id]: data?.betsCollection?.totalCount || 0,
            }));
          }),
        );
      };
      fetchCounts();
    }
  }, [client, betTypesData]);

  const lottoTypeOptions =
    lottoTypesData &&
    lottoTypesData.lotto_typesCollection &&
    Array.isArray(lottoTypesData.lotto_typesCollection.edges)
      ? lottoTypesData.lotto_typesCollection.edges.map((edge) => ({
          name: edge.node.name,
          value: edge.node.id,
          count: lottoTypeCounts[edge.node.id] || 0,
        }))
      : [];
  const betTypeOptions =
    betTypesData &&
    betTypesData.bet_typesCollection &&
    Array.isArray(betTypesData.bet_typesCollection.edges)
      ? betTypesData.bet_typesCollection.edges.map((edge) => ({
          name: edge.node.name,
          value: edge.node.id,
          count: betTypeCounts[edge.node.id] || 0,
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

  const agentOptions = useMemo(() => {
    return (
      agentsData?.profilesCollection?.edges?.map(({ node }) => ({
        label: node.full_name,
        value: node.id,
      })) ?? []
    );
  }, [agentsData]);

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
                  className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100 bg-transparent"
                  type="button"
                  onClick={() => {
                    setSelectedBet(item.node);
                    setViewModalOpen(true);
                  }}
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

  return (
    <AdminTemplate>
      <div className="flex-col w-full sm:mx-2 py-2 md:mx-10">
        <div className="mb-5 flex items-center justify-between">
          <Headline>Dummy Bets</Headline>
          <PrimaryButton onClick={() => setUploadModalOpen(true)}>
            Upload Dummy Bet
          </PrimaryButton>
          <UploadDummyBetModal
            isOpen={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            agentOptions={agentOptions}
            betsQueryVariables={{
              first: pageSize,
              offset,
              searchTerm: searchQuery ? `%${searchQuery}%` : "%",
              filter: betsFilter,
              sortOrder: [],
            }}
          />
          <ViewBetModal
            open={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            bet={selectedBet}
          />
        </div>
        <DataTable
          loading={loading}
          error={error}
          tableName="Dummy Bets"
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
      </div>
    </AdminTemplate>
  );
};

export default DummyBetsPage;
