import { NextRequest, NextResponse } from "next/server";
import { getData } from "@/lib/store";
import { getDataSummary, formatDataSummary } from "@/lib/parseData";
import { analyzeWithMiMo } from "@/lib/mimo";
import { loadCSVToSQLite, executeSQL } from "@/lib/sqlEngine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataId, question } = body;

    if (!dataId || !question) {
      return NextResponse.json(
        { error: "缺少 dataId 或 question" },
        { status: 400 }
      );
    }

    const data = getData(dataId);
    if (!data) {
      return NextResponse.json(
        { error: "数据不存在，请重新上传" },
        { status: 404 }
      );
    }

    const summary = getDataSummary(data);

    await loadCSVToSQLite(data);

    const analysis = await analyzeWithMiMo(question, summary);

    let queryResult: any[] = [];
    try {
      queryResult = await executeSQL(analysis.sql);
    } catch (sqlError: any) {
      return NextResponse.json({
        sql: analysis.sql,
        explanation: `SQL 执行错误: ${sqlError.message}`,
        chartType: "table",
        data: [],
      });
    }

    return NextResponse.json({
      sql: analysis.sql,
      explanation: analysis.explanation,
      chartType: analysis.chartType,
      data: queryResult,
      xAxis: analysis.xAxis,
      yAxis: analysis.yAxis,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "分析失败" },
      { status: 500 }
    );
  }
}
