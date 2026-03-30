const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY

const buildPrompt = (journalEntry, books = [], hobbies = []) => `
You are a compassionate personal growth assistant.
Analyze the following journal entry and extract structured insights.

Return ONLY a valid JSON object — no explanation, no markdown, no extra text.
Use this exact structure:

{
  "happy": ["things that made the person happy"],
  "sad": ["things that made them sad or stressed"],
  "gratitude": ["things they are grateful for"],
  "learnings": ["key lessons or realizations"],
  "motivation": "one short motivational sentence",
  "keyTakeaway": "the single most important insight",
  "tasksForTomorrow": ["actionable tasks for tomorrow"],
  "habitsDetected": ["recurring behaviors or patterns"],
  "trackerUpdates": {
    "books": [],
    "hobbies": []
  }
}

Rules for main fields:
- If nothing relevant, return empty array [] or empty string ""
- Keep each item concise (max 10 words)
- Be empathetic and constructive

Rules for trackerUpdates:
- "books": look for any mention of reading pages. 
  If found, return: [{ "title": "exact book title mentioned", "pagesRead": number }]
  Match against these existing books if possible: ${books.map(b => b.title).join(', ') || 'none yet'}
  
- "hobbies": look for any hobby activity mentioned (gym, cricket, writing, meditation, etc).
  Return list of hobby names detected: ["cricket", "gym"]
  Match against these existing hobbies if possible: ${hobbies.map(h => h.name).join(', ') || 'none yet'}
  
- If no tracker updates found, return empty arrays for both

Journal Entry:
"""
${journalEntry}
"""
`

const MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-live-preview',
  'gemini-3.1-pro-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',

  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-8b',

  'gemini-1.0-pro',
]

async function tryModel(modelName, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_KEY}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.error?.message || `HTTP ${res.status}`)
  }
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response')
  return text
}

export async function analyzeJournal(journalEntry, books = [], hobbies = []) {
  const prompt = buildPrompt(journalEntry, books, hobbies)
  for (const model of MODELS) {
    try {
      const text = await tryModel(model, prompt)
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
      const insights = JSON.parse(cleaned)
      return { success: true, data: insights }
    } catch (err) {
      console.warn(`Model ${model} failed:`, err.message)
      continue
    }
  }
  return { success: false, error: 'Analysis failed. Check your Gemini API key.' }
}