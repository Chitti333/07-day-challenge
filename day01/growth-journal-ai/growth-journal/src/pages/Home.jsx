import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    saveEntry, loadBooks, loadHobbies,
    updateBook, updateHobby
} from '../services/firebaseService'
import { analyzeJournal } from '../services/aiService'
import JournalInput from '../components/JournalInput'
import InsightsDashboard from '../components/InsightsDashboard'
import Toast from '../components/Toast'

export default function Home() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [insights, setInsights] = useState(null)
    const [saving, setSaving] = useState(false)
    const [toasts, setToasts] = useState([])
    const [books, setBooks] = useState([])
    const [hobbies, setHobbies] = useState([])

    useEffect(() => {
        if (location.state?.entry) setInsights(location.state.entry.insights)
    }, [location.state])

    useEffect(() => {
        if (!user) return
        loadBooks(user.uid).then(setBooks)
        loadHobbies(user.uid).then(setHobbies)
    }, [user])

    const handleInsightsReady = async (data, text) => {
        setInsights(data)
        setSaving(true)
        const newToasts = []

        // Save journal entry
        if (user) {
            const saveRes = await saveEntry(user.uid, text, data)
            if (!saveRes.success) {
                newToasts.push({
                    icon: '❌',
                    title: 'Failed to save',
                    body: saveRes.error
                })
                console.error("Save Entry Failed:", saveRes.error)
            } else {
                newToasts.push({
                    icon: '✅',
                    title: 'Saved to Diary',
                    body: 'Your entry was successfully saved.'
                })
            }
        }

        // Process book updates
        const bookUpdates = data.trackerUpdates?.books || []
        for (const update of bookUpdates) {
            const match = books.find(b =>
                b.title.toLowerCase().includes(update.title?.toLowerCase()) ||
                update.title?.toLowerCase().includes(b.title?.toLowerCase())
            )
            if (match && update.pagesRead) {
                const newPage = Math.min(
                    match.totalPages,
                    (match.currentPage || 0) + update.pagesRead
                )
                const newStatus = newPage >= match.totalPages ? 'completed' : 'ongoing'
                await updateBook(user.uid, match.id, {
                    currentPage: newPage, status: newStatus
                })
                newToasts.push({
                    icon: '📚',
                    title: `${match.title} updated!`,
                    body: `+${update.pagesRead} pages · now on page ${newPage}`
                })
            }
        }

        // Process hobby updates
        const hobbyUpdates = data.trackerUpdates?.hobbies || []
        const today = new Date().toISOString().split('T')[0]
        for (const name of hobbyUpdates) {
            const match = hobbies.find(h =>
                h.name.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(h.name.toLowerCase())
            )
            if (match && !match.logs?.includes(today)) {
                const newLogs = [...(match.logs || []), today]
                await updateHobby(user.uid, match.id, { logs: newLogs })
                newToasts.push({
                    icon: match.icon || '🎯',
                    title: `${match.name} logged!`,
                    body: `Marked as done for today ✓`
                })
            }
        }

        if (newToasts.length > 0) setToasts(newToasts)
        setSaving(false)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-100 px-6 py-3
                      flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate('/profile')}>
                    <span className="text-lg">🌱</span>
                    <span className="font-bold text-gray-800">Growth Journal</span>
                </div>
                <div className="flex items-center gap-3">
                    {saving && (
                        <span className="text-xs text-gray-400 animate-pulse">Saving...</span>
                    )}
                    <button onClick={() => navigate('/history')}
                        className="text-xs text-gray-500 hover:text-gray-800
                             border border-gray-200 px-3 py-1.5 rounded-full">
                        📖 Diary
                    </button>
                    <button onClick={() => navigate('/trackers')}
                        className="text-xs text-gray-500 hover:text-gray-800
                             border border-gray-200 px-3 py-1.5 rounded-full">
                        📊 Trackers
                    </button>
                    {user?.photoURL && (
                        <img src={user.photoURL} alt="avatar"
                            onClick={() => navigate('/profile')}
                            className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80"
                            style={{ outline: '2px solid #ED93B1' }} />
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center px-4 py-10">
                {!insights ? (
                    <>
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-gray-800">How was your day?</h2>
                            <p className="text-gray-400 mt-1 text-sm">
                                Write or speak freely — AI will extract your insights
                            </p>
                        </div>
                        <JournalInput
                            onInsightsReady={handleInsightsReady}
                            books={books}
                            hobbies={hobbies}
                        />
                    </>
                ) : (
                    <InsightsDashboard
                        insights={insights}
                        onReset={() => setInsights(null)}
                    />
                )}
            </div>

            <Toast messages={toasts} onClose={() => setToasts([])} />
        </div>
    )
}