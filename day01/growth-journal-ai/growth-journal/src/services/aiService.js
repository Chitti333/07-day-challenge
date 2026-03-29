const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

const buildPrompt = (journalEntry) => `
You are a compassionate personal growth assistant.
Analyze the following journal entry and extract structured insights.

Return ONLY a valid JSON object — no explanation, no markdown, no extra text.
Use this exact structure:

{
  "happy": ["list of things that made the person happy"],
  "sad": ["list of things that made them sad or stressed"],
  "gratitude": ["things they are or should be grateful for"],
  "learnings": ["key lessons or realizations from the day"],
  "motivation": "one short motivational sentence based on their day",
  "keyTakeaway": "the single most important insight from this entry",
  "tasksForTomorrow": ["actionable tasks they should do tomorrow"],
  "habitsDetected": ["recurring behaviors or patterns noticed"]
}

Rules:
- If a category has nothing relevant, return an empty array [] or empty string ""
- Keep each item concise (max 10 words)
- Be empathetic and constructive
- Infer tasks and habits even if not explicitly stated

Journal Entry:
"""
${journalEntry}
"""
`

export async function analyzeJournal(journalEntry) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Growth Journal'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct',
        messages: [
          {
            role: 'user',
            content: buildPrompt(journalEntry)
          }
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData?.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content

    if (!text) throw new Error('Empty response from AI')

    // Strip markdown code fences if model adds them
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    const insights = JSON.parse(cleaned)

    return { success: true, data: insights }

  } catch (error) {
    console.error('AI error:', error)
    return { success: false, error: error.message || 'Unknown error' }
  }
}