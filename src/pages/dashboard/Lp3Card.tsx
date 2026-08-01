import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  BarChart as RechartsBarChart,
} from "recharts";
import Skeleton from "../../components/generic/Skeleton";
import { formatCurrency } from "../../utils/currency";
import { getDateRange } from "../../utils/datetime";
import { supabase } from "../../db/supabase";
import type { DashboardCardProps } from "../../types/generic";

interface Lp3BetStatsResponse {
  totalBets?: number;
  totalNormalBets?: number;
  totalReturnBets?: number;
  totalFreeBets?: number;
  totalPrize?: number;
  dailyGrossSale?: Record<string, number>;
  dailyNetSale?: Record<string, number>;
  dailyFreeBetWinners?: Record<string, number>;
  dailyNormalBetWinners?: Record<string, number>;
  dailyReturnBetWinners?: Record<string, number>;
  dailySuperJackpotWinners?: Record<string, number>;
}

interface Lp3BetStats {
  totalBets: number;
  totalNormalBets: number;
  totalReturnBets: number;
  totalFreeBets: number;
  totalPrize: number;
  dailyGrossSale: Record<string, number>;
  dailyNetSale: Record<string, number>;
  dailyFreeBetWinners: Record<string, number>;
  dailyNormalBetWinners: Record<string, number>;
  dailyReturnBetWinners: Record<string, number>;
  dailySuperJackpotWinners: Record<string, number>;
}

const BAR_WIDTH = 60;
const EMPTY_STATS: Lp3BetStats = {
  totalBets: 0,
  totalNormalBets: 0,
  totalReturnBets: 0,
  totalFreeBets: 0,
  totalPrize: 0,
  dailyGrossSale: {},
  dailyNetSale: {},
  dailyFreeBetWinners: {},
  dailyNormalBetWinners: {},
  dailyReturnBetWinners: {},
  dailySuperJackpotWinners: {},
};

