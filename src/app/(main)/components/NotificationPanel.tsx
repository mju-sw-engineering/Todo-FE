'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  FiAlertTriangle,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiHeart,
  FiLock,
  FiMessageCircle,
  FiPlusSquare,
  FiShield,
  FiUpload,
  FiUserMinus,
  FiUserPlus,
  FiUserX,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/store/authStore'
import { StickerEmoji } from '@/components/chat/StickerEmoji'
import { STICKER_TYPES, STICKER_PREFIX, parseStandaloneSticker } from '@/lib/sticker'
import { formatRelativeTime } from '@/lib/dateUtils'
import { getTeams } from '@/services/teamService'
import { getHistoryTodos } from '@/services/todoService'
import type { AppNotification, NotificationType } from '@/types/notification.types'
import type { StickerType } from '@/lib/sticker'

// ─── Title / content parsing ──────────────────────────────────────────────────

function extractSender(title: string): string {
  const m = title.match(/^(.+?)님이/)
  return m ? m[1] : ''
}

function stripContentPrefix(content: string): string {
  const idx = content.indexOf(': ')
  return idx !== -1 ? content.slice(idx + 2) : content
}

// ─── Notification-specific inline parsing ─────────────────────────────────────

const NOTIF_INLINE_RE = new RegExp(
  `\\[(${STICKER_TYPES.join('|')})\\]|${STICKER_PREFIX.replace(':', '\\:')}(${STICKER_TYPES.join('|')})|\\b(${STICKER_TYPES.join('|')})\\b`,
  'g'
)

type ContentPart = { t: 'text'; s: string } | { t: 'emoji'; e: StickerType }

function asStickerType(s: string | undefined): StickerType | null {
  if (!s) return null
  return STICKER_TYPES.includes(s as StickerType) ? (s as StickerType) : null
}

function parseContentParts(content: string): ContentPart[] {
  const parts: ContentPart[] = []
  let last = 0
  NOTIF_INLINE_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = NOTIF_INLINE_RE.exec(content)) !== null) {
    const type = asStickerType(m[1] ?? m[2] ?? m[3])
    if (!type) continue
    if (m.index > last) parts.push({ t: 'text', s: content.slice(last, m.index) })
    parts.push({ t: 'emoji', e: type })
    last = m.index + m[0].length
  }
  if (last < content.length) parts.push({ t: 'text', s: content.slice(last) })
  return parts.length ? parts : [{ t: 'text', s: content }]
}

// ─── NotificationContent ──────────────────────────────────────────────────────

function NotificationContent({ content }: { content: string }) {
  const standalone = parseStandaloneSticker(content)
  if (standalone) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <StickerEmoji type={standalone} size={28} />
        <span className="text-muted text-[12px]">스티커</span>
      </span>
    )
  }

  const parts = parseContentParts(content)
  if (!parts.some((p) => p.t === 'emoji')) {
    return <span className="wrap-break-word">{content}</span>
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-0.5">
      {parts.map((p, i) =>
        p.t === 'text' ? (
          <span key={i} className="wrap-break-word">
            {p.s}
          </span>
        ) : (
          <span key={i} className="inline-flex items-center shrink-0 leading-none">
            <StickerEmoji type={p.e} size={18} />
          </span>
        )
      )}
    </span>
  )
}

// ─── Notification type → icon / tone ───────────────────────────────────────────

type NotificationTone = 'primary' | 'secondary' | 'red' | 'neutral'

const TONE_CLASSES: Record<NotificationTone, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary-50/10 text-secondary-50',
  red: 'bg-status-red/10 text-status-red',
  neutral: 'bg-neutral-30 text-neutral-80',
}

const NOTIFICATION_META: Record<NotificationType, { Icon: IconType; tone: NotificationTone }> = {
  CHAT_MESSAGE: { Icon: FiMessageCircle, tone: 'primary' },
  TODO_CREATED: { Icon: FiPlusSquare, tone: 'primary' },
  TODO_ASSIGNED: { Icon: FiUserPlus, tone: 'primary' },
  TODO_UNASSIGNED: { Icon: FiUserX, tone: 'neutral' },
  TODO_SUBMITTED: { Icon: FiUpload, tone: 'primary' },
  TODO_DEADLINE_APPROACHING: { Icon: FiClock, tone: 'secondary' },
  TODO_WORK_ITEM_EXPIRED: { Icon: FiAlertTriangle, tone: 'red' },
  TODO_REACTION_ADDED: { Icon: FiHeart, tone: 'primary' },
  TODO_ALL_COMPLETED: { Icon: FiCheckCircle, tone: 'primary' },
  TEAM_MEMBER_JOINED: { Icon: FiUserPlus, tone: 'secondary' },
  TEAM_MEMBER_LEFT: { Icon: FiUserMinus, tone: 'neutral' },
  TEAM_MEMBER_REMOVED: { Icon: FiUserX, tone: 'red' },
  TEAM_LEADER_CHANGED: { Icon: FiAward, tone: 'secondary' },
  NEW_DEVICE_LOGIN: { Icon: FiShield, tone: 'red' },
  PASSWORD_CHANGED: { Icon: FiLock, tone: 'red' },
  AVAILABILITY_POLL_CREATED: { Icon: FiCalendar, tone: 'secondary' },
}

