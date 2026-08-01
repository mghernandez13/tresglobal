import { supabase } from "../db/supabase";
import { isRambolito3 } from "./bets";

type RelationData<T> = T | T[] | null;

type WinnerBetQueryRow = {
  combination: string | null;
  bet_amount: number | null;
  prize_amount: number | null;
  bettor_name: string | null;
  bet_types: RelationData<{
    name: string | null;
    code: string | null;
  }>;
  profiles: RelationData<{
    full_name: string | null;
  }>;
};

export type WinnerImageRow = {
  admin: string;
  bettorName: string;
  bet: string;
  remarks: string;
  prize: number;
};

type DownloadWinnersImageOptions = {
  rows: WinnerImageRow[];
  selectedDate: string;
  drawName: string;
  winningCombination: string;
  logoImageSrc?: string | null;
  fileNamePrefix?: string;
};

type FetchWinnerRowsOptions = {
  lottoTypeId: string | string[];
  selectedDate: string;
};

const getSingleRelation = <T>(relation: RelationData<T>): T | null => {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
};

const formatPhpCurrency = (value: number) =>
  `PHP ${new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;

const formatSummaryDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(parsed);
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    // Request the image via CORS so drawing it onto the canvas doesn't
    // "taint" it — otherwise toDataURL/toBlob throws a SecurityError.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

// Truncates `text` from its ORIGINAL characters (not from a
// previously-truncated + ellipsis string) so the loop always makes
// progress and is guaranteed to terminate.
const truncateToWidth = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) => {
  const safeText = text || "-";

  if (ctx.measureText(safeText).width <= maxWidth) {
    return safeText;
  }

  const ellipsis = "...";
  let truncated = safeText;

  while (
    truncated.length > 0 &&
    ctx.measureText(`${truncated}${ellipsis}`).width > maxWidth
  ) {
    truncated = truncated.slice(0, -1);
  }

  return truncated ? `${truncated}${ellipsis}` : ellipsis;
};

const drawCellText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
) => {
  ctx.fillText(truncateToWidth(ctx, text, maxWidth), x, y);
};

const drawRightText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
) => {
  const content = truncateToWidth(ctx, text, maxWidth);
  const width = ctx.measureText(content).width;
  ctx.fillText(content, x - width, y);
};

const normalizeLogoSource = (logoImageSrc?: string | null) => {
  if (!logoImageSrc) {
    return "/images/lotto/grandlotto.png";
  }

  if (logoImageSrc.startsWith("http") || logoImageSrc.startsWith("/")) {
    return logoImageSrc;
  }

  return `/images/lotto/${logoImageSrc}`;
};

export const fetchWinnerRows = async ({
  lottoTypeId,
  selectedDate,
}: FetchWinnerRowsOptions): Promise<WinnerImageRow[]> => {
  const lottoTypeIds = Array.isArray(lottoTypeId) ? lottoTypeId : [lottoTypeId];

  if (!lottoTypeIds.length) {
    return [];
  }

  let query = supabase
    .from("bets")
    .select(
      "combination, bet_amount, prize_amount, bettor_name, bet_types(name, code), profiles(full_name)",
    );

  query =
    lottoTypeIds.length > 1
      ? query.in("lotto_type_id", lottoTypeIds)
      : query.eq("lotto_type_id", lottoTypeIds[0]);

  const { data, error } = await query
    .eq("hit", true)
    .eq("is_dummy_bet", false)
    .gte("created_at", `${selectedDate}T00:00:00`)
    .lte("created_at", `${selectedDate}T23:59:59.999`)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as WinnerBetQueryRow[]).map((item) => {
    const betType = getSingleRelation(item.bet_types);
    const profile = getSingleRelation(item.profiles);
    const betAmount = Number(item.bet_amount ?? 0);
    const prizeAmount = Number(item.prize_amount ?? 0);
    const betTypeCode = (betType?.code ?? "").toUpperCase();
    const combination = item?.combination ?? "";
    const combinationArr = combination.split("-").map(Number);
    const isTrio =
      combinationArr.length === 3 &&
      combinationArr[0] === combinationArr[1] &&
      combinationArr[1] === combinationArr[2];

    const betTypeName =
      betType?.name === "Rambolito"
        ? isRambolito3(combinationArr)
          ? "Rambolito 3"
          : "Rambolito 6"
        : isTrio
          ? "Trio"
          : (betType?.name ?? "");

    return {
      admin: profile?.full_name || "-",
      bettorName: item.bettor_name || "-",
      bet: `${item.combination || "-"}=${betAmount}${betTypeCode}`,
      remarks: (betTypeName || betTypeCode || "-").toUpperCase(),
      prize: prizeAmount,
    };
  });
};

export const downloadWinnersImage = async ({
  rows,
  selectedDate,
  drawName,
  winningCombination,
  logoImageSrc,
  fileNamePrefix = "winners",
}: DownloadWinnersImageOptions) => {
  if (!rows.length) {
    throw new Error("No winners available for image generation.");
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  const padding = 30;
  const headerHeight = 220;
  const tableHeaderHeight = 44;
  const rowHeight = 46;
  const tableWidth = 1460;
  const columnWidths = [230, 380, 210, 410, 230];
  const tableX = padding;
  const tableY = padding + headerHeight;
  const totalHeight =
    padding + headerHeight + tableHeaderHeight + rowHeight * rows.length + 34;
  const summaryRightX = tableX + tableWidth - 24;
  const totalPrize = rows.reduce((sum, row) => sum + row.prize, 0);

  canvas.width = tableWidth + padding * 2;
  canvas.height = totalHeight;

  context.fillStyle = "#111827";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#ffffff";
  context.fillRect(padding, padding, tableWidth, headerHeight);

  context.strokeStyle = "#d1d5db";
  context.lineWidth = 1.5;
  context.strokeRect(padding, padding, tableWidth, headerHeight);

  context.fillStyle = "#374151";
  context.font = "400 19px Arial";
  context.fillText(formatSummaryDate(selectedDate), tableX + 18, padding + 34);

  context.fillStyle = "#1f2937";
  context.font = "500 70px Arial";
  context.fillText(`${drawName} Draw`, tableX + 18, padding + 114);

  context.font = "500 52px Arial";
  context.fillText(winningCombination || "-", tableX + 18, padding + 186);

  context.fillStyle = "#374151";
  context.font = "500 17px Arial";
  drawRightText(
    context,
    `${rows.length} Winners`,
    summaryRightX,
    padding + 76,
    300,
  );

  context.fillStyle = "#1f2937";

  context.font = `500 ${totalPrize > 1000000 ? "28px" : totalPrize > 100000 ? "40px" : "56px"} Arial`;
  drawRightText(
    context,
    formatPhpCurrency(totalPrize),
    summaryRightX,
    padding + 148,
    380,
  );

  context.fillStyle = "#374151";
  context.font = "italic 400 16px Arial";
  drawRightText(context, "Total Prize", summaryRightX, padding + 176, 200);

  context.strokeStyle = "#e5e7eb";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(tableX + 18, padding + 52);
  context.lineTo(tableX + tableWidth - 18, padding + 52);
  context.stroke();

  const logoImage = await loadImage(normalizeLogoSource(logoImageSrc));

  if (logoImage) {
    const logoWidth = 140;
    const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
    const logoX = tableX + tableWidth / 2 - logoWidth / 2;
    const logoY = padding + 56;
    context.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
  }

  const headers = ["Admin", "Bettor Name", "Bet", "Remarks", "Prize"];

  context.fillStyle = "#16c43b";
  context.fillRect(tableX, tableY, tableWidth, tableHeaderHeight);

  context.font = "500 15px Arial";
  context.fillStyle = "#111827";
  let cursorX = tableX;
  headers.forEach((header, index) => {
    drawCellText(
      context,
      header,
      cursorX + 10,
      tableY + tableHeaderHeight / 2 + 5,
      columnWidths[index] - 20,
    );
    cursorX += columnWidths[index];
  });

  rows.forEach((row, index) => {
    const y = tableY + tableHeaderHeight + index * rowHeight;
    context.fillStyle = index % 2 === 0 ? "#ffffff" : "#f3f4f6";
    context.fillRect(tableX, y, tableWidth, rowHeight);

    context.fillStyle = "#1f2937";
    context.font = "400 14px Arial";

    const values = [
      row.admin,
      row.bettorName,
      row.bet,
      row.remarks,
      formatPhpCurrency(row.prize),
    ];

    let cellX = tableX;
    values.forEach((value, columnIndex) => {
      drawCellText(
        context,
        value,
        cellX + 10,
        y + rowHeight / 2 + 5,
        columnWidths[columnIndex] - 20,
      );
      cellX += columnWidths[columnIndex];
    });
  });

  context.strokeStyle = "#9ca3af";
  context.lineWidth = 1;
  context.strokeRect(
    tableX,
    tableY,
    tableWidth,
    tableHeaderHeight + rowHeight * rows.length,
  );

  let lineX = tableX;
  columnWidths.forEach((width) => {
    context.beginPath();
    context.moveTo(lineX, tableY);
    context.lineTo(lineX, tableY + tableHeaderHeight + rowHeight * rows.length);
    context.stroke();
    lineX += width;
  });

  for (let i = 1; i <= rows.length; i += 1) {
    const y = tableY + tableHeaderHeight + i * rowHeight;
    context.beginPath();
    context.moveTo(tableX, y);
    context.lineTo(tableX + tableWidth, y);
    context.stroke();
  }

  const safePrefix = fileNamePrefix.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${safePrefix}_${selectedDate}.png`;
  const url = canvas.toDataURL("image/png");
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = fileName;
  downloadLink.click();
};
