"use client";

import ChatHeader from "./_components/ChatHeader";
import ChatComposer from "./_components/ChatComposer";
import ChatBackground from "./_components/ChatBackground";
import ChatSidebar from "./_components/ChatSidebar";
import AnchorTooltip from "./_components/AnchorTooltip";
import ScrollToTopButton from "./_components/ScrollToTopButton";
import ChatConversation from "./_components/ChatConversation";
import VoiceConversationPanel from "./_components/VoiceConversationPanel";
import CharacterController from "@/components/CharacterController";
import { useChatPageModel } from "./_hooks/useChatPageModel";

export default function ChatPage() {
  const {
    messages,
    userAvatarUrl,
    input,
    loading,
    atBottom,
    savedNotes,
    notesLoading,
    notesError,
    savingAnchor,
    showAnchorTooltip,
    tooltipPosition,
    scrollRef,
    helpIconRef,
    menuOpen,
    setMenuOpen,
    menuRef,
    voice,
    voiceModeEnabled,
    voiceModeState,
    voiceModeHeard,
    voiceModeReply,
    voiceModeError,
    toggleVoiceConversation,
    stopVoiceConversation,
    latestAnchors,
    exportMyData,
    clearChatHistory,
    handleHelpIconHover,
    hideAnchorTooltip,
    applyAnchorToInput,
    saveChatNote,
    setInput,
    send,
    scrollToTop,
  } = useChatPageModel();

  return (
    <div className="min-h-dvh flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <ChatBackground />

      <ChatHeader
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        menuRef={menuRef}
        exportMyData={exportMyData}
        clearChatHistory={clearChatHistory}
      />

      {voiceModeEnabled ? (
        <div className="fixed inset-0 z-[220]">
          <VoiceConversationPanel
            state={voiceModeState}
            liveText={voice?.voiceText || ""}
            heard={voiceModeHeard}
            reply={voiceModeReply}
            error={voiceModeError}
            onStop={stopVoiceConversation}
          />
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto pb-16">
            <ChatSidebar
              latestAnchors={latestAnchors}
              helpIconRef={helpIconRef}
              onHelpEnter={handleHelpIconHover}
              onHelpLeave={hideAnchorTooltip}
              onAnchorClick={applyAnchorToInput}
              onSaveAnchor={saveChatNote}
              savingAnchor={savingAnchor}
              savedNotes={savedNotes}
              notesLoading={notesLoading}
              notesError={notesError}
            />

            <ChatConversation
              messages={messages}
              userAvatarUrl={userAvatarUrl}
              loading={loading}
              atBottom={atBottom}
              onAnchorSelect={applyAnchorToInput}
            />
          </div>

          {/* Персонаж фиксирован справа с большим отступом */}
          {/* Персонаж временно отключён */}
          {/*
          <div className="fixed right-32 bottom-38 z-40">
            <CharacterController
              chatMessages={messages}
              isLoading={loading}
              position="center"
              size="medium"
              showCharacter={false}
            />
          </div>
          */}

          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex-1 max-w-5xl mx-auto">
              <ChatComposer
                input={input}
                setInput={setInput}
                onSend={send}
                loading={loading}
                voice={voice}
                voiceModeEnabled={voiceModeEnabled}
                onToggleVoiceMode={toggleVoiceConversation}
              />
            </div>
          </div>
        </>
      )}

      {!voiceModeEnabled && <ScrollToTopButton onClick={scrollToTop} />}
      <AnchorTooltip show={showAnchorTooltip} position={tooltipPosition} />
    </div>
  );
}
