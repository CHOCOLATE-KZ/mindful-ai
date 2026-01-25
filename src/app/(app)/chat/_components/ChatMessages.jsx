"use client";
import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

export default function ChatMessages({ messages, loading }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="space-y-4">
        {messages.map((m, idx) => {
          const isAI = m.role === "assistant";
          return (
            <div key={idx} className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"}`}>
              {isAI && (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-black" />
                </div>
              )}

              <div
                className={`max-w-[75%] lg:max-w-[60%] rounded-3xl px-5 py-3 shadow-lg ${
                  isAI
                    ? "bg-white/90 backdrop-blur-sm border border-white/50 text-gray-800"
                    : "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                <p className={`text-xs mt-2 ${isAI ? "text-gray-500" : "text-white/70"}`}>
                  {m.created_at
                    ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </p>
              </div>

              {!isAI && (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FFDCC8] to-[#FFB088] flex items-center justify-center flex-shrink-0 text-black font-medium">
                  U
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-5 py-3 shadow-lg border border-black/10">
              Думаю…
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
