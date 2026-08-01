import { DAYS_OF_WEEK } from "../types/constants";

export const getTodayDateString = () => {
  // Always get today in Asia/Manila timezone
  const manilaNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }),
  );
  const yyyy = manilaNow.getFullYear();
  const mm = String(manilaNow.getMonth() + 1).padStart(2, "0");
  const dd = String(manilaNow.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const getDateStringDaysBeforeToday = (days: number) => {
  const manilaNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }),
  );

  manilaNow.setDate(manilaNow.getDate() - Math.max(0, days));

  const yyyy = manilaNow.getFullYear();
  const mm = String(manilaNow.getMonth() + 1).padStart(2, "0");
  const dd = String(manilaNow.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

export const getTodayDayName = () => {
  // Keep timezone aligned with getTodayDateString
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Asia/Manila",
  }).format(new Date());
};

export const getDayNameFromDateString = (dateString: string) => {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  // Reject invalid calendar dates like 2026-02-30.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return "";
  }

  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Asia/Manila",
  }).format(date);

  return DAYS_OF_WEEK.find((d) => d === weekday) ?? "";
};

export const humanizeDateString = (dateString: string) => {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

export const getDateRange = (start: string, end: string) => {
  if (!start || !end) return [];

  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [endYear, endMonth, endDay] = end.split("-").map(Number);

  if (
    [startYear, startMonth, startDay, endYear, endMonth, endDay].some(
      Number.isNaN,
    )
  ) {
    return [];
  }

  const current = new Date(Date.UTC(startYear, startMonth - 1, startDay));
  const last = new Date(Date.UTC(endYear, endMonth - 1, endDay));

  if (current > last) return [];

  const dates: string[] = [];
  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
};

export const getUniqueDayNamesInRange = (start: string, end: string) => {
  if (!start || !end) return [];

  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [endYear, endMonth, endDay] = end.split("-").map(Number);

  if (
    [startYear, startMonth, startDay, endYear, endMonth, endDay].some(
      Number.isNaN,
    )
  ) {
    return [];
  }

  const current = new Date(Date.UTC(startYear, startMonth - 1, startDay));
  const last = new Date(Date.UTC(endYear, endMonth - 1, endDay));

  if (current > last) return [];

  const uniqueDays = new Set<string>();

  while (current <= last) {
    uniqueDays.add(DAYS_OF_WEEK[current.getUTCDay()]);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return Array.from(uniqueDays);
};
