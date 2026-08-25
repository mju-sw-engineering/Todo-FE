import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { StickerEmoji } from '@/components/chat/StickerEmoji'
import { STICKER_PREFIX } from '@/lib/sticker'
import type { StickerType } from '@/lib/sticker'

interface UseChatInputOptions {
  sendMessage: (content: string) => void
  notifyTyping: () => void
  onSend?: () => void
}

export function useChatInput({ sendMessage, notifyTyping, onSend }: UseChatInputOptions) {
  const editableRef = useRef<HTMLDivElement>(null)
  const emojiRootsRef = useRef<ReturnType<typeof createRoot>[]>([])
  const [hasContent, setHasContent] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    return () => {
      emojiRootsRef.current.forEach((r) => r.unmount())
    }
  }, [])

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
    setText('')
  }

  function handleInput() {
    const content = getContentText()
    setText(content)
    setHasContent(content.trim().length > 0)
    if (content.trim()) notifyTyping()
  }

  function handleSend() {
    const content = getContentText().trim()
    if (!content) return
    sendMessage(content)
    clearInput()
    onSend?.()
  }

  /** 자동완성에서 명령어를 탭했을 때처럼, 입력창을 거치지 않고 바로 보낸다 */
  function sendRaw(content: string) {
    if (!content) return
    sendMessage(content)
    clearInput()
    onSend?.()
  }

  function handleSendSticker(type: StickerType) {
    sendMessage(`${STICKER_PREFIX}${type}`)
    onSend?.()
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

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return {
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
  }
}
