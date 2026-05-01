import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Input from "../../components/generic/Input";
import AdminTemplate from "../../templates/AdminTemplate";

// Dummy data for demonstration
const initialData = [
  {
    date: "2026-04-01",
    grossSales: 12000,
    netSales: 9000,
    remittance: 5000,
    jackpot: 2,
    rbWinners: 1,
    totalWinners: 3,
  },
  {
    date: "2026-04-02",
    grossSales: 15000,
    netSales: 11000,
    remittance: 6000,
    jackpot: 1,
    rbWinners: 2,
    totalWinners: 3,
  },
  {
    date: "2026-04-03",
    grossSales: 18000,
    netSales: 14000,
    remittance: 7000,
    jackpot: 3,
    rbWinners: 1,
    totalWinners: 4,
  },
  {
    date: "2026-04-04",
    grossSales: 17000,
    netSales: 13000,
    remittance: 6500,
    jackpot: 2,
    rbWinners: 3,
    totalWinners: 5,
  },
  {
    date: "2026-04-05",
    grossSales: 20000,
    netSales: 16000,
    remittance: 8000,
    jackpot: 4,
    rbWinners: 2,
    totalWinners: 6,
  },
  {
    date: "2026-04-06",
    grossSales: 20000,
    netSales: 16000,
    remittance: 8000,
    jackpot: 4,
    rbWinners: 2,
    totalWinners: 6,
  },
  {
    date: "2026-04-07",
    grossSales: 20000,
    netSales: 16000,
    remittance: 8000,
    jackpot: 4,
    rbWinners: 2,
    totalWinners: 6,
  },
  {
    date: "2026-04-08",
    grossSales: 20000,
    netSales: 16000,
    remittance: 8000,
    jackpot: 4,
    rbWinners: 2,
    totalWinners: 6,
  },
  {
    date: "2026-04-09",
    grossSales: 20000,
    netSales: 16000,
    remittance: 8000,
    jackpot: 4,
    rbWinners: 2,
    totalWinners: 6,
  },
  {
    date: "2026-04-10",
    grossSales: 20000,
    netSales: 16000,
    remittance: 8000,
    jackpot: 4,
    rbWinners: 2,
    totalWinners: 6,
  },
  {
    date: "2026-04-11",
    grossSales: 20000,
    netSales: 16000,
    remittance: 8000,
    jackpot: 4,
    rbWinners: 2,
    totalWinners: 6,
  },
  {
    date: "2026-04-12",
    grossSales: 20000,
    netSales: 16000,
    remittance: 8000,
    jackpot: 4,
    rbWinners: 2,
    totalWinners: 6,
  },
];

// Helper: Minimum width per bar (px)
const BAR_WIDTH = 60;

