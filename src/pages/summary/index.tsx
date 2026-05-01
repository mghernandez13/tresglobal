import React, { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_LOTTO_TYPES } from "../../graphql/queries/lotto";
import SelectWithSearch from "../../components/generic/SelectWithSearch";
import Headline from "../../components/generic/Headline";
import Input from "../../components/generic/Input";
import PrimaryButton from "../../components/generic/buttons/Primary";
import AdminTemplate from "../../templates/AdminTemplate";
import type { LottoQueryData, LottoQueryVariables } from "../../types/api";
import TertiaryButton from "../../components/generic/buttons/Tertiary";

const SummaryPage: React.FC = () => {
  // Lotto type selection
  const [selectedLottoType, setSelectedLottoType] = useState<string>("");

  // Placeholder state for date pickers
  const [displayDate, setDisplayDate] = useState("2026-04-13");
  const [startDate, setStartDate] = useState("2026-04-05");
  const [endDate, setEndDate] = useState("2026-04-13");

  // Fetch lotto types for dropdown
  const { data: lottoTypesData } = useQuery<
    LottoQueryData,
    LottoQueryVariables
  >(GET_LOTTO_TYPES, {
    variables: {
      first: 100,
      offset: 0,
      filter: {},
      sortOrder: [{ name: "AscNullsFirst" }],
    },
    fetchPolicy: "network-only",
  });

  const lottoTypeOptions = useMemo(() => {
    return (
      lottoTypesData?.lotto_typesCollection?.edges?.map(({ node }) => ({
        id: node.id,
        value: node.id,
        label: node.name,
        level: 0,
      })) || []
    );
  }, [lottoTypesData?.lotto_typesCollection?.edges]);

  // Placeholder values for summary cards
  const summary = {
    totalBets: 656,
    winningCombination: "--",
    jackpotWinners: "--",
    rbWinners: "--",
    grossSales: "18,735.00",
    netSales: "14,895.00",
    totalRemittance: "5,247.00",
    totalJackpot: "--",
  };

  // Set default selected lotto type to the first option when options load
  React.useEffect(() => {
    if (lottoTypeOptions.length > 0 && !selectedLottoType) {
      setSelectedLottoType(lottoTypeOptions[0].value);
    }
  }, [lottoTypeOptions, selectedLottoType]);

  return (
    <AdminTemplate>
      <div className="w-full h-min-screen px-4 sm:mx-2 my-6 md:mx-10 min-h-screen bg-white dark:bg-gray-800 p-8 rounded-2xl">
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
          {/* Lotto type dropdown and date selectors */}
          <div className="flex flex-wrap gap-4 items-end mb-2">
            {/* Lotto Type Dropdown */}
            <div className="flex flex-col min-w-[220px]">
              <label className="text-gray-300 text-sm mb-1">Lotto Type</label>
              <SelectWithSearch
                data={lottoTypeOptions}
                preSelectedOption={
                  lottoTypeOptions.find(
                    (opt) => opt.value === selectedLottoType,
                  ) || null
                }
                handleFormChange={(option) =>
                  setSelectedLottoType(String(option.value))
                }
              />
            </div>
            {/* Date Inputs */}
            <div className="flex flex-col">
              <label className="text-gray-300 text-sm mb-1">
                Select Date to Display Summary
              </label>
              <Input
                type="date"
                value={displayDate}
                onChange={(e) => setDisplayDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-300 text-sm mb-1">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <PrimaryButton>Download Report</PrimaryButton>
          </div>

          {/* Headline */}
          <Headline className="text-center mt-2 mb-4">
            Daily Summary (April 13, 2026)
          </Headline>

          {/* Lotto logo centered */}
          <div className="flex justify-center my-4">
            {(() => {
              const selected =
                lottoTypesData?.lotto_typesCollection?.edges?.find(
                  ({ node }) => node.id === selectedLottoType,
                );
              const logoSrc = selected?.node.logo_image
                ? selected.node.logo_image.startsWith("http")
                  ? selected.node.logo_image
                  : `/images/lotto/${selected.node.logo_image}`
                : "/images/lotto/grandlotto.png";
              return (
                <img
                  src={logoSrc}
                  alt={
                    selected?.node.name
                      ? `${selected.node.name} Logo`
                      : "Lotto Logo"
                  }
                  className="h-36 w-auto"
                  style={{ filter: "drop-shadow(0 0 8px #000)" }}
                />
              );
            })()}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-4">
            <PrimaryButton>Download Agent Summary</PrimaryButton>
            <PrimaryButton>Download Bets</PrimaryButton>
            <TertiaryButton>Reload</TertiaryButton>
          </div>

          {/* Summary cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2">
            <div className="bg-[#232b3b] rounded-lg p-6 text-center text-white">
              <div className="text-sm text-gray-400 mb-1">Total Bets</div>
              <div className="text-2xl font-bold">{summary.totalBets}</div>
            </div>
            <div className="bg-[#232b3b] rounded-lg p-6 text-center text-white">
              <div className="text-sm text-gray-400 mb-1">
                Winning Combination
              </div>
              <div className="text-2xl font-bold">
                {summary.winningCombination}
              </div>
            </div>
            <div className="bg-[#232b3b] rounded-lg p-6 text-center text-white">
              <div className="text-sm text-gray-400 mb-1">Jackpot Winners</div>
              <div className="text-2xl font-bold">{summary.jackpotWinners}</div>
            </div>
            <div className="bg-[#232b3b] rounded-lg p-6 text-center text-white">
              <div className="text-sm text-gray-400 mb-1">RB Winners</div>
              <div className="text-2xl font-bold">{summary.rbWinners}</div>
            </div>
            <div className="bg-[#232b3b] rounded-lg p-6 text-center text-white">
              <div className="text-sm text-gray-400 mb-1">Gross Sales</div>
              <div className="text-2xl font-bold">{summary.grossSales}</div>
            </div>
            <div className="bg-[#232b3b] rounded-lg p-6 text-center text-white">
              <div className="text-sm text-gray-400 mb-1">Net Sales</div>
              <div className="text-2xl font-bold">{summary.netSales}</div>
            </div>
            <div className="bg-[#232b3b] rounded-lg p-6 text-center text-white">
              <div className="text-sm text-gray-400 mb-1">Total Remittance</div>
              <div className="text-2xl font-bold">
                {summary.totalRemittance}
              </div>
            </div>
            <div className="bg-[#232b3b] rounded-lg p-6 text-center text-white">
              <div className="text-sm text-gray-400 mb-1">Total Jackpot</div>
              <div className="text-2xl font-bold">{summary.totalJackpot}</div>
            </div>
          </div>

          {/* Lotto Draws Summary Cards Grid */}
          <div className="mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 7, 8, 9].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-[#232b3b] rounded-xl shadow-lg p-4 flex flex-col items-center"
                >
                  {/* Lotto Logo */}
                  <img
                    // src={`/images/lotto/2d_${idx === 0 ? "default" : idx === 1 ? "2pm" : idx === 2 ? "5pm" : "9pm"}.png`}
                    src={
                      idx <= 3
                        ? `https://lnnpmtjuzgrcdtusfrty.supabase.co/storage/v1/object/public/app/lotto-types/3D%20Lotto%20Logo.png`
                        : `https://lnnpmtjuzgrcdtusfrty.supabase.co/storage/v1/object/public/app/lotto-types/2D%20Lotto%20Logo.png`
                    }
                    alt={`2D Lotto ${idx === 0 ? "" : idx === 1 ? "2PM" : idx === 2 ? "5PM" : "9PM"} Logo`}
                    className="h-20 w-auto mb-2"
                    style={{ filter: "drop-shadow(0 0 8px #000)" }}
                  />
                  {/* Draw Date */}
                  <div className="text-gray-200 text-center text-sm mb-4">
                    April 30, 2026
                  </div>
                  {/* Stats Grid */}
                  <div className="w-full grid grid-cols-1 gap-2">
                    <div className="bg-gray-800 rounded p-2 flex flex-col items-center">
                      <span className="text-xs text-gray-400">Total Bets</span>
                      <span className="text-lg font-bold text-white">0</span>
                    </div>
                    <div className="bg-gray-800 rounded p-2 flex flex-col items-center">
                      <span className="text-xs text-gray-400">
                        Combinations
                      </span>
                      <span className="text-lg font-bold text-white">--</span>
                    </div>
                    <div className="bg-gray-800 rounded p-2 flex flex-col items-center">
                      <span className="text-xs text-gray-400">Winners</span>
                      <span className="text-lg font-bold text-white">0</span>
                    </div>
                    <div className="bg-gray-800 rounded p-2 flex flex-col items-center">
                      <span className="text-xs text-gray-400">Net Sales</span>
                      <span className="text-lg font-bold text-white">--</span>
                    </div>
                    <div className="bg-gray-800 rounded p-2 flex flex-col items-center">
                      <span className="text-xs text-gray-400">Remittance</span>
                      <span className="text-lg font-bold text-white">--</span>
                    </div>
                    <div className="bg-gray-800 rounded p-2 flex flex-col items-center">
                      <span className="text-xs text-gray-400">Total Prize</span>
                      <span className="text-lg font-bold text-white">--</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hierarchical Team Table */}
          <div className="mt-10">
            <div
              className="overflow-x-auto rounded-lg border border-gray-700"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <table className="min-w-[1200px] text-sm text-left text-gray-300">
                <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2" rowSpan={2}>
                      Head Admin
                    </th>
                    <th className="px-4 py-2" rowSpan={2}>
                      Admin
                    </th>
                    <th className="px-4 py-2" rowSpan={2}>
                      Total Overall
                    </th>
                    <th className="px-4 py-2" rowSpan={2}>
                      %
                    </th>
                    <th className="px-4 py-2 text-center" colSpan={7}>
                      Remittance
                    </th>
                    <th className="px-4 py-2 text-center" colSpan={1}>
                      LP3
                    </th>
                    <th className="px-4 py-2 text-center" colSpan={4}>
                      3D
                    </th>
                    <th className="px-4 py-2 text-center" colSpan={4}>
                      2D
                    </th>
                  </tr>
                  <tr>
                    <th className="px-2 py-2">ALL</th>
                    <th className="px-2 py-2">LP3</th>
                    <th className="px-2 py-2">2D 2PM</th>
                    <th className="px-2 py-2">2D 5PM</th>
                    <th className="px-2 py-2">2D 9PM</th>
                    <th className="px-2 py-2">3D 2PM</th>
                    <th className="px-2 py-2">3D 5 PM</th>
                    <th className="px-2 py-2">6/55 9PM</th>
                    <th className="px-2 py-2">3D 2PM</th>
                    <th className="px-2 py-2">3D 5PM</th>
                    <th className="px-2 py-2">3D 9PM</th>
                    <th className="px-2 py-2">3D Net</th>
                    <th className="px-2 py-2">2D 2PM</th>
                    <th className="px-2 py-2">2D 5PM</th>
                    <th className="px-2 py-2">2D 9PM</th>
                    <th className="px-2 py-2">2D Net</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Example group 1 */}
                  <tr className="bg-gray-800 font-semibold">
                    <td className="px-4 py-2">Adder</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">60%</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Alexandra</td>
                    <td className="px-4 py-2">Alexandra 1</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">60%</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">Alexandra 2</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">60%</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                  </tr>
                  <tr className="font-bold">
                    <td className="px-4 py-2" colSpan={3}>
                      TEAM TOTAL OVERALL
                    </td>
                    <td className="px-4 py-2">60%</td>
                    <td className="px-4 py-2" colSpan={8}></td>
                  </tr>
                  {/* Example group 2 */}
                  <tr className="bg-gray-800 font-semibold">
                    <td className="px-4 py-2">Amanda Es</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">50%</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">Amanda-haven</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">70%</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">Dion</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">70%</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                  </tr>
                  {/* <tr className="bg-gray-700 font-bold"> */}
                  <tr className="font-bold">
                    <td className="px-4 py-2" colSpan={3}>
                      TEAM TOTAL OVERALL
                    </td>
                    <td className="px-4 py-2">60%</td>
                    <td className="px-4 py-2" colSpan={8}></td>
                  </tr>
                  {/* Add more groups as needed */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default SummaryPage;