function NotificationIcon({ type }: { type: NotificationType }) {
  const { Icon, tone } = NOTIFICATION_META[type]
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${TONE_CLASSES[tone]}`}
    >
      <Icon size={15} />
    </div>
  )
}

// ─── NotificationItem ──────────────────────────────────────────────────────────

function NotificationItem({
  notification,
  onRead,
  onOpen,
}: {
  notification: AppNotification
  onRead: (id: number) => void
  onOpen: (notification: AppNotification) => void
}) {
  const sender = extractSender(notification.title)
  const message = stripContentPrefix(notification.content)

  return (
    <button
      type="button"
      onClick={() => {
        if (!notification.isRead) onRead(notification.notificationId)
        onOpen(notification)
      }}
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-gray-50 ${notification.isRead ? 'opacity-50' : ''}`}
    >
      <NotificationIcon type={notification.type} />
      <div className="flex-1 min-w-0">
        {sender && <p className="text-[12px] font-semibold text-ink truncate">{sender}</p>}
        <p className="text-[13px] text-gray-600 leading-snug">
          <NotificationContent content={message} />
        </p>
        <p className="text-[11px] text-muted mt-0.5">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
    </button>
  )
}

// ─── NotificationBell ──────────────────────────────────────────────────────────

export function NotificationBell() {
  const router = useRouter()
  const { token } = useAuth()
  const {
    unreadCount,
    notifications,
    hasNext,
    isLoading,
    loadNotifications,
    markRead,
    markAllRead,
  } = useNotifications(token)
  const [isOpen, setIsOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState<{ top: number; right: number }>({
    top: 56,
    right: 20,
  })
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setPanelStyle({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
  }, [isOpen])

  async function openTodoNotification(notification: AppNotification, token: string) {
    try {
      const { teams } = await getTeams(token)
      const now = new Date()
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`
      const todoLists = await Promise.all(
        teams.map(async (team) => ({
          teamId: team.teamId,
          todos: await getHistoryTodos(team.teamId, today, token),
        }))
      )
      const owner = todoLists.find(({ todos }) =>
        todos.some((todo) => todo.todoId === notification.referenceId)
      )
      router.push(owner ? `/teams/${owner.teamId}/todos/${notification.referenceId}` : '/teams')
    } catch {
      router.push('/teams')
    }
  }

  async function openNotification(notification: AppNotification) {
    setIsOpen(false)
    if (!token) return

    switch (notification.type) {
      case 'TODO_CREATED':
      case 'TODO_ASSIGNED':
      case 'TODO_UNASSIGNED':
      case 'TODO_SUBMITTED':
      case 'TODO_DEADLINE_APPROACHING':
      case 'TODO_WORK_ITEM_EXPIRED':
      case 'TODO_REACTION_ADDED':
      case 'TODO_ALL_COMPLETED':
        // referenceId가 투두 ID라, 어느 팀 소속인지 팀들을 뒤져야 한다
        await openTodoNotification(notification, token)
        return
      case 'CHAT_MESSAGE':
        router.push(`/teams/${notification.referenceId}/chat`)
        return
      case 'TEAM_MEMBER_JOINED':
      case 'TEAM_MEMBER_LEFT':
      case 'TEAM_MEMBER_REMOVED':
      case 'TEAM_LEADER_CHANGED':
        router.push(`/teams/${notification.referenceId}`)
        return
      case 'AVAILABILITY_POLL_CREATED':
        router.push(`/teams/${notification.referenceId}/availability`)
        return
      case 'NEW_DEVICE_LOGIN':
      case 'PASSWORD_CHANGED':
        router.push('/mypage')
        return
    }
  }

  useEffect(() => {
    if (isOpen) loadNotifications(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const panel = isOpen ? (
    <div
      ref={panelRef}
      style={{ top: panelStyle.top, right: panelStyle.right }}
      className="fixed w-80 max-h-105 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-border overflow-hidden flex flex-col z-9999"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <span className="text-[14px] font-bold text-ink">알림</span>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-[12px] font-semibold text-muted hover:text-ink transition-colors"
          >
            모두 읽음
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 divide-y divide-border">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-[13px] text-muted text-center py-10">알림이 없어요</p>
        ) : (
          <>
            {notifications.map((n) => (
              <NotificationItem
                key={n.notificationId}
                notification={n}
                onRead={markRead}
                onOpen={openNotification}
              />
            ))}
            {hasNext && (
              <button
                type="button"
                onClick={() => loadNotifications(false)}
                disabled={isLoading}
                className="w-full py-3 text-[12px] font-semibold text-muted hover:text-ink transition-colors"
              >
                {isLoading ? '불러오는 중...' : '더 보기'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  ) : null

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        aria-label="알림"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-muted">
          <path
            d="M10 2a6 6 0 00-6 6v3.5L2.5 14h15L16 11.5V8a6 6 0 00-6-6z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M8 14a2 2 0 004 0"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4 h-4 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {typeof document !== 'undefined' && panel && createPortal(panel, document.body)}
    </div>
  )
}
