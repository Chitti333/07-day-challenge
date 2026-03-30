import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loadEntries } from '../services/firebaseService'

const MOOD_COLORS = {
    happy: { bg: '#E1F5EE', text: '#085041', icon: '😊' },
    stressed: { bg: '#FAEEDA', text: '#854F0B', icon: '😫' },
    productive: { bg: '#EEEDFE', text: '#3C3489', icon: '⚡' },
    peaceful: { bg: '#F1EFE8', text: '#5F5E5A', icon: '😌' },
    sad: { bg: '#FDEEEB', text: '#9B2A2A', icon: '😢' },
    neutral: { bg: '#F3F4F6', text: '#374151', icon: '😐' }
}

export default function PastEntries() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [entriesMap, setEntriesMap] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchEntries = async () => {
            const data = await loadEntries(user.uid)
            
            // Group by day wise string
            const grouped = data.reduce((acc, entry) => {
                const dateObj = entry.createdAt || new Date()
                const dateStr = dateObj.toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
                })
                
                if (!acc[dateStr]) acc[dateStr] = []
                acc[dateStr].push(entry)
                return acc
            }, {})

            setEntriesMap(grouped)
            setLoading(false)
        }

        fetchEntries()
    }, [user])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-3
                      flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/journal')}
                        className="w-8 h-8 rounded-full flex items-center justify-center
                                 bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                        ←
                    </button>
                    <span className="font-bold text-gray-800">📖 Digital Diary</span>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 max-w-3xl w-full mx-auto">
                {loading ? (
                    <div className="text-center py-20 text-gray-400 animate-pulse">
                        Loading your memories...
                    </div>
                ) : Object.keys(entriesMap).length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="text-4xl mb-3">📝</div>
                        No journal entries yet. Go back to save your day!
                    </div>
                ) : (
                    <div className="space-y-10">
                        {Object.entries(entriesMap).map(([dateStr, entriesForDay]) => (
                            <div key={dateStr} className="relative">
                                {/* Date Header */}
                                <div className="sticky top-[60px] z-10 bg-gray-50/90 backdrop-blur-md py-2 mb-4">
                                    <h3 className="font-bold text-gray-700">{dateStr}</h3>
                                </div>
                                
                                <div className="space-y-6">
                                    {entriesForDay.map(entry => {
                                        const insights = entry.insights || {}
                                        const moodMatch = Object.keys(MOOD_COLORS).find(m => insights.mood?.toLowerCase().includes(m))
                                        const c = MOOD_COLORS[moodMatch] || MOOD_COLORS.neutral
                                        
                                        return (
                                            <div key={entry.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                                                            style={{ background: c.bg, color: c.text }}>
                                                            {c.icon} {insights.mood || 'Neutral'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {entry.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-5">
                                                    {entry.entryText}
                                                </p>

                                                {(insights.summary || (insights.keyTakeaways && insights.keyTakeaways.length > 0)) && (
                                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                                        {insights.summary && (
                                                            <div className="mb-3">
                                                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">AI Summary</h4>
                                                                <p className="text-sm text-gray-600 italic">"{insights.summary}"</p>
                                                            </div>
                                                        )}
                                                        {insights.keyTakeaways && insights.keyTakeaways.length > 0 && (
                                                            <div>
                                                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">Takeaways</h4>
                                                                <ul className="text-sm text-gray-600 list-disc list-inside space-y-0.5">
                                                                    {insights.keyTakeaways.map((task, i) => (
                                                                        <li key={i}>{task}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
