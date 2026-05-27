'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTodoChat } from '@/hooks/useTodoChat'
import { useAuth } from '@/store/authStore'
import { AVATAR_COLORS, getInitials } from '@/lib/formatters'

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function TodoChatPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const todoId = Number(params.todoId)
  const { token, user } = useAuth()
  const title = searchParams.get('title') ?? '채팅'

  const { messages, isConnected, isLoadingHistory, hasNext, sendMessage, loadMore } = useTodoChat(
    todoId,
    token
  )

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const isFirstLoad = useRef(true)

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (isLoadingHistory) return
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      bottomRef.current?.scrollIntoView()
      return
    }
    // Only auto-scroll if near bottom
    const el = listRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (isNearBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoadingHistory])

  function handleSend() {
    if (!input.trim()) return
    sendMessage(input, user?.userId ? { userId: user.userId, nickname: user.nickname } : null)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group consecutive messages from same user
  const grouped = messages.map((msg, idx) => {
    const prev = messages[idx - 1]
    const isFirst = !prev || prev.userId !== msg.userId
    return { ...msg, isFirst }
  })

  return (
    <div className="flex-1 flex flex-col bg-white animate-fade-up overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 border-b border-border shrink-0">
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-3 flex items-center gap-1 hover:text-primary transition-colors"
        >
          ← {title}
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-[17px] font-bold text-ink">채팅</h1>
          <span
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full ${
              isConnected ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-100'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}
            />
            {isConnected ? '연결됨' : '연결 중...'}
          </span>
        </div>
      </div>

      {/* Message list */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1 min-h-0">
        {isLoadingHistory ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-7 h-7 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {hasNext && (
              <button
                onClick={loadMore}
                className="self-center text-[12px] text-primary font-semibold py-1.5 px-4 rounded-full bg-primary-light mb-2 hover:bg-[#e0daf8] transition-colors"
              >
                이전 메시지 더 보기
              </button>
            )}
            {grouped.length === 0 && (
              <p className="text-[13px] text-muted text-center mt-12">
                아직 메시지가 없어요. 첫 번째로 말해보세요! 💬
              </p>
            )}
            {grouped.map((msg, idx) => {
              const isMine = user?.userId === msg.userId
              const avatarColor = AVATAR_COLORS[msg.userId % AVATAR_COLORS.length]

              return (
                <div
                  key={`${msg.chatId}-${idx}`}
                  className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'} ${msg.isFirst ? 'mt-3' : 'mt-0.5'}`}
                >
                  {/* Avatar */}
                  {!isMine && (
                    <div className="flex flex-col items-center shrink-0 self-start mt-0.5">
                      {msg.isFirst ? (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${avatarColor}`}
                        >
                          {getInitials(msg.nickname)}
                        </div>
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>
                  )}

                  <div
                    className={`flex flex-col gap-0.5 max-w-[72%] ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    {!isMine && msg.isFirst && (
                      <span className="text-[11px] font-semibold text-ink/50 ml-1">
                        {msg.nickname}
                      </span>
                    )}
                    <div className="flex items-end gap-1.5">
                      {isMine && (
                        <span className="text-[10px] text-muted shrink-0 mb-0.5">
                          {formatTime(msg.createdAt)}
                        </span>
                      )}
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed wrap-break-word ${
                          isMine
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-gray-100 text-ink rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                      {!isMine && (
                        <span className="text-[10px] text-muted shrink-0 mb-0.5">
                          {formatTime(msg.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <div className="px-4 pb-6 pt-3 border-t border-border bg-white shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 flex items-center bg-gray-50 rounded-2xl px-4 py-3 min-h-12">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-muted outline-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-12 h-12 flex items-center justify-center rounded-[14px] bg-primary text-white shadow-[0_4px_14px_rgba(91,79,207,0.3)] disabled:opacity-35 disabled:shadow-none transition-all duration-150 active:scale-90 shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M17 10L3 4l3 6-3 6 14-6z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
