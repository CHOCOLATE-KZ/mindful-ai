"use client";

import ChatMessages from "./ChatMessages";

export default function ChatConversation({
  messages,
  userAvatarUrl,
  loading,
  atBottom,
  scrollRef,
  bottomInset = 180,
  onContinueAfterCrisis,
  onDeclineCrisisTopic,
  hasAmbientBg,
  ambientBg = "none",
  hideAvatars = false,
  minimalComposer = false,
}) {
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
            bottomInset={bottomInset}
            onContinueAfterCrisis={onContinueAfterCrisis}
            onDeclineCrisisTopic={onDeclineCrisisTopic}
            hasAmbientBg={hasAmbientBg}
            ambientBg={ambientBg}
            hideAvatars={hideAvatars}
            minimalComposer={minimalComposer}
          />
        </div>
      </main>
    </div>
  );
}
