"use client";

import ChatHeader from "./_components/ChatHeader";
import ChatComposer from "./_components/ChatComposer";
import ChatBackground from "./_components/ChatBackground";
import ChatSidebar from "./_components/ChatSidebar";
import AnchorTooltip from "./_components/AnchorTooltip";
import ScrollToTopButton from "./_components/ScrollToTopButton";
import ChatConversation from "./_components/ChatConversation";
import CharacterController from "@/components/CharacterController";
import { useChatPageModel } from "./_hooks/useChatPageModel";

export default function ChatPage() {
  const {
    messages,
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
    <div className="min-h-dvh flex flex-col bg-white text-slate-900">
      <ChatBackground />

      <ChatHeader
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        menuRef={menuRef}
        exportMyData={exportMyData}
        clearChatHistory={clearChatHistory}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-48">
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
          loading={loading}
          atBottom={atBottom}
          onAnchorSelect={applyAnchorToInput}
        />
      </div>

      {/* Персонаж фиксирован справа с большим отступом */}
      <div className="fixed right-32 bottom-48 z-40">
        <CharacterController
          chatMessages={messages}
          isLoading={loading}
          position="center"
          size="medium"
          showCharacter={true}
        />
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex-1 max-w-5xl mx-auto">
          <ChatComposer input={input} setInput={setInput} onSend={send} loading={loading} voice={voice} />
        </div>
      </div>

      <ScrollToTopButton onClick={scrollToTop} />
      <AnchorTooltip show={showAnchorTooltip} position={tooltipPosition} />
    </div>
  );
}
