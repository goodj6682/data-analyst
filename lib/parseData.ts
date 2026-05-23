import Papa from "papaparse";
import ExcelJS from "exceljs";
import { ParsedData, ColumnInfo, DataSummary } from "@/types";

function detectColumnType(values: any[]): ColumnInfo["type"] {
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "");
  if (nonNull.length === 0) return "string";

  const numCount = nonNull.filter((v) => !isNaN(Number(v))).length;
  if (numCount / nonNull.length > 0.8) return "number";

  const dateCount = nonNull.filter((v) => !isNaN(Date.parse(v))).length;
  if (dateCount / nonNull.length > 0.8) return "date";

  const boolCount = nonNull.filter((v) =>
    ["true", "false", "yes", "no", "1", "0"].includes(String(v).toLowerCase())
  ).length;
  if (boolCount / nonNull.length > 0.8) return "boolean";

  return "string";
}

function buildColumnInfo(headers: string[], rows: any[][]): ColumnInfo[] {
  return headers.map((name, colIdx) => {
    const colValues = rows.map((row) => row[colIdx]);
    const nullCount = colValues.filter(
      (v) => v === null || v === undefined || v === ""
    ).length;
    const sampleValues = [...new Set(colValues.filter((v) => v !== null && v !== undefined && v !== ""))]
      .slice(0, 5);

    return {
      name,
      type: detectColumnType(colValues),
      sampleValues,
      nullCount,
    };
  });
}

export async function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as any[][];
        if (data.length === 0) {
          reject(new Error("CSV file is empty"));
          return;
        }

        const headers = data[0].map(String);
        const rows = data.slice(1).filter((row) =>
          row.some((cell) => cell !== null && cell !== undefined && cell !== "")
        );

        resolve({
          id: crypto.randomUUID(),
          fileName: file.name,
          headers: buildColumnInfo(headers, rows),
          rows,
          rowCount: rows.length,
          uploadedAt: new Date(),
        });
      },
      error: (error) => reject(error),
    });
  });
}

export async function parseExcel(file: File): Promise<ParsedData> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet || worksheet.rowCount === 0) {
    throw new Error("Excel file is empty");
  }

  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value || `Column ${colNumber}`);
  });

  const rows: any[][] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const rowData: any[] = [];
    row.eachCell((cell, colNumber) => {
      rowData[colNumber - 1] = cell.value;
    });
    if (rowData.some((v) => v !== null && v !== undefined && v !== "")) {
      rows.push(rowData);
    }
  });

  return {
    id: crypto.randomUUID(),
    fileName: file.name,
    headers: buildColumnInfo(headers, rows),
    rows,
    rowCount: rows.length,
    uploadedAt: new Date(),
  };
}

export function getDataSummary(data: ParsedData): DataSummary {
  return {
    tableName: "uploaded_data",
    columns: data.headers,
    rowCount: data.rowCount,
    fileName: data.fileName,
  };
}

export function formatDataSummary(summary: DataSummary): string {
  return summary.columns
    .map(
      (col) =>
        `${col.name} (${col.type}, 样本: ${col.sampleValues.slice(0, 3).join(", ")})`
    )
    .join("\n");
}
