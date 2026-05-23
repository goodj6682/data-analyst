"use client";

import { useState } from "react";
import MessageBubble from "./MessageBubble";
import ChartRenderer from "./ChartRenderer";
import { ChatMessage, AnalysisResult } from "@/types";

interface ChatPanelProps {
  dataId: string;
}

export default function ChatPanel({ dataId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const suggestions = [
    "每月总销售额是多少？",
    "哪个产品销量最好？",
    "数据的整体分布情况如何？",
    "找出销量前5的产品",
  ];

  async function handleSubmit(question: string) {
    if (!question.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataId, question }),
      });

      const result: AnalysisResult = await res.json();

      if (!res.ok) {
        throw new Error(result as any);
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.explanation,
        result,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `分析出错: ${err.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              开始分析你的数据
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              输入自然语言问题，AI 会自动生成查询并返回图表
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSubmit(s)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            <MessageBubble message={msg} />
            {msg.result && (
              <div className="mt-3 ml-10">
                <ChartRenderer result={msg.result} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 ml-10">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
            <span className="text-sm">分析中...</span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的数据分析问题..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
}
