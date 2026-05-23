"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatPanel from "@/components/ChatPanel";
import DataPreview from "@/components/DataPreview";

interface FileInfo {
  id: string;
  fileName: string;
  headers: { name: string; type: string; sampleValues: any[] }[];
  rowCount: number;
  rows: any[][];
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // We need to fetch the data info from the server
    // For now, we'll use the data that was stored
    fetch(`/api/data/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setFileInfo(data);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          返回上传
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 返回
            </button>
            <h1 className="font-medium text-gray-900">
              {fileInfo?.fileName || "数据分析"}
            </h1>
            <span className="text-sm text-gray-400">
              {fileInfo?.rowCount.toLocaleString()} 行
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: "calc(100vh - 80px)" }}>
          <div className="overflow-y-auto">
            {fileInfo && (
              <DataPreview
                headers={fileInfo.headers}
                rows={fileInfo.rows}
                rowCount={fileInfo.rowCount}
              />
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <ChatPanel dataId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
