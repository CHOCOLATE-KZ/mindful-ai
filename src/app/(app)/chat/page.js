"use client";

import ChatHeader from "./_components/ChatHeader";
import ChatComposer from "./_components/ChatComposer";
import ChatBackground from "./_components/ChatBackground";
import ChatAmbient from "./_components/ChatAmbient";
import ChatSidebar from "./_components/ChatSidebar";
import ChatSidebarNav from "./_components/ChatSidebarNav";
import AnchorsModal from "./_components/AnchorsModal";
import AnchorTooltip from "./_components/AnchorTooltip";
import ScrollToTopButton from "./_components/ScrollToTopButton";
import ChatConversation from "./_components/ChatConversation";
import VoiceConversationPanel from "./_components/VoiceConversationPanel";
import CharacterController from "@/components/CharacterController";
import { useChatPageModel } from "./_hooks/useChatPageModel";
import EmotionTracker from "@/components/EmotionTracker";
import { useState } from "react";
import { FileJson, FileText, X } from "lucide-react";


export default function ChatPage() {
  const [anchorsModalOpen, setAnchorsModalOpen] = useState(false);
  const [showAnchorsInChat, setShowAnchorsInChat] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [ambientBg, setAmbientBg] = useState("none");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const {
    messages,
    currentUserId,
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
    sessionModeEnabled,
    voiceModeState,
    voiceModeHeard,
    voiceModeReply,
    voiceModeError,
    toggleVoiceConversation,
    toggleSessionMode,
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
    scrollToBottom,
    atTop,
  } = useChatPageModel();




  return (
    <div className="min-h-dvh flex text-slate-900 dark:text-slate-100">
      <ChatBackground />
      <ChatAmbient selectedBg={ambientBg} setSelectedBg={setAmbientBg} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {sessionModeEnabled && <EmotionTracker userId={currentUserId} />}
      
      {/* Left sidebar nav */}
      <ChatSidebarNav onAnchorsClick={() => setAnchorsModalOpen(true)} isOpen={sidebarOpen} />

      {/* Main content area */}
      <div className={`flex flex-1 transition-all duration-300 ease-out ${sidebarOpen ? "ml-16" : "ml-0"}`}>
        {/* Center: Chat */}
        <div className="flex flex-col flex-1 min-w-0">
          <ChatHeader
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            menuRef={menuRef}
            exportMyData={() => setExportModalOpen(true)}
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
              <div ref={scrollRef} className="flex-1 overflow-y-auto pb-24 md:pb-28 flex flex-col items-center">
                <ChatConversation
                  messages={messages}
                  userAvatarUrl={userAvatarUrl}
                  loading={loading}
                  atBottom={atBottom}
                  scrollRef={scrollRef}
                  onAnchorSelect={applyAnchorToInput}
                  showAnchors={showAnchorsInChat}
                  hasAmbientBg={ambientBg !== "none"}
                  ambientBg={ambientBg}
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

              <div className="h-0">
                <ChatComposer
                    input={input}
                    setInput={setInput}
                    onSend={send}
                    loading={loading}
                    voice={voice}
                    voiceModeEnabled={voiceModeEnabled}
                    onToggleVoiceMode={toggleVoiceConversation}
                    sessionModeEnabled={sessionModeEnabled}
                    onToggleSessionMode={toggleSessionMode}
                    sidebarOpen={sidebarOpen}
                    hasAmbientBg={ambientBg !== "none"}
                  />
              </div>
            </>
          )}

          {!voiceModeEnabled && (
            <ScrollToTopButton
              atTop={atTop}
              onClick={atTop ? scrollToBottom : scrollToTop}
              ambientBg={ambientBg}
            />
          )}
          <AnchorTooltip show={showAnchorTooltip} position={tooltipPosition} />
        </div>
      </div>

      {/* Anchors Modal */}
      <AnchorsModal
        isOpen={anchorsModalOpen}
        onClose={() => setAnchorsModalOpen(false)}
        latestAnchors={latestAnchors}
        helpIconRef={helpIconRef}
        onHelpEnter={handleHelpIconHover}
        onHelpLeave={hideAnchorTooltip}
        onAnchorClick={(anchor) => {
          applyAnchorToInput(anchor);
          setAnchorsModalOpen(false);
        }}
        onSaveAnchor={saveChatNote}
        savingAnchor={savingAnchor}
        savedNotes={savedNotes}
        notesLoading={notesLoading}
        notesError={notesError}
        showAnchorsInChat={showAnchorsInChat}
        onToggleAnchorsInChat={() => setShowAnchorsInChat((v) => !v)}
      />
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="text-base font-semibold text-slate-800">Экспорт данных</div>
              <button onClick={() => setExportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Выберите формат. Будут включены: заметки, история чатов, результаты тестов, настройки профиля.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => { setExportModalOpen(false); exportMyData("json"); }}
                className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-5 text-center transition hover:border-blue-400 hover:bg-blue-50 active:scale-95"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 group-hover:bg-blue-200 transition">
                  <FileJson className="h-6 w-6 text-blue-600" />
                </span>
                <div>
                  <div className="font-semibold text-slate-800">JSON</div>
                  <div className="mt-0.5 text-xs text-slate-400">Для разработчиков и резервных копий</div>
                </div>
              </button>
              <button
                onClick={() => { setExportModalOpen(false); exportMyData("pdf"); }}
                className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-5 text-center transition hover:border-rose-400 hover:bg-rose-50 active:scale-95"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 group-hover:bg-rose-200 transition">
                  <FileText className="h-6 w-6 text-rose-500" />
                </span>
                <div>
                  <div className="font-semibold text-slate-800">PDF</div>
                  <div className="mt-0.5 text-xs text-slate-400">Красивый читаемый отчёт</div>
                </div>
              </button>
            </div>
            <button
              onClick={() => setExportModalOpen(false)}
              className="mt-4 w-full rounded-full border border-slate-200 py-2 text-sm text-slate-500 hover:bg-slate-50 transition"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
