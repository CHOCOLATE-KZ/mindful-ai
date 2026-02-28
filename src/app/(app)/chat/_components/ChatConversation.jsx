"use client";

import ChatMessages from "./ChatMessages";

export default function ChatConversation({ messages, loading, atBottom, onAnchorSelect }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <main className="w-full">
        <div className="space-y-4 pb-10">
          <ChatMessages
            messages={messages}
            loading={loading}
            atBottom={atBottom}
            onAnchorSelect={onAnchorSelect}
          />
        </div>
      </main>
    </div>
  );
}
