'use client'

import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTodoChat } from '@/hooks/useTodoChat'
import { useAuth } from '@/store/authStore'
import { AVATAR_COLORS, getInitials } from '@/lib/formatters'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { ReactionEmoji } from '@/components/ui/ReactionEmoji'
import { AngelBlob, DevilBlob } from '@/components/ui/BlobCharacter'
import type { ReactionType } from '@/types/todo.types'

// ─── Sticker / inline-emoji encoding ──────────────────────────────────────────

type StickerType = ReactionType | 'ANGEL' | 'DEVIL'

const STICKER_PREFIX = '__sticker__:'
const STICKER_TYPES: StickerType[] = [
  'LIKE',
  'HEART',
  'SURPRISED',
  'DISLIKE',
  'ANGRY',
  'ANGEL',
  'DEVIL',
]
const INLINE_RE = /\[(LIKE|HEART|SURPRISED|DISLIKE|ANGRY|ANGEL|DEVIL)\]/g

function parseStickerType(content: string): StickerType | null {
  if (!content.startsWith(STICKER_PREFIX)) return null
  const type = content.slice(STICKER_PREFIX.length) as StickerType
  return STICKER_TYPES.includes(type) ? type : null
}

function StickerEmoji({ type, size }: { type: StickerType; size: number }) {
  if (type === 'ANGEL') return <AngelBlob size={size} />
  if (type === 'DEVIL') return <DevilBlob size={size} />
  return <ReactionEmoji type={type as ReactionType} size={size} />
}

type MsgPart = { t: 'text'; s: string } | { t: 'emoji'; e: StickerType }

function parseParts(content: string): MsgPart[] {
  const parts: MsgPart[] = []
  let last = 0
  INLINE_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = INLINE_RE.exec(content)) !== null) {
    if (m.index > last) parts.push({ t: 'text', s: content.slice(last, m.index) })
    parts.push({ t: 'emoji', e: m[1] as StickerType })
    last = m.index + m[0].length
  }
  if (last < content.length) parts.push({ t: 'text', s: content.slice(last) })
  return parts.length ? parts : [{ t: 'text', s: content }]
}

// ─── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ content, isMine }: { content: string; isMine: boolean }) {
  const stickerType = parseStickerType(content)
  if (stickerType) {
    return (
      <div className="p-1 active:scale-95 transition-transform select-none">
        <StickerEmoji type={stickerType} size={80} />
      </div>
    )
  }

  const parts = parseParts(content)
  const hasEmoji = parts.some((p) => p.t === 'emoji')
  const bubbleBase = `px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
    isMine ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-gray-100 text-ink rounded-bl-sm'
  }`

  if (!hasEmoji) {
    return <div className={`${bubbleBase} wrap-break-word`}>{content}</div>
  }

  return (
    <div className={`${bubbleBase} flex flex-wrap items-center gap-x-0.5 gap-y-0.5`}>
      {parts.map((p, i) =>
        p.t === 'text' ? (
          <span key={i} className="wrap-break-word">
            {p.s}
          </span>
        ) : (
          <span key={i} className="inline-flex items-center shrink-0 leading-none">
            <StickerEmoji type={p.e} size={22} />
          </span>
        )
      )}
    </div>
  )
}

// ─── Sticker picker ────────────────────────────────────────────────────────────

