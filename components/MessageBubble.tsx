"use client";

import { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3
          ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          }
        `}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-blue-600">AI 分析</span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        {message.result?.sql && (
          <div className="mt-2 rounded-lg bg-black/5 p-2">
            <p className="text-xs text-gray-500 mb-1">生成的 SQL：</p>
            <code className="text-xs text-gray-700 break-all">
              {message.result.sql}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
