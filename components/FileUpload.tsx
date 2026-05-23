"use client";

import { useState, useRef } from "react";

interface FileUploadProps {
  onUploadComplete: (data: {
    id: string;
    fileName: string;
    headers: { name: string; type: string; sampleValues: any[] }[];
    rowCount: number;
  }) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "上传失败");
      }

      onUploadComplete(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`
        cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all
        ${
          isDragging
            ? "border-blue-500 bg-blue-500/5"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }
        ${isUploading ? "pointer-events-none opacity-60" : ""}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl">
          {isUploading ? "⏳" : "📊"}
        </div>

        <div>
          <p className="text-lg font-medium text-gray-900">
            {isUploading
              ? "正在解析数据..."
              : "拖拽文件到这里，或点击上传"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            支持 CSV、Excel (.xlsx) 格式
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
