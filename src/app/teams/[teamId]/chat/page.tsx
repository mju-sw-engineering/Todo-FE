'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTeamChat } from '@/hooks/useTeamChat'
import { getTeamById } from '@/services/teamService'
import { useChatInput } from '@/hooks/useChatInput'
import { useAuth } from '@/store/authStore'
import { CHAT_COMMAND_LABEL, CHAT_COMMAND_LIST, parseChatCommand } from '@/lib/chatCommand'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { BotReplyBubble } from '@/components/chat/BotReplyBubble'
import { CommandChip } from '@/components/chat/CommandChip'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { SlashCommandMenu } from '@/components/chat/SlashCommandMenu'
import { StickerPicker } from '@/components/chat/StickerPicker'
import { Spinner } from '@/components/ui/Spinner'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export default function TeamChatPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const teamId = Number(params.teamId)
  const { user, token } = useAuth()

  // 팀 이름: 쿼리 파라미터는 첫 진입 최적화일 뿐, 새로고침·딥링크에서도 유지되도록 조회로 보강
  const [teamName, setTeamName] = useState(() => searchParams.get('title') ?? '')
  useEffect(() => {
    if (teamName || !token || Number.isNaN(teamId)) return
    let cancelled = false
    getTeamById(teamId, token)
      .then((team) => {
        if (!cancelled) setTeamName(team.teamName)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [teamName, token, teamId])
  const title = teamName || '팀 채팅'

  const { messages, isLoadingHistory, hasNext, typingUsers, sendMessage, loadMore, notifyTyping } =
    useTeamChat(teamId, token)

  const [showPicker, setShowPicker] = useState(false)

  const {
    editableRef,
    hasContent,
    text,
    handleInput,
    handleSend,
    sendRaw,
    handleSendSticker,
    handleInsertMini,
    handleKeyDown,
    handlePaste,
  } = useChatInput({ sendMessage, notifyTyping, onSend: () => setShowPicker(false) })

  const showSlashMenu = text.startsWith('/') && !text.includes(' ') && !text.includes('\n')
  const matchedCommands = showSlashMenu
    ? CHAT_COMMAND_LIST.filter((c) => c.text.startsWith(text))
    : []

  // text가 바뀔 때마다 목록이 달라지므로, 별도 리셋 없이 매번 범위 안으로만 잘라 쓴다
  const [rawActiveIndex, setActiveCommandIndex] = useState(0)
  const activeCommandIndex = Math.min(rawActiveIndex, Math.max(0, matchedCommands.length - 1))

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (showSlashMenu && matchedCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveCommandIndex((activeCommandIndex + 1) % matchedCommands.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveCommandIndex(
          (activeCommandIndex - 1 + matchedCommands.length) % matchedCommands.length
        )
        return
      }
      if ((e.key === 'Enter' || e.key === 'Tab') && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault()
        sendRaw(matchedCommands[activeCommandIndex].text)
        return
      }
    }
    handleKeyDown(e)
  }

  const bottomRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    if (isLoadingHistory) return
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      bottomRef.current?.scrollIntoView()
      return
    }
    const el = listRef.current
    if (!el) return
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoadingHistory])

  const grouped = messages.map((msg, idx) => {
    const prev = messages[idx - 1]
    return {
      ...msg,
      isFirst: msg.senderId === null || !prev || prev.senderId !== msg.senderId,
    }
  })

  return (
    <div className="flex-1 flex flex-col bg-white animate-fade-up overflow-hidden">
      <div className="px-6 pt-8 pb-4 border-b border-border shrink-0">
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-3 flex items-center gap-1 hover:text-ink transition-colors"
        >
          ← {title}
        </button>
        <h1 className="text-[17px] font-bold text-ink">팀 채팅</h1>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1 min-h-0 relative"
      >
        {isLoadingHistory ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            {hasNext && (
              <button
                onClick={loadMore}
                className="self-center text-[12px] text-neutral-100 font-semibold py-1.5 px-4 rounded-full bg-neutral-30 mb-2 hover:bg-neutral-40 transition-colors"
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
              const command = parseChatCommand(msg.content)
              return (
                <Fragment key={`${msg.messageId}-${idx}`}>
                  <div
                    className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'} ${msg.isFirst ? 'mt-3' : 'mt-0.5'}`}
                  >
                    {!isMine && (
                      <div className="shrink-0 self-start mt-0.5">
                        {msg.isFirst ? (
                          <BlobAvatar seed={msg.senderNickname} size={32} />
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
                        {command ? (
                          <CommandChip
                            label={CHAT_COMMAND_LABEL[command]}
                            isMine={isMine}
                            pending={msg.messageId < 0}
                          />
                        ) : (
                          <MessageBubble content={msg.content} isMine={isMine} />
                        )}
                        {!isMine && (
                          <span className="text-[10px] text-muted shrink-0 mb-0.5">
                            {formatTime(msg.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 명령어 메시지 바로 아래에 비니가 답장한다 — 아직 임시(전송 중) ID면 실제 ID로
                      다시 렌더될 때까지 기다린다 */}
                  {command && msg.messageId > 0 && token && (
                    <BotReplyBubble
                      teamId={teamId}
                      messageId={msg.messageId}
                      command={command}
                      token={token}
                    />
                  )}
                </Fragment>
              )
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="px-4 pb-6 pt-3 border-t border-border bg-white shrink-0">
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

        {showSlashMenu && (
          <SlashCommandMenu
            commands={matchedCommands}
            activeIndex={activeCommandIndex}
            onHover={setActiveCommandIndex}
            onSelect={sendRaw}
          />
        )}

        {showPicker && !showSlashMenu && (
          <StickerPicker onSticker={handleSendSticker} onMini={handleInsertMini} />
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            className={`w-12 h-12 flex items-center justify-center rounded-[14px] transition-all duration-150 active:scale-90 shrink-0 ${showPicker ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            aria-label="스티커/미니티콘"
          >
            <span className="text-[24px] font-light leading-none select-none">
              {showPicker ? '×' : '+'}
            </span>
          </button>

          <div className="flex-1 relative flex items-center bg-gray-50 rounded-2xl px-4 min-h-12">
            {!hasContent && (
              <span className="absolute text-[16px] text-muted pointer-events-none select-none">
                메시지를 입력하세요...
              </span>
            )}
            <div
              ref={editableRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleInputKeyDown}
              onPaste={handlePaste}
              className="w-full outline-none text-[16px] text-ink py-3 leading-normal"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!hasContent}
            className="w-12 h-12 flex items-center justify-center rounded-[14px] bg-primary text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] disabled:opacity-35 disabled:shadow-none transition-all duration-150 active:scale-90 shrink-0"
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
