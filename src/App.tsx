import { useState, useRef, useEffect } from 'react'
import { generateContent, generateImageContent, type ChatMessage, type ContentPart } from './lib/gemini'
import { FloatingParticles } from './components/FloatingParticles'
import { DeveloperInfoModal } from './components/DeveloperInfoModal'

interface Message {
  id: string
  role: 'user' | 'model'
  text: string
  imagePreview?: string
  generatedImage?: string
}

const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? ''

const CHATBOT_PROFILE_IMAGE = '/chatbot-profile.png'
const CHATBOT_PROFILE_FALLBACK = '/chatbot-profile.svg'

function fileToBase64(file: File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve({ data: base64, mimeType: file.type || 'image/jpeg' })
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeModel, setActiveModel] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ file: File; dataUrl: string } | null>(null)
  const [viewingImage, setViewingImage] = useState<string | null>(null)
  const [generateImageMode, setGenerateImageMode] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if ((!text && !selectedImage) || loading || !apiKey) return
    const question = text || 'What is in this photo?'
    setInput('')
    setError(null)
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: generateImageMode ? `Generate image: ${question}` : question,
      imagePreview: selectedImage?.dataUrl,
    }
    setMessages((m) => [...m, userMsg])
    const imageToSend = selectedImage
    const wasImageMode = generateImageMode
    setSelectedImage(null)
    setGenerateImageMode(false)
    setLoading(true)
    try {
      if (wasImageMode) {
        const { text: reply, imageDataUrl } = await generateImageContent(apiKey, question)
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: 'model', text: reply, generatedImage: imageDataUrl ?? undefined },
        ])
        return
      }
      const history: ChatMessage[] = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }))
      const newParts: ContentPart[] = []
      if (imageToSend) {
        const { data, mimeType } = await fileToBase64(imageToSend.file)
        newParts.push({ inlineData: { mimeType, data } })
      }
      newParts.push({ text: question })
      history.push({ role: 'user', parts: newParts })
      const { text: reply, model } = await generateContent(apiKey, history, activeModel ?? undefined)
      setActiveModel(model)
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'model', text: reply }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
        <FloatingParticles />
        <p className="relative z-10 text-amber-400 font-medium">Please add VITE_GEMINI_API_KEY to your .env file.</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] h-[100dvh] max-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden w-full">
      <FloatingParticles />
      <header className="relative z-10 border-b border-slate-700/60 bg-slate-900/80 backdrop-blur shrink-0 safe-top flex-none">
        <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <img
              src={CHATBOT_PROFILE_IMAGE}
              alt=""
              className="w-8 h-8 rounded-full shrink-0 object-cover border border-slate-600"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = CHATBOT_PROFILE_FALLBACK
              }}
            />
            <h1 className="text-base sm:text-lg font-semibold text-white truncate">Chatbot</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
            <button
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="text-[10px] sm:text-xs text-slate-500 hover:text-indigo-400 px-2 py-1.5 rounded transition-colors whitespace-nowrap"
              title="Developer info, commission & portfolio"
            >
              Info
            </button>
            <span className="hidden xs:inline text-[10px] sm:text-xs text-slate-500 text-right truncate max-w-[100px] sm:max-w-[160px] md:max-w-none" title="Raminder Jangao — Fullstack Developer (Web, App, Game, AI Chatbot)">
              Raminder Jangao · Fullstack Developer (Web, App, Game, AI Chatbot)
            </span>
          </div>
        </div>
      </header>
      {showInfoModal && <DeveloperInfoModal onClose={() => setShowInfoModal(false)} />}

      <button
        type="button"
        onClick={() => setShowInfoModal(true)}
        className="fixed left-3 sm:left-4 bottom-28 z-20 px-3 py-2 rounded-full bg-slate-800/95 border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/95 hover:border-indigo-500/50 shadow-lg transition-colors text-[11px] sm:text-xs font-medium w-auto max-w-[calc(100vw-1.5rem)]"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        title="Who built this? What services does the developer offer?"
      >
        <span className="hidden sm:inline">Who built this? · </span>What services?
      </button>

      <div className="chat-scroll scrollbar-dark relative z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full">
        <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 box-border">
          {messages.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">Type a message below.</p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2 ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              {m.role === 'model' && (
                <img
                  src={CHATBOT_PROFILE_IMAGE}
                  alt="Chatbot"
                  className="w-9 h-9 rounded-full shrink-0 object-cover border border-slate-600"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = CHATBOT_PROFILE_FALLBACK
                  }}
                />
              )}
              <div
                className={`max-w-[85%] min-w-0 rounded-2xl px-3 sm:px-4 py-2.5 ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-bl-md'
                    : 'bg-slate-800 text-slate-100 border border-slate-700/50 rounded-br-md'
                }`}
              >
                {m.role === 'user' && m.imagePreview && (
                  <button
                    type="button"
                    onClick={() => setViewingImage(m.imagePreview!)}
                    className="mb-2 rounded-lg overflow-hidden max-w-[200px] sm:max-w-[260px] block text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-indigo-600 min-h-[44px] min-w-[44px]"
                    title="Click to view full size"
                  >
                    <img src={m.imagePreview} alt="Attached photo" className="w-full h-auto block pointer-events-none" />
                  </button>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                {m.role === 'model' && m.generatedImage && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setViewingImage(m.generatedImage!)}
                      className="rounded-lg overflow-hidden max-w-[280px] sm:max-w-[320px] block text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                      title="Click to view full size"
                    >
                      <img src={m.generatedImage} alt="Generated" className="w-full h-auto block pointer-events-none" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 justify-end">
              <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-br-md px-4 py-2.5">
                <span className="text-slate-400 text-sm">One moment, please…</span>
              </div>
              <img
                src={CHATBOT_PROFILE_IMAGE}
                alt="Chatbot"
                className="w-9 h-9 rounded-full shrink-0 object-cover border border-slate-600"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = CHATBOT_PROFILE_FALLBACK
                }}
              />
            </div>
          )}
          {error && (
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-xl bg-red-950/50 border border-red-800/50 px-4 py-2 text-red-300 text-sm">
                {error}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {viewingImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 safe-top safe-bottom"
          onClick={() => setViewingImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="View photo"
        >
          <button
            type="button"
            onClick={() => setViewingImage(null)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/90 hover:text-white text-2xl leading-none w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 min-h-[44px] min-w-[44px]"
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={viewingImage}
            alt="Full size"
            className="max-w-full max-h-[85vh] max-h-[85dvh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="relative z-10 border-t border-slate-700/60 bg-slate-900/50 p-3 sm:p-4 safe-bottom shrink-0 w-full box-border">
        {selectedImage && (
          <div className="w-full max-w-2xl mx-auto mb-2 flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setViewingImage(selectedImage.dataUrl)}
              className="h-12 w-12 min-h-[44px] min-w-[44px] rounded-lg overflow-hidden border border-slate-600 shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Click to view"
            >
              <img src={selectedImage.dataUrl} alt="Preview" className="h-full w-full object-cover block" />
            </button>
            <span className="text-slate-400 text-sm truncate flex-1 min-w-0">{selectedImage.file.name}</span>
            <button type="button" onClick={() => setSelectedImage(null)} className="text-slate-400 hover:text-white text-sm py-2 px-1 min-h-[44px] shrink-0" aria-label="Remove photo">Remove</button>
          </div>
        )}
        <div className="w-full max-w-2xl mx-auto flex gap-2 sm:gap-3 items-center flex-wrap sm:flex-nowrap min-w-0">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0]
            if (file && file.type.startsWith('image/')) {
              setSelectedImage({ file, dataUrl: URL.createObjectURL(file) })
            }
            e.target.value = ''
          }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading} className="shrink-0 rounded-xl border border-slate-600 bg-slate-800 text-slate-300 px-3 sm:px-4 py-3 text-sm hover:bg-slate-700 hover:text-white disabled:opacity-50 min-h-[44px]" title="Choose a photo to ask about">Photo</button>
          <button type="button" onClick={() => setGenerateImageMode((v) => !v)} disabled={loading} className={`shrink-0 rounded-xl border px-3 sm:px-4 py-3 text-sm min-h-[44px] transition-colors ${generateImageMode ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'} disabled:opacity-50`} title="Generate an image from your prompt">Image</button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={generateImageMode ? 'Describe the image to generate…' : selectedImage ? 'Ask about this photo…' : "Type a message… (I'll reply kindly)"}
            className="flex-1 min-w-0 rounded-xl bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 px-3 sm:px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px]"
            disabled={loading}
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || (!input.trim() && !selectedImage)}
            className="rounded-xl bg-indigo-600 text-white px-4 sm:px-5 py-3 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 min-h-[44px]"
          >
            Send
          </button>
        </div>
        <p className="text-center text-[10px] sm:text-xs text-slate-600 mt-2 sm:mt-3 px-1 break-words">Developed by Raminder Jangao — Fullstack Developer (Web, App, Game, AI Chatbot Developer)</p>
      </div>
    </div>
  )
}

export default App
