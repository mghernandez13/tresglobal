import * as XLSX from "xlsx";

export const generateExcelFile = (
  data: Record<string, number | string>[],
  fileName: string,
) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Jackpot Winners");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
