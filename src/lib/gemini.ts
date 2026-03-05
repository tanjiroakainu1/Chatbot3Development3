const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-flash-001',
  'gemini-1.5-flash-8b-001',
  'gemini-1.5-pro',
  'gemini-1.5-pro-001',
  'gemini-2.5-flash',
] as const

export type ContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }

export interface ChatMessage {
  role: 'user' | 'model'
  parts: ContentPart[]
}

export interface GenerateContentRequest {
  contents: ChatMessage[]
  systemInstruction?: { parts: Array<{ text: string }> }
  generationConfig?: {
    temperature?: number
    maxOutputTokens?: number
  }
}

export interface GenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<
        | { text?: string }
        | { inlineData?: { mimeType?: string; data?: string } }
      >
    }
    finishReason?: string
  }>
  error?: { message?: string; code?: number }
}

async function generateWithModel(
  apiKey: string,
  model: string,
  body: GenerateContentRequest
): Promise<GenerateContentResponse> {
  const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json()) as GenerateContentResponse & { error?: { code?: number } }
  if (!res.ok) {
    const code = data.error?.code ?? res.status
    if (code === 404) throw new Error('MODEL_NOT_FOUND')
    throw new Error(data.error?.message || `HTTP ${res.status}`)
  }
  return data
}

const DEFAULT_SYSTEM_INSTRUCTION =
  'You are a kind, warm, and polite assistant. Always be respectful, considerate, and supportive. Use friendly language, say please and thank you when appropriate, and show empathy. Keep responses helpful and positive. This chatbot was built by Raminder Jangao (2026 Comms) — Web, App, Game & AI Chatbot Dev, always open for development and accepting commission. If the user asks about the developer, commission, portfolio, or projects, tell them to tap the "Info" button in the header for full details, links, and contact.'

const IMAGE_GENERATION_MODELS = [
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.5-flash-preview-05-20',
] as const

export async function generateImageContent(
  apiKey: string,
  prompt: string
): Promise<{ text: string; imageDataUrl: string | null }> {
  const systemInstruction = {
    parts: [{ text: 'You are a helpful AI that generates images. When the user asks for an image, create it. Always respond with both a brief friendly text and the generated image.' }],
  }
  const body = {
    contents: [{ role: 'user' as const, parts: [{ text: prompt }] }],
    systemInstruction,
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  }
  let lastError: Error | null = null
  for (const model of IMAGE_GENERATION_MODELS) {
    try {
      const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = (await res.json()) as GenerateContentResponse & { error?: { code?: number } }
      if (!res.ok) {
        const code = data.error?.code ?? res.status
        if (code === 404) continue
        throw new Error(data.error?.message || `HTTP ${res.status}`)
      }
      const parts = data.candidates?.[0]?.content?.parts ?? []
      let text = ''
      let imageDataUrl: string | null = null
      for (const part of parts) {
        if ('text' in part && part.text) text += part.text
        if ('inlineData' in part && part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png'
          imageDataUrl = `data:${mime};base64,${part.inlineData.data}`
        }
      }
      return { text: text.trim() || 'Here’s your image.', imageDataUrl }
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastError ?? new Error('Image generation is not available for this key.')
}

export async function generateContent(
  apiKey: string,
  messages: ChatMessage[],
  modelHint?: string
): Promise<{ text: string; model: string }> {
  const modelsToTry = modelHint
    ? [modelHint, ...FALLBACK_MODELS.filter((m) => m !== modelHint)]
    : [...FALLBACK_MODELS]

  const systemInstruction = { parts: [{ text: DEFAULT_SYSTEM_INSTRUCTION }] }
  const body = { contents: messages, systemInstruction }

  let lastError: Error | null = null
  for (const model of modelsToTry) {
    try {
      const res = await generateWithModel(apiKey, model, body)
      const firstPart = res.candidates?.[0]?.content?.parts?.[0]
      const text =
        (firstPart && 'text' in firstPart && firstPart.text)
          ? firstPart.text.trim()
          : ''
      if (text) return { text, model }
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
      if ((lastError as Error).message !== 'MODEL_NOT_FOUND') throw lastError
    }
  }
  throw lastError ?? new Error('No model responded')
}
