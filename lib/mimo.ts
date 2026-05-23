import { DataSummary, AnalysisResult } from "@/types";

const MIMO_API_URL =
  process.env.MIMO_API_URL || "https://api.xiaomimimo.com/v1/chat/completions";

const SYSTEM_PROMPT = `你是一个专业的数据分析师。根据用户的自然语言问题，生成 SQL 查询语句来分析数据。

数据表名：uploaded_data

请严格按照以下 JSON 格式返回结果，不要包含任何其他内容：
{
  "sql": "SELECT ... FROM uploaded_data ...",
  "explanation": "用中文简要分析说明",
  "chartType": "bar | line | pie | table",
  "xAxis": "用于X轴/标签的列名（可选）",
  "yAxis": "用于Y轴/值的列名（可选）"
}

规则：
1. SQL 必须是合法的 DuckDB 语法
2. chartType 根据数据特征选择最合适的图表
3. 如果是聚合查询（GROUP BY），xAxis 设为分组列，yAxis 设为聚合列
4. 如果是时间序列，chartType 用 line
5. 如果是占比分析，chartType 用 pie
6. explanation 用中文简要说明分析结论`;

export async function analyzeWithMiMo(
  userQuestion: string,
  dataSummary: DataSummary
): Promise<AnalysisResult> {
  const columnInfo = dataSummary.columns
    .map(
      (col) =>
        `- ${col.name}: ${col.type} (样本: ${col.sampleValues.slice(0, 3).join(", ")})`
    )
    .join("\n");

  const userMessage = `数据表 uploaded_data 有 ${dataSummary.rowCount} 行数据，包含以下列：\n${columnInfo}\n\n我的问题：${userQuestion}`;

  const apiKey = process.env.MIMO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MIMO_API_KEY 未设置。请在 .env.local 中配置 MIMO_API_KEY。"
    );
  }

  const response = await fetch(MIMO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mimo-v2.5",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiMo API 调用失败: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("无法解析 AI 返回结果");
    const result = JSON.parse(jsonMatch[0]);
    return {
      sql: result.sql,
      explanation: result.explanation || "",
      chartType: result.chartType || "table",
      data: [],
      xAxis: result.xAxis,
      yAxis: result.yAxis,
    };
  } catch {
    throw new Error(`AI 返回格式错误: ${content}`);
  }
}
