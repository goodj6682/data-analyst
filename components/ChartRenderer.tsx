"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AnalysisResult } from "@/types";

interface ChartRendererProps {
  result: AnalysisResult;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

function formatValue(val: any): string {
  if (typeof val === "number") {
    return val.toLocaleString("zh-CN");
  }
  return String(val);
}

export default function ChartRenderer({ result }: ChartRendererProps) {
  if (!result.data || result.data.length === 0) {
    return null;
  }

  const keys = Object.keys(result.data[0]);
  const xKey = result.xAxis || keys[0];
  const yKey =
    result.yAxis || keys.find((k) => typeof result.data[0][k] === "number") || keys[1];

  if (result.chartType === "pie") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={result.data}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) =>
                `${name}: ${((percent || 0) * 100).toFixed(1)}%`
              }
            >
              {result.data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => formatValue(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (result.chartType === "line") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={result.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: any) => formatValue(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (result.chartType === "bar") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={result.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: any) => formatValue(value)} />
            <Legend />
            <Bar dataKey={yKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // table
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {keys.map((key) => (
                <th
                  key={key}
                  className="px-3 py-2 text-left font-medium text-gray-600"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                {keys.map((key) => (
                  <td key={key} className="px-3 py-2 text-gray-700">
                    {formatValue(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
