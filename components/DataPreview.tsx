"use client";

interface DataPreviewProps {
  headers: { name: string; type: string; sampleValues: any[] }[];
  rows: any[][];
  rowCount: number;
}

export default function DataPreview({
  headers,
  rows,
  rowCount,
}: DataPreviewProps) {
  const previewRows = rows.slice(0, 50);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-medium text-gray-700">
          数据预览
          <span className="ml-2 text-gray-400">
            (前 {previewRows.length} 行，共 {rowCount} 行)
          </span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {headers.map((col, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap"
                >
                  {col.name}
                  <span className="ml-1 text-xs text-gray-400">
                    {col.type}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                {headers.map((_, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-[200px] truncate"
                  >
                    {row[colIdx] !== null && row[colIdx] !== undefined
                      ? String(row[colIdx])
                      : "-"}
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
