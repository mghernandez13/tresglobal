import React, { useState } from "react";
import PrimaryButton from "../buttons/Primary";

interface DateFilterDropdownProps {
  filter: any;
  setOpenFilter: (label: string | null) => void;
}

const DateFilterDropdown: React.FC<DateFilterDropdownProps> = ({
  filter,
  setOpenFilter,
}) => {
  // Local state for the date inputs
  const [localStart, setLocalStart] = useState(filter.data[0].start || "");
  const [localEnd, setLocalEnd] = useState(filter.data[0].end || "");

  const handleApply = () => {
    filter.data[0].setDateRange((prev: { start: string; end: string }) => ({
      ...prev,
      start: localStart,
      end: localEnd,
    }));
    setOpenFilter(null);
  };

  return (
    <li className="flex flex-col gap-2" key="date-filter-picker">
      <label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
        Start Date
      </label>
      <input
        type="date"
        value={localStart ? localStart.split("T")[0] : ""}
        onChange={(e) => setLocalStart(e.target.value)}
        max={localEnd ? localEnd.split("T")[0] : undefined}
        className="w-full border border-gray-300 rounded px-2 py-1 mb-2 dark:bg-gray-600 dark:text-white"
      />
      <label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
        End Date
      </label>
      <input
        type="date"
        value={localEnd ? localEnd.split("T")[0] : ""}
        onChange={(e) => setLocalEnd(e.target.value)}
        min={localStart ? localStart.split("T")[0] : undefined}
        className="w-full border border-gray-300 rounded px-2 py-1 dark:bg-gray-600 dark:text-white"
      />
      <PrimaryButton onClick={handleApply} type="button">
        Apply
      </PrimaryButton>
    </li>
  );
};

export default DateFilterDropdown;
