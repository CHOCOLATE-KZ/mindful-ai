"use client";
import { Mic, Send } from "lucide-react";

export default function ChatComposer({ input, setInput, onSend, loading, voice }) {
  const { listening, isSecure, toggleVoice } = voice;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 bg-white/80 backdrop-blur-sm shadow-lg dark:border-white/10 dark:bg-black/40">
        <form onSubmit={onSend} className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full min-h-[48px] max-h-32 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-12 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend(e);
                  }
                }}
              />
            </div>

            <button
              type="button"
              onClick={toggleVoice}
              disabled={!isSecure}
              className={`cursor-pointer h-12 w-12 rounded-full grid place-items-center transition
                ${!isSecure ? "opacity-40 cursor-not-allowed" : listening ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-black/5"}`}
              title={!isSecure ? "Голос работает только на HTTPS или localhost" : "Voice input"}
            >
              <Mic className="h-5 w-5" />
            </button>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="cursor-pointer h-12 w-12 rounded-full grid place-items-center bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-40"
              title="Send"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">
            💙 This is a supportive space. Take your time and share what feels right.
          </p>
        </form>
      </div>

      {!isSecure && (
        <p className="text-xs text-amber-700 mt-2 text-center">
          🎤 Голосовой ввод работает только на <b>HTTPS</b> (или localhost). Откройте сайт по домену с SSL.
        </p>
      )}
    </>
  );
}
