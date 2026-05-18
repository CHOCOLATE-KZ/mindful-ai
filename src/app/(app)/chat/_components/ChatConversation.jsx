"use client";

import ChatMessages from "./ChatMessages";

export default function ChatConversation({ messages, userAvatarUrl, loading, atBottom, scrollRef, onAnchorSelect, showAnchors, hasAmbientBg, ambientBg = "none" }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <main className="w-full">
        <div className="pb-6 md:pb-8">
          <ChatMessages
            messages={messages}
            userAvatarUrl={userAvatarUrl}
            loading={loading}
            atBottom={atBottom}
            scrollRef={scrollRef}
            onAnchorSelect={onAnchorSelect}
            showAnchors={showAnchors}
            hasAmbientBg={hasAmbientBg}
            ambientBg={ambientBg}
          />
        </div>
      </main>
    </div>
  );
}
