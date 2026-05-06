"use client";

import ChatMessages from "./ChatMessages";

export default function ChatConversation({ messages, userAvatarUrl, loading, atBottom, scrollRef, onAnchorSelect, showAnchors }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <main className="w-full">
        <div className="space-y-4 pb-2">
          <ChatMessages
            messages={messages}
            userAvatarUrl={userAvatarUrl}
            loading={loading}
            atBottom={atBottom}
            scrollRef={scrollRef}
            onAnchorSelect={onAnchorSelect}
            showAnchors={showAnchors}
          />
        </div>
      </main>
    </div>
  );
}