function StickerPicker({
  onSticker,
  onMini,
}: {
  onSticker: (t: StickerType) => void
  onMini: (t: StickerType) => void
}) {
  return (
    <div className="mb-2 bg-gray-50 rounded-2xl px-3 pt-3 pb-2">
      <p className="text-[11px] font-semibold text-muted mb-1.5">큰 스티커</p>
      <div className="flex items-center justify-around mb-3">
        {STICKER_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onSticker(type)}
            className="active:scale-90 transition-transform"
            aria-label={type}
          >
            <StickerEmoji type={type} size={46} />
          </button>
        ))}
      </div>

      <div className="border-t border-border mb-2" />

      <p className="text-[11px] font-semibold text-muted mb-1.5">
        미니티콘 <span className="font-normal opacity-60">텍스트에 추가</span>
      </p>
      <div className="flex items-center justify-around pb-1">
        {STICKER_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onMini(type)}
            className="active:scale-90 transition-transform"
            aria-label={type}
          >
            <StickerEmoji type={type} size={30} />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TodoChatPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const todoId = Number(params.todoId)
  const { token, user } = useAuth()
  const title = searchParams.get('title') ?? '채팅'

  const {
    messages,
    isConnected,
    isLoadingHistory,
    hasNext,
    typingUsers,
    sendMessage,
    loadMore,
    notifyTyping,
  } = useTodoChat(todoId, token)

  const [showPicker, setShowPicker] = useState(false)
  const [hasContent, setHasContent] = useState(false)

  const editableRef = useRef<HTMLDivElement>(null)

  const emojiRootsRef = useRef<ReturnType<typeof createRoot>[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const isFirstLoad = useRef(true)

  // Cleanup emoji roots on unmount
  useEffect(() => {
    return () => {
      emojiRootsRef.current.forEach((r) => r.unmount())
    }
  }, [])

  useEffect(() => {
    if (isLoadingHistory) return
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      bottomRef.current?.scrollIntoView()
      return
    }
    const el = listRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (isNearBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoadingHistory])

  // ── contenteditable helpers ──────────────────────────────────────────────────

  function getContentText(): string {
    const el = editableRef.current
    if (!el) return ''
    let result = ''
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent ?? ''
      } else if (node instanceof HTMLElement) {
        const emoji = node.getAttribute('data-emoji')
        if (emoji) result += `[${emoji}]`
        else result += node.textContent ?? ''
      }
    })
    return result
  }

  function clearInput() {
    emojiRootsRef.current.forEach((r) => r.unmount())
    emojiRootsRef.current = []
    if (editableRef.current) editableRef.current.innerHTML = ''
    setHasContent(false)
  }

  function handleInput() {
    const text = getContentText()
    setHasContent(text.trim().length > 0)
    if (text.trim()) notifyTyping()
  }

  function handleSend() {
    const content = getContentText().trim()
    if (!content) return
    sendMessage(content)
    clearInput()
    setShowPicker(false)
  }

  function handleSendSticker(type: StickerType) {
    sendMessage(`${STICKER_PREFIX}${type}`)
    setShowPicker(false)
  }

  function handleInsertMini(type: StickerType) {
    const el = editableRef.current
    if (!el) return

    el.focus()

    const span = document.createElement('span')
    span.setAttribute('data-emoji', type)
    span.setAttribute('contenteditable', 'false')
    span.style.cssText =
      'display:inline-flex;align-items:center;vertical-align:middle;margin:0 1px;user-select:none;'

    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0)
      range.deleteContents()
      range.insertNode(span)
      range.setStartAfter(span)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    } else {
      el.appendChild(span)
    }

    const root = createRoot(span)
    root.render(<StickerEmoji type={type} size={22} />)
    emojiRootsRef.current.push(root)

    setHasContent(true)
    notifyTyping()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  // Prevent pasting rich HTML
  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const grouped = messages.map((msg, idx) => {
    const prev = messages[idx - 1]
    return { ...msg, isFirst: !prev || prev.senderId !== msg.senderId }
  })

  return (
    <div className="flex-1 flex flex-col bg-white animate-fade-up overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 border-b border-border shrink-0">
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-3 flex items-center gap-1 hover:text-gray-700 transition-colors"
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
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1 min-h-0 relative"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <BlobAvatar seed={title} size={200} className="opacity-[0.045]" />
        </div>

        {isLoadingHistory ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-7 h-7 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {hasNext && (
              <button
                onClick={loadMore}
                className="self-center text-[12px] text-gray-700 font-semibold py-1.5 px-4 rounded-full bg-gray-100 mb-2 hover:bg-gray-200 transition-colors"
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
              const isMine =
                msg.messageId < 0
                  ? true
                  : user?.userId != null
                    ? msg.senderId === user.userId
                    : msg.senderNickname === (user?.nickname ?? user?.loginId)
              const avatarColor =
                AVATAR_COLORS[Math.abs(msg.senderId || msg.messageId) % AVATAR_COLORS.length]

              return (
                <div
                  key={`${msg.messageId}-${idx}`}
                  className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'} ${msg.isFirst ? 'mt-3' : 'mt-0.5'}`}
                >
                  {!isMine && (
                    <div className="shrink-0 self-start mt-0.5">
                      {msg.isFirst ? (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${avatarColor}`}
                        >
                          {getInitials(msg.senderNickname)}
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
                        {msg.senderNickname}
                      </span>
                    )}
                    <div className="flex items-end gap-1.5">
                      {isMine && (
                        <span className="text-[10px] text-muted shrink-0 mb-0.5">
                          {formatTime(msg.createdAt)}
                        </span>
                      )}
                      <MessageBubble content={msg.content} isMine={isMine} />
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
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-[12px] text-muted">
              {typingUsers.length === 1
                ? `${typingUsers[0]}님이 입력 중...`
                : `${typingUsers[0]} 외 ${typingUsers.length - 1}명이 입력 중...`}
            </span>
          </div>
        )}

        {/* Sticker / miniticon picker */}
        {showPicker && <StickerPicker onSticker={handleSendSticker} onMini={handleInsertMini} />}

        {/* Input row */}
        <div className="flex items-center gap-2">
          {/* + toggle */}
          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            className={`w-12 h-12 flex items-center justify-center rounded-[14px] transition-all duration-150 active:scale-90 shrink-0 ${
              showPicker ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="스티커/미니티콘"
          >
            <span className="text-[24px] font-light leading-none select-none">
              {showPicker ? '×' : '+'}
            </span>
          </button>

          {/* Contenteditable input — renders inline emoji visually */}
          <div className="flex-1 relative flex items-center bg-gray-50 rounded-2xl px-4 min-h-12">
            {!hasContent && (
              <span className="absolute text-[14px] text-muted pointer-events-none select-none">
                메시지를 입력하세요...
              </span>
            )}
            <div
              ref={editableRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              className="w-full outline-none text-[14px] text-ink py-3 leading-normal"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!hasContent}
            className="w-12 h-12 flex items-center justify-center rounded-[14px] bg-gray-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] disabled:opacity-35 disabled:shadow-none transition-all duration-150 active:scale-90 shrink-0"
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
