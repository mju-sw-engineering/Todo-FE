'use client'

import { useEffect, useRef, useState } from 'react'
import { sendChatMessage } from '@/services/chatService'
import type { ChatMessage } from '@/types/chat.types'
import type { TeamListItem } from '@/types/team.types'

interface ChatBotProps {
  token: string
  teamId?: number
  teams?: TeamListItem[]
}

function BotAvatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-primary flex-shrink-0 flex items-center justify-center shadow-[0_2px_8px_rgba(91,79,207,0.25)]">
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
        />
      </svg>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-start">
      <BotAvatar />
      <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 0.15, 0.3].map((delay, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-muted animate-bounce"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function formatTime(date: Date): string {
  const h = date.getHours()
  const m = String(date.getMinutes()).padStart(2, '0')
  const period = h < 12 ? '오전' : '오후'
  const hour = h % 12 || 12
  return `${period} ${hour}:${m}`
}

function makeInitialMessages(): ChatMessage[] {
  return [
    {
      role: 'bot',
      content: '안녕하세요! 팀 투두 AI입니다.\n오늘 할 일을 함께 정리해볼까요?',
      time: new Date(),
    },
  ]
}

const QUICK_ACTIONS = ['오늘 투두 요약', 'AI 할일 추천', '연속 달성 확인', '어제 달성률']

export function ChatBot({ token, teamId: teamIdProp, teams }: ChatBotProps) {
  const isPickerMode = teamIdProp === undefined
  const hasTeams = isPickerMode ? (teams?.length ?? 0) > 0 : true

  const [isOpen, setIsOpen] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>(makeInitialMessages)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const effectiveTeamId = teamIdProp ?? selectedTeamId
  const showPicker = isOpen && isPickerMode && selectedTeamId === null
  const showChat = isOpen && effectiveTeamId !== null
  const selectedTeam = isPickerMode ? teams?.find((t) => t.teamId === selectedTeamId) : undefined

  useEffect(() => {
    if (!showChat) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showChat])

  useEffect(() => {
    if (showChat) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [showChat])

  function handleOpen() {
    setIsOpen(true)
  }

  function handleClose() {
    setIsOpen(false)
  }

  function handleSelectTeam(id: number) {
    setSelectedTeamId(id)
    setMessages(makeInitialMessages())
  }

  async function handleSend(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isSending || !effectiveTeamId) return

    setMessages((prev) => [...prev, { role: 'user', content: trimmed, time: new Date() }])
    setInput('')
    setIsSending(true)

    try {
      const reply = await sendChatMessage({ message: trimmed, teamId: effectiveTeamId }, token)
      setMessages((prev) => [...prev, { role: 'bot', content: reply, time: new Date() }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: '응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.',
          time: new Date(),
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  if (!hasTeams) return null

  return (
    <>
      {/* FAB 버튼 */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-17 right-5 z-40 w-14 h-14 rounded-full bg-primary shadow-[0_4px_20px_rgba(91,79,207,0.45)] flex items-center justify-center text-white transition-transform duration-200 hover:scale-105 active:scale-95"
          aria-label="AI 챗봇 열기"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* 팀 선택 패널 */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-up">
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          <div className="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_10px_rgba(91,79,207,0.3)]">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-ink">팀 투두 AI 매니저</p>
              <p className="text-[12px] text-muted mt-0.5">대화할 팀을 선택해주세요</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-surface transition-colors"
              aria-label="닫기"
            >
              <svg
                className="w-5 h-5 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
            {teams?.map((team) => (
              <button
                key={team.teamId}
                onClick={() => handleSelectTeam(team.teamId)}
                className="flex items-center gap-4 px-4 py-4 rounded-[16px] border border-border bg-white hover:border-primary/40 hover:shadow-[0_2px_12px_rgba(91,79,207,0.10)] active:scale-[0.99] transition-all duration-150 text-left"
              >
                <div className="w-11 h-11 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <span className="text-[18px] font-bold text-primary">
                    {team.teamName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-ink truncate">{team.teamName}</p>
                </div>
                <svg
                  className="w-4 h-4 text-muted shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 챗봇 패널 */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-up">
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          <div className="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0">
            {/* picker 모드에서 뒤로가기(팀 재선택) */}
            {isPickerMode && (
              <button
                onClick={() => setSelectedTeamId(null)}
                className="p-1.5 rounded-full hover:bg-surface transition-colors mr-[-4px]"
                aria-label="팀 다시 선택"
              >
                <svg
                  className="w-5 h-5 text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_10px_rgba(91,79,207,0.3)]">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-ink">팀 투두 AI 매니저</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-[12px] text-muted">
                  {selectedTeam ? `${selectedTeam.teamName} · ` : ''}온라인 · 즉시 응답
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-surface transition-colors"
              aria-label="챗봇 닫기"
            >
              <svg
                className="w-5 h-5 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
            {messages.map((msg, i) =>
              msg.role === 'bot' ? (
                <div key={i} className="flex gap-2.5 items-start">
                  <BotAvatar />
                  <div className="flex flex-col gap-1 max-w-[78%]">
                    <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="text-[14px] text-ink leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted ml-1">{formatTime(msg.time)}</p>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-end">
                  <div className="flex flex-col gap-1 items-end max-w-[78%]">
                    <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3">
                      <p className="text-[14px] text-white leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted mr-1">{formatTime(msg.time)}</p>
                  </div>
                </div>
              )
            )}
            {isSending && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          <div
            className="px-4 py-2.5 flex gap-2 overflow-x-auto shrink-0 border-t border-border"
            style={{ scrollbarWidth: 'none' } as React.CSSProperties}
          >
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => handleSend(action)}
                disabled={isSending}
                className="shrink-0 px-3.5 py-2 bg-primary-light text-primary text-[13px] font-semibold rounded-full transition-colors hover:bg-[#e0daf8] disabled:opacity-50"
              >
                {action}
              </button>
            ))}
          </div>

          <div className="px-4 py-3 flex gap-2 items-center shrink-0 border-t border-border">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(input)
                }
              }}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2.5 bg-surface rounded-full text-[14px] text-ink placeholder:text-muted outline-none border border-border focus:border-primary transition-colors"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isSending}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_2px_8px_rgba(91,79,207,0.3)] transition-all hover:bg-primary-hover disabled:opacity-40 disabled:shadow-none shrink-0"
              aria-label="전송"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
