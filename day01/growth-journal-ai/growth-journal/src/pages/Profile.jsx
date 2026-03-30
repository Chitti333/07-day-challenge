import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout, loadEntries } from '../services/firebaseService'

const PIN_COLORS = [
    { bg: '#FBEAF0', accent: '#F4C0D1', text: '#4B1528', muted: '#72243E' },
    { bg: '#EEEDFE', accent: '#CECBF6', text: '#26215C', muted: '#534AB7' },
    { bg: '#E1F5EE', accent: '#9FE1CB', text: '#04342C', muted: '#085041' },
    { bg: '#FAEEDA', accent: '#FAC775', text: '#412402', muted: '#854F0B' },
    { bg: '#FAECE7', accent: '#F5C4B3', text: '#4A1B0C', muted: '#993C1D' },
    { bg: '#E6F1FB', accent: '#B5D4F4', text: '#042C53', muted: '#185FA5' },
]

function PinCard({ entry, index, onClick }) {
    const c = PIN_COLORS[index % PIN_COLORS.length]
    const date = entry.createdAt?.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
    })
    const quote = entry.insights?.keyTakeaway || entry.insights?.motivation || 'A day worth remembering'
    const happy = entry.insights?.happy?.length || 0
    const tasks = entry.insights?.tasksForTomorrow?.length || 0
    const habits = entry.insights?.habitsDetected?.length || 0

    return (
        <div
            onClick={onClick}
            className="rounded-2xl overflow-hidden border cursor-pointer
                 transition-transform hover:scale-105"
            style={{ background: c.bg, borderColor: c.accent, breakInside: 'avoid', marginBottom: '12px' }}
        >
            <div style={{ background: c.accent, height: '8px' }} />
            <div className="p-3">
                <div className="text-xs font-semibold mb-2" style={{ color: c.muted }}>{date}</div>
                <div className="text-xs font-bold leading-snug mb-3" style={{ color: c.text }}>
                    "{quote.slice(0, 80)}{quote.length > 80 ? '...' : ''}"
                </div>

                <div className="flex gap-1 flex-wrap">
                    {happy > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: c.accent, color: c.text }}>
                            😊 {happy}
                        </span>
                    )}
                    {tasks > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: c.accent, color: c.text }}>
                            ✅ {tasks}
                        </span>
                    )}
                    {habits > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: c.accent, color: c.text }}>
                            🔁 {habits}
                        </span>
                    )}
                </div>

                {entry.insights?.habitsDetected?.length > 0 && (
                    <div className="text-xs mt-2 leading-relaxed" style={{ color: c.muted }}>
                        {entry.insights.habitsDetected.slice(0, 2).join(' · ')}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function Profile() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            loadEntries(user.uid).then(e => {
                setEntries(e)
                setLoading(false)
            })
        }
    }, [user])

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    // Stats
    const totalTasks = entries.reduce((a, e) => a + (e.insights?.tasksForTomorrow?.length || 0), 0)
    const totalHabits = [...new Set(entries.flatMap(e => e.insights?.habitsDetected || []))].length

    const getStreak = () => {
        if (entries.length === 0) return 0
        let streak = 1
        const sorted = [...entries].sort((a, b) => b.createdAt - a.createdAt)
        for (let i = 1; i < sorted.length; i++) {
            const diff = (sorted[i - 1].createdAt - sorted[i].createdAt) / (1000 * 60 * 60 * 24)
            if (diff < 2) streak++
            else break
        }
        return streak
    }

    // Split entries into 3 columns for masonry
    const col1 = entries.filter((_, i) => i % 3 === 0)
    const col2 = entries.filter((_, i) => i % 3 === 1)
    const col3 = entries.filter((_, i) => i % 3 === 2)

    return (
        <div className="min-h-screen" style={{ background: '#fdf8f6' }}>

            {/* Navbar */}
            <div className="bg-white border-b border-gray-100 px-6 py-3
                      flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🌱</span>
                    <span className="font-bold text-gray-800">Growth Journal</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/trackers')}
                        className="text-xs border border-gray-200 text-gray-600 px-4 py-2
             rounded-full hover:bg-gray-50 transition-colors font-medium"
                    >
                        📊 Trackers
                    </button>
                    <button
                        onClick={() => navigate('/history')}
                        className="text-xs border border-gray-200 text-gray-600 px-4 py-2
             rounded-full hover:bg-gray-50 transition-colors font-medium"
                    >
                        📖 Diary
                    </button>
                    <button
                        onClick={() => navigate('/journal')}
                        className="bg-gray-900 text-white text-xs px-4 py-2 
                       rounded-full hover:bg-gray-700 transition-colors font-medium"
                    >
                        + New Entry
                    </button>
                    <button onClick={handleLogout}
                        className="text-xs text-gray-400 hover:text-gray-600">
                        Sign out
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Profile header */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8">
                    <div className="flex items-start gap-4 mb-5">

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="avatar"
                                    className="w-16 h-16 rounded-full border-2 border-white"
                                    style={{ outline: '2px solid #ED93B1' }} />
                            ) : (
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                                    style={{
                                        background: 'linear-gradient(135deg,#FBEAF0,#EEEDFE)',
                                        outline: '2px solid #ED93B1'
                                    }}>
                                    🌸
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gray-800">
                                {user?.displayName || 'Journal Writer'}
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                                    style={{ background: '#FBEAF0', color: '#72243E' }}>
                                    🌸 Growth seeker
                                </span>
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                                    style={{ background: '#E1F5EE', color: '#085041' }}>
                                    ✨ {getStreak()} day streak
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { val: entries.length, label: 'entries', color: '#D4537E' },
                            { val: getStreak(), label: 'day streak', color: '#534AB7' },
                            { val: totalTasks, label: 'tasks logged', color: '#0F6E56' },
                            { val: totalHabits, label: 'habits found', color: '#854F0B' },
                        ].map(s => (
                            <div key={s.label} className="rounded-2xl p-3 text-center"
                                style={{ background: '#f9f9f9' }}>
                                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Journal board heading */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-700">My journal board</h2>
                    <span className="text-xs text-gray-400">{entries.length} pins</span>
                </div>

                {/* Masonry grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400 text-sm animate-pulse">
                        Loading your board...
                    </div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-3">🌱</div>
                        <p className="text-gray-400 text-sm">Your board is empty.<br />Write your first entry!</p>
                        <button
                            onClick={() => navigate('/journal')}
                            className="mt-4 bg-gray-900 text-white text-xs px-5 py-2.5 
                         rounded-full hover:bg-gray-700 transition-colors">
                            Start journaling
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-3 items-start">
                        <div>{col1.map((e, i) => (
                            <PinCard key={e.id} entry={e} index={i * 3}
                                onClick={() => navigate('/journal', { state: { entry: e } })} />
                        ))}</div>
                        <div>{col2.map((e, i) => (
                            <PinCard key={e.id} entry={e} index={i * 3 + 1}
                                onClick={() => navigate('/journal', { state: { entry: e } })} />
                        ))}</div>
                        <div>{col3.map((e, i) => (
                            <PinCard key={e.id} entry={e} index={i * 3 + 2}
                                onClick={() => navigate('/journal', { state: { entry: e } })} />
                        ))}</div>
                    </div>
                )}
            </div>
        </div>
    )
}