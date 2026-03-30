// Formats a date string (YYYY-MM-DD or ISO) to 'Month Day, Year' (e.g., January 20, 2926)
export const formatDrawDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
export const capitalizeFirstLetter = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getUrlParameter = (urlParam: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  const param = urlParams.get(urlParam);

  return param;
};

export const getPaginationRange = (current: number, total: number) => {
  const delta = 2; // How many pages to show on either side of current
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

export const isAdmin = (role: string) => {
  return ["super_admin", "admin"].includes(role);
};

export const formatTo12h = (time: string) => {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return time;
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
};

export const getTimes = () => {
  const list: { label: string; value: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? "AM" : "PM";
      const label = `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
      const value = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
      list.push({ label, value });
    }
  }
  return list;
};

export const isValueNumberic = (value: string) => {
  return /^\d+$/.test(value);
};
