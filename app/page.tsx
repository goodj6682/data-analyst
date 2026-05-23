"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";

export default function HomePage() {
  const router = useRouter();
  const [uploadResult, setUploadResult] = useState<{
    id: string;
    fileName: string;
    headers: { name: string; type: string; sampleValues: any[] }[];
    rowCount: number;
  } | null>(null);

  function handleUploadComplete(data: typeof uploadResult) {
    setUploadResult(data);
  }

  function handleStartAnalysis() {
    if (uploadResult) {
      router.push(`/analysis/${uploadResult.id}`);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Powered by Xiaomi MiMo
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI 智能数据分析
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            上传 Excel 或 CSV 文件，用自然语言提问，AI 自动生成分析结果和可视化图表
          </p>
        </div>

        <FileUpload onUploadComplete={handleUploadComplete} />

        {uploadResult && (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="font-medium text-gray-900 mb-4">文件已解析</h3>
            <div className="grid grid-cols-3 gap-4 text-sm mb-6">
              <div>
                <p className="text-gray-500">文件名</p>
                <p className="font-medium">{uploadResult.fileName}</p>
              </div>
              <div>
                <p className="text-gray-500">行数</p>
                <p className="font-medium">{uploadResult.rowCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">列数</p>
                <p className="font-medium">{uploadResult.headers.length}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">列信息：</p>
              <div className="flex flex-wrap gap-2">
                {uploadResult.headers.map((h) => (
                  <span
                    key={h.name}
                    className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                  >
                    {h.name}
                    <span className="text-gray-400 ml-1">{h.type}</span>
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartAnalysis}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              开始分析 →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