const Lp3Card: React.FC<DashboardCardProps> = ({ startDate, endDate }) => {
  const [stats, setStats] = useState<Lp3BetStats>(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(false);

  const dateRange = getDateRange(startDate, endDate);

  const formatDateForDisplay = (date: string) => {
    const [, month, day] = date.split("-");
    return `${month}-${day}`;
  };

  const dailySalesData = dateRange.map((date) => ({
    date: formatDateForDisplay(date),
    grossSales: stats.dailyGrossSale[date] ?? 0,
    netSales: stats.dailyNetSale[date] ?? 0,
  }));

  const dailyWinnersData = dateRange.map((date) => {
    const normalWinners = stats.dailyNormalBetWinners[date] ?? 0;
    const returnBetWinners = stats.dailyReturnBetWinners[date] ?? 0;
    const freeBetWinners = stats.dailyFreeBetWinners[date] ?? 0;
    const superJackpotWinners = stats.dailySuperJackpotWinners[date] ?? 0;

    return {
      date: formatDateForDisplay(date),
      normalWinners,
      returnBetWinners,
      freeBetWinners,
      superJackpotWinners,
    };
  });

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setStatsLoading(true);

      try {
        const { data, error } = await supabase.functions.invoke(
          "dashboard-lp3-bet-stats",
          {
            body: {
              startDate,
              endDate,
            },
          },
        );

        if (error) {
          throw error;
        }

        const payload = (data ?? {}) as Lp3BetStatsResponse;

        if (!cancelled) {
          setStats({
            totalBets: payload.totalBets ?? 0,
            totalNormalBets: payload.totalNormalBets ?? 0,
            totalReturnBets: payload.totalReturnBets ?? 0,
            totalFreeBets: payload.totalFreeBets ?? 0,
            totalPrize: payload.totalPrize ?? 0,
            dailyGrossSale: payload.dailyGrossSale ?? {},
            dailyNetSale: payload.dailyNetSale ?? {},
            dailyFreeBetWinners: payload.dailyFreeBetWinners ?? {},
            dailyNormalBetWinners: payload.dailyNormalBetWinners ?? {},
            dailyReturnBetWinners: payload.dailyReturnBetWinners ?? {},
            dailySuperJackpotWinners: payload.dailySuperJackpotWinners ?? {},
          });
        }
      } catch (error) {
        console.error("Failed to fetch LP3 bet stats:", error);
        if (!cancelled) {
          setStats(EMPTY_STATS);
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    };

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const lp3TotalBets = stats.totalBets;
  const lp3NormalBets = stats.totalNormalBets;
  const lp3RbBets = stats.totalReturnBets;
  const lp3FreeBets = stats.totalFreeBets;
  const totalPrize = stats.totalPrize;

  return (
    <div className="w-full mx-auto mt-10">
      {/* Enhanced Summary Card - Responsive */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-black rounded-2xl p-6 shadow-2xl border border-[#2d3748]">
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          {statsLoading ? (
            <Skeleton width={75} height={75} />
          ) : (
            <div className="w-20 h-20 mb-4 sm:mb-0 sm:mr-4 flex items-center justify-center bg-white rounded-xl shadow-md border-2 border-[#fbbf24]">
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="https://lnnpmtjuzgrcdtusfrty.supabase.co/storage/v1/object/public/app/lotto-types/Grandlotto655.png"
                  alt="LP3 Draw Logo"
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row gap-4 sm:gap-8 w-full md:w-auto mt-4 md:mt-0">
            {/* Total Bets */}
            <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
              <span className="text-sm text-slate-400 font-medium tracking-wide">
                Total Bets
              </span>

              <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                {statsLoading ? (
                  <Skeleton className="mt-2" width={50} height={40} />
                ) : (
                  lp3TotalBets
                )}
              </span>
            </div>
            {/* Divider */}
            <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
            <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
              <span className="text-sm text-slate-400 font-medium tracking-wide">
                Total Normal Bets
              </span>
              <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                {statsLoading ? (
                  <Skeleton className="mt-2" width={50} height={40} />
                ) : (
                  lp3NormalBets
                )}
              </span>
            </div>
            <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
            <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
              <span className="text-sm text-slate-400 font-medium tracking-wide">
                Total Return Bets
              </span>
              <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                {statsLoading ? (
                  <Skeleton className="mt-2" width={50} height={40} />
                ) : (
                  lp3RbBets
                )}
              </span>
            </div>
            <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
            <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
              <span className="text-sm text-slate-400 font-medium tracking-wide">
                Total Free Bets
              </span>
              <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                {statsLoading ? (
                  <Skeleton className="mt-2" width={50} height={40} />
                ) : (
                  lp3FreeBets
                )}
              </span>
            </div>
            <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
            <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
              <span className="text-sm text-slate-400 font-medium tracking-wide">
                Total Prize
              </span>
              <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                {statsLoading ? (
                  <Skeleton className="mt-2" width={50} height={40} />
                ) : (
                  formatCurrency(totalPrize)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Bar Graphs Row */}
      <div className="w-full flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sales Bar Graph */}
          <div className="flex-1 bg-black rounded-2xl p-4 sm:p-8 shadow-2xl border border-[#2d3748] transition-transform hover:scale-[1.02] min-w-0">
            <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div
                style={{
                  minWidth: `${Math.max(dailySalesData.length, 1) * BAR_WIDTH}px`,
                }}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsBarChart
                    data={dailySalesData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip
                      contentStyle={{
                        background: "#1f2937",
                        border: "none",
                        color: "#fff",
                      }}
                    />
                    <Legend wrapperStyle={{ color: "#fff" }} />
                    <Bar
                      dataKey="grossSales"
                      fill="#fbbf24"
                      name="Gross Sales"
                    />
                    <Bar dataKey="netSales" fill="#60a5fa" name="Net Sales" />
                    {/* <Bar dataKey="remittance" fill="#34d399" name="Total Remittance" /> */}
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Jackpot & RB Winners Bar Graph */}
          <div className="flex-1 bg-black rounded-2xl p-4 sm:p-8 shadow-2xl border border-[#2d3748] transition-transform hover:scale-[1.02] min-w-0">
            <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div
                style={{
                  minWidth: `${Math.max(dailyWinnersData.length, 1) * BAR_WIDTH}px`,
                }}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsBarChart
                    data={dailyWinnersData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip
                      contentStyle={{
                        background: "#1f2937",
                        border: "none",
                        color: "#fff",
                      }}
                    />
                    <Legend wrapperStyle={{ color: "#fff" }} />
                    <Bar
                      dataKey="normalWinners"
                      fill="#60a5fa"
                      name="Jackpot Winners"
                    />
                    <Bar
                      dataKey="returnBetWinners"
                      fill="#42dfcc"
                      name="RB Winners"
                    />
                    <Bar
                      dataKey="freeBetWinners"
                      fill="#22c55e"
                      name="FB Winners"
                    />
                    <Bar
                      dataKey="superJackpotWinners"
                      fill="#f97316"
                      name="Super Jackpot Winners"
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lp3Card;
