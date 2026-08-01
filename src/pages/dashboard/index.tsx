import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Input from "../../components/generic/Input";
import AdminTemplate from "../../templates/AdminTemplate";
import {
  getDateStringDaysBeforeToday,
  getTodayDateString,
} from "../../utils/datetime";
import Lp3Card from "./Lp3Card";
import ThreeDCard from "./3dCard";
import TwoDCard from "./2dCard";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultStartDate = useMemo(() => getDateStringDaysBeforeToday(6), []);
  const defaultEndDate = useMemo(() => getTodayDateString(), []);

  const startDate = useMemo(() => {
    const param = searchParams.get("startDate");
    return param && DATE_PATTERN.test(param) ? param : defaultStartDate;
  }, [searchParams, defaultStartDate]);

  const endDate = useMemo(() => {
    const param = searchParams.get("endDate");
    return param && DATE_PATTERN.test(param) ? param : defaultEndDate;
  }, [searchParams, defaultEndDate]);

  const handleStartDateChange = (value: string) => {
    if (endDate && value > endDate) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("startDate", value);
      return next;
    });
  };

  const handleEndDateChange = (value: string) => {
    if (startDate && value < startDate) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("endDate", value);
      return next;
    });
  };

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
              max={endDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>
          <div className="flex flex-col w-full md:w-40">
            <label className="text-gray-400 text-xs mb-1">End Date</label>
            <Input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
            />
          </div>
        </div>
        <Lp3Card startDate={startDate} endDate={endDate} />
        <ThreeDCard startDate={startDate} endDate={endDate} />
        <TwoDCard startDate={startDate} endDate={endDate} />
      </div>
    </AdminTemplate>
  );
};

export default DashboardPage;