const DashboardPage: React.FC = () => {
  const [startDate, setStartDate] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2026-04-05");

  // Filter data by date range
  const filteredData = initialData.filter(
    (d) => d.date >= startDate && d.date <= endDate,
  );

  return (
    <AdminTemplate>
      <div className="w-full max-w-full mx-auto p-8">
        {/* Date Range Filter */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-8 items-center md:items-end justify-end">
          <div className="flex flex-col w-full md:w-40">
            <label className="text-gray-400 text-xs mb-1">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col w-full md:w-40">
            <label className="text-gray-400 text-xs mb-1">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full mx-auto mt-10">
          {/* Enhanced Summary Card - Responsive */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-gradient-to-r from-[#232b3b] to-[#1e2533] rounded-2xl p-6 shadow-2xl border border-[#2d3748]">
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
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
                  <img src="https://lnnpmtjuzgrcdtusfrty.supabase.co/storage/v1/object/public/app/lotto-types/Grandlotto655.png" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row gap-4 sm:gap-8 w-full md:w-auto mt-4 md:mt-0">
                {/* Total Bets */}
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Bets
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    750
                  </span>
                </div>
                {/* Divider */}
                <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Normal Bets
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    400
                  </span>
                </div>
                <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Return Bets
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    200
                  </span>
                </div>
                <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Free Bets
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    150
                  </span>
                </div>
                <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Jackpot Prize
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    250,000
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Bar Graphs Row */}
          <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sales Bar Graph */}
              <div className="flex-1 bg-gradient-to-br from-[#232b3b] to-[#1e2533] rounded-2xl p-4 sm:p-8 shadow-2xl border border-[#2d3748] transition-transform hover:scale-[1.02] min-w-0">
                <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div
                    style={{ minWidth: `${filteredData.length * BAR_WIDTH}px` }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={filteredData}
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
                        <Bar
                          dataKey="netSales"
                          fill="#60a5fa"
                          name="Net Sales"
                        />
                        {/* <Bar dataKey="remittance" fill="#34d399" name="Total Remittance" /> */}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              {/* Jackpot & RB Winners Bar Graph */}
              <div className="flex-1 bg-gradient-to-br from-[#232b3b] to-[#1e2533] rounded-2xl p-4 sm:p-8 shadow-2xl border border-[#2d3748] transition-transform hover:scale-[1.02] min-w-0">
                <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div
                    style={{ minWidth: `${filteredData.length * BAR_WIDTH}px` }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={filteredData}
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
                          dataKey="totalWinners"
                          fill="#fbbf24"
                          name="Total Winners"
                        />
                        <Bar
                          dataKey="jackpot"
                          fill="#60a5fa"
                          name="Jackpot Winners"
                        />
                        <Bar
                          dataKey="rbWinners"
                          fill="#42dfcc"
                          name="RB Winners"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full mx-auto mt-10">
          {/* Enhanced Summary Card - Responsive */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-gradient-to-r from-[#232b3b] to-[#1e2533] rounded-2xl p-6 shadow-2xl border border-[#2d3748]">
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
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
                  <img src="https://lnnpmtjuzgrcdtusfrty.supabase.co/storage/v1/object/public/app/lotto-types/Grandlotto655.png" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row gap-4 sm:gap-8 w-full md:w-auto mt-4 md:mt-0">
                {/* Total Bets */}
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Bets
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    750
                  </span>
                </div>
                {/* Divider */}
                <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Normal Bets
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    400
                  </span>
                </div>
                <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Return Bets
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    200
                  </span>
                </div>
                <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Free Bets
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    150
                  </span>
                </div>
                <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Jackpot Prize
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    250,000
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Bar Graphs Row */}
          <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sales Bar Graph */}
              <div className="flex-1 bg-gradient-to-br from-[#232b3b] to-[#1e2533] rounded-2xl p-4 sm:p-8 shadow-2xl border border-[#2d3748] transition-transform hover:scale-[1.02] min-w-0">
                <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div
                    style={{ minWidth: `${filteredData.length * BAR_WIDTH}px` }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={filteredData}
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
                        <Bar
                          dataKey="netSales"
                          fill="#60a5fa"
                          name="Net Sales"
                        />
                        {/* <Bar dataKey="remittance" fill="#34d399" name="Total Remittance" /> */}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              {/* Jackpot & RB Winners Bar Graph */}
              <div className="flex-1 bg-gradient-to-br from-[#232b3b] to-[#1e2533] rounded-2xl p-4 sm:p-8 shadow-2xl border border-[#2d3748] transition-transform hover:scale-[1.02] min-w-0">
                <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div
                    style={{ minWidth: `${filteredData.length * BAR_WIDTH}px` }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={filteredData}
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
                          dataKey="totalWinners"
                          fill="#fbbf24"
                          name="Total Winners"
                        />
                        <Bar
                          dataKey="jackpot"
                          fill="#60a5fa"
                          name="Jackpot Winners"
                        />
                        <Bar
                          dataKey="rbWinners"
                          fill="#42dfcc"
                          name="RB Winners"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full mx-auto mt-10">
          {/* Enhanced Summary Card - Responsive */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-gradient-to-r from-[#232b3b] to-[#1e2533] rounded-2xl p-6 shadow-2xl border border-[#2d3748]">
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
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
                  <img src="https://lnnpmtjuzgrcdtusfrty.supabase.co/storage/v1/object/public/app/lotto-types/Grandlotto655.png" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row gap-4 sm:gap-8 w-full md:w-auto mt-4 md:mt-0">
                {/* Total Bets */}
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Bets
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    750
                  </span>
                </div>
                {/* Divider */}
                <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Normal Bets
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    400
                  </span>
                </div>
                <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Return Bets
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    200
                  </span>
                </div>
                <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Free Bets
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    150
                  </span>
                </div>
                <div className="hidden lg:block w-px h-10 bg-slate-700 mx-6" />
                <div className="flex flex-col items-center sm:items-start px-4 sm:px-0">
                  <span className="text-sm text-slate-400 font-medium tracking-wide">
                    Total Jackpot Prize
                  </span>
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
                    250,000
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Bar Graphs Row */}
          <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sales Bar Graph */}
              <div className="flex-1 bg-gradient-to-br from-[#232b3b] to-[#1e2533] rounded-2xl p-4 sm:p-8 shadow-2xl border border-[#2d3748] transition-transform hover:scale-[1.02] min-w-0">
                <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div
                    style={{ minWidth: `${filteredData.length * BAR_WIDTH}px` }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={filteredData}
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
                        <Bar
                          dataKey="netSales"
                          fill="#60a5fa"
                          name="Net Sales"
                        />
                        {/* <Bar dataKey="remittance" fill="#34d399" name="Total Remittance" /> */}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              {/* Jackpot & RB Winners Bar Graph */}
              <div className="flex-1 bg-gradient-to-br from-[#232b3b] to-[#1e2533] rounded-2xl p-4 sm:p-8 shadow-2xl border border-[#2d3748] transition-transform hover:scale-[1.02] min-w-0">
                <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div
                    style={{ minWidth: `${filteredData.length * BAR_WIDTH}px` }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={filteredData}
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
                          dataKey="totalWinners"
                          fill="#fbbf24"
                          name="Total Winners"
                        />
                        <Bar
                          dataKey="jackpot"
                          fill="#60a5fa"
                          name="Jackpot Winners"
                        />
                        <Bar
                          dataKey="rbWinners"
                          fill="#42dfcc"
                          name="RB Winners"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default DashboardPage;
