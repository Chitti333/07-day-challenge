import { useState } from 'react'
import { analyzeJournal } from '../services/aiService'
import { useVoiceInput } from '../hooks/useVoiceInput'

// Add books and hobbies to props:
export default function JournalInput({ onInsightsReady, books = [], hobbies = [] }) {

    // Update the analyzeJournal call to pass them:

    const [entry, setEntry] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Voice hook — updates textarea as you speak
    const { isListening, toggleListening, error: voiceError } = useVoiceInput(
        (transcript) => setEntry(transcript)
    )

    const handleSubmit = async () => {
        if (!entry.trim()) return
        setIsLoading(true)
        setError('')

        // const result = await analyzeJournal(entry)
        const result = await analyzeJournal(entry, books, hobbies)

        if (result.success) {
            onInsightsReady(result.data, entry)
        } else {
            setError(result.error)
        }

        setIsLoading(false)
    }

    return (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

            {/* Date */}
            <p className="text-xs text-gray-400 mb-3">
                {new Date().toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric',
                    month: 'long', day: 'numeric'
                })}
            </p>

            {/* Textarea */}
            <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder={
                    isListening
                        ? '🎤 Listening... speak your thoughts'
                        : 'How was your day? What made you happy, stressed, or grateful? Write freely...'
                }
                className={`w-full h-52 resize-none text-gray-700 text-sm leading-relaxed 
                    border-none outline-none placeholder-gray-300 transition-colors
                    ${isListening ? 'bg-red-50' : 'bg-white'}`}
            />

            {/* Voice error */}
            {voiceError && (
                <p className="text-red-400 text-xs mt-1">{voiceError}</p>
            )}

            {/* AI error */}
            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">

                <div className="flex items-center gap-3">
                    {/* Mic button */}
                    <button
                        onClick={toggleListening}
                        title={isListening ? 'Stop listening' : 'Start voice input'}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center 
                        transition-all duration-200
                        ${isListening
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        {isListening ? (
                            // Stop icon
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                        ) : (
                            // Mic icon
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
                                <path d="M19 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.08A7 7 0 0 0 19 10z" />
                            </svg>
                        )}
                    </button>

                    {/* Listening status */}
                    {isListening && (
                        <span className="text-xs text-red-500 font-medium">
                            Recording... tap to stop
                        </span>
                    )}

                    {/* Character count */}
                    {!isListening && (
                        <span className="text-xs text-gray-300">{entry.length} characters</span>
                    )}
                </div>

                {/* Analyze button */}
                <button
                    onClick={handleSubmit}
                    disabled={!entry.trim() || isLoading || isListening}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 
                     disabled:text-gray-400 text-white text-sm font-medium 
                     px-5 py-2 rounded-xl transition-colors"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                    stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Analyzing...
                        </span>
                    ) : 'Analyze Entry ✨'}
                </button>

            </div>
        </div>
    )
}