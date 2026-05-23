export interface ParsedData {
  id: string;
  fileName: string;
  headers: ColumnInfo[];
  rows: any[][];
  rowCount: number;
  uploadedAt: Date;
}

export interface ColumnInfo {
  name: string;
  type: "string" | "number" | "date" | "boolean";
  sampleValues: any[];
  nullCount: number;
}

export interface DataSummary {
  tableName: string;
  columns: ColumnInfo[];
  rowCount: number;
  fileName: string;
}

export interface AnalysisResult {
  sql: string;
  explanation: string;
  chartType: "bar" | "line" | "pie" | "table";
  data: any[];
  xAxis?: string;
  yAxis?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  result?: AnalysisResult;
  timestamp: Date;
}
