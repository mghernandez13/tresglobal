import { useCallback, useEffect, useRef, useState } from "react";
import type { TableHeaderProps } from "../../../types/generic";
import { useLocation, useNavigate } from "react-router-dom";

const TableHeader: React.FC<TableHeaderProps> = (props) => {
  const {
    tableName,
    tableFilter,
    searchParams,
    setSearchParams,
    pageSize,
    setPageSize,
    pageSizeOptions = [5, 10, 20, 50],
  } = props;
  const searchQuery = searchParams.get("search") || "";
  const [inputValue, setInputValue] = useState(searchQuery);
  const [showFilter, setShowFilter] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement | null>(null);
  const filterMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [searchChange, setSearchChange] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleShowFilter = useCallback(() => {
    setShowFilter(!showFilter);
  }, [showFilter]);

  const handleClickFilterMenu = useCallback(
    (event: MouseEvent | globalThis.MouseEvent) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node) &&
        filterMenuButtonRef.current &&
        !filterMenuButtonRef.current.contains(event.target as Node)
      ) {
        toggleShowFilter();
      }
    },
    [toggleShowFilter],
  );

  const handleCheckboxChange = (role: string) => {
    tableFilter?.setSelectedFilter((prev) => {
      const newFilter = prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role];
      // Remove page and search params when changing role filter
      setSearchParams({});
      return newFilter;
    });
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickFilterMenu);

    return () => {
      document.removeEventListener("mousedown", handleClickFilterMenu);
    };
  }, [handleClickFilterMenu]);

  // Debounce: Update URL after 500ms of no typing
  useEffect(() => {
    if (searchChange) {
      const timeoutId = setTimeout(() => {
        setSearchParams({
          search: inputValue,
          page: "1",
        });
      }, 500);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
      <div className="w-full md:w-1/2">
        <div className="flex items-center gap-3">
          <label className="sr-only">Page size</label>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setPageSize(newSize);
              setSearchParams({ search: inputValue, page: "1" });
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 py-2 px-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / page
              </option>
            ))}
          </select>
          <label className="sr-only">Search</label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={inputValue}
              onChange={(e) => {
                setSearchChange(true);
                setInputValue(e.target.value);
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Search"
              required
            />
          </div>
        </div>
      </div>
      <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
        <button
          onClick={() => navigate(`/${location.pathname}/create`)}
          type="button"
          className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-yellow-500 dark:text-black dark:hover:bg-yellow-600 focus:outline-none dark:focus:ring-primary-800"
        >
          <svg
            className="h-3.5 w-3.5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              clip-rule="evenodd"
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            />
          </svg>
          Create {tableName}
        </button>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {tableFilter && (
            <button
              id="filterDropdownButton"
              data-dropdown-toggle="filterDropdown"
              onClick={toggleShowFilter}
              ref={filterMenuButtonRef}
              className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="h-4 w-4 mr-2 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clip-rule="evenodd"
                />
              </svg>
              Filter
              <svg
                className="-mr-1 ml-1.5 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  clip-rule="evenodd"
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                />
              </svg>
            </button>
          )}
          {showFilter && (
            <div
              ref={filterMenuRef}
              id="filterDropdown"
              className="z-10 mt-1 absolute top-14 right-0 w-48 p-3 bg-white rounded-lg shadow dark:bg-gray-700"
            >
              <h6 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                Choose Filter
              </h6>
              <ul
                className="space-y-2 text-sm"
                aria-labelledby="filterDropdownButton"
              >
                {tableFilter?.data.map((item) => (
                  <li className="flex items-center">
                    <input
                      id={item.value}
                      type="checkbox"
                      value={item.value}
                      checked={tableFilter.selectedFilter.includes(item.value)}
                      className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                      onChange={() => handleCheckboxChange(item.value)}
                    />
                    <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.name} ({item.count})
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableHeader;
