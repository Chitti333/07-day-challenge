import { useState } from 'react'
import { saveHobby, updateHobby, deleteHobby } from '../../services/firebaseService'

const PRESET_HOBBIES = [
    { name: 'Cricket', icon: '🏏', color: '#EEEDFE', text: '#3C3489' },
    { name: 'Gym', icon: '💪', color: '#E1F5EE', text: '#085041' },
    { name: 'Swimming', icon: '🏊', color: '#E6F1FB', text: '#0C447C' },
    { name: 'Writing', icon: '✍️', color: '#FBEAF0', text: '#72243E' },
    { name: 'Meditation', icon: '🧘', color: '#FAEEDA', text: '#854F0B' },
    { name: 'Running', icon: '🏃', color: '#FAECE7', text: '#993C1D' },
    { name: 'Cooking', icon: '🍳', color: '#EAF3DE', text: '#27500A' },
    { name: 'Music', icon: '🎵', color: '#EEEDFE', text: '#534AB7' },
    { name: 'Yoga', icon: '🧘', color: '#E1F5EE', text: '#0F6E56' },
    { name: 'Reading', icon: '📖', color: '#FAEEDA', text: '#633806' },
]

const COLORS = [
    { bg: '#EEEDFE', text: '#3C3489' },
    { bg: '#E1F5EE', text: '#085041' },
    { bg: '#FBEAF0', text: '#72243E' },
    { bg: '#FAEEDA', text: '#854F0B' },
    { bg: '#E6F1FB', text: '#0C447C' },
    { bg: '#EAF3DE', text: '#27500A' },
]

// Get this week's dates Mon-Sun
function getWeekDays() {
    const today = new Date()
    const day = today.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const mon = new Date(today)
    mon.setDate(today.getDate() + diff)
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(mon)
        d.setDate(mon.getDate() + i)
        return d.toISOString().split('T')[0]
    })
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function HobbyCard({ hobby, uid, colorIdx, onUpdate, onDelete }) {
    const weekDays = getWeekDays()
    const logs = hobby.logs || []
    const c = COLORS[colorIdx % COLORS.length]

    // Count this week's sessions
    const weekCount = weekDays.filter(d => logs.includes(d)).length
    const goal = hobby.weeklyGoal || 3
    const streak = (() => {
        let s = 0
        const today = new Date().toISOString().split('T')[0]
        const sorted = [...logs].sort().reverse()
        for (const log of sorted) {
            if (log <= today) s++
            else break
        }
        return s
    })()

    const toggleDay = async (date) => {
        const newLogs = logs.includes(date)
            ? logs.filter(d => d !== date)
            : [...logs, date]
        await updateHobby(uid, hobby.id, { logs: newLogs })
        onUpdate({ ...hobby, logs: newLogs })
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: c.bg }}>
                        {hobby.icon || '⭐'}
                    </div>
                    <div>
                        <div className="font-bold text-gray-800 text-sm">{hobby.name}</div>
                        <div className="text-xs text-gray-400">Goal: {goal}x/week · {streak} day streak</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: c.bg, color: c.text }}>
                        {weekCount}/{goal} this week
                    </span>
                    <button onClick={() => onDelete(hobby.id)}
                        className="text-gray-200 hover:text-red-400 text-xs">✕</button>
                </div>
            </div>

            {/* Weekly grid */}
            <div className="flex gap-1.5">
                {weekDays.map((date, i) => {
                    const done = logs.includes(date)
                    const isToday = date === new Date().toISOString().split('T')[0]
                    return (
                        <button
                            key={date}
                            onClick={() => toggleDay(date)}
                            className="flex-1 flex flex-col items-center gap-1"
                        >
                            <div className={`w-full aspect-square rounded-lg transition-all
                ${done ? '' : 'bg-gray-100 hover:bg-gray-200'}
                ${isToday && !done ? 'ring-2 ring-offset-1' : ''}`}
                                style={done ? { background: c.bg, outline: `2px solid ${c.text}20` } : {}}
                            >
                                {done && (
                                    <div className="w-full h-full flex items-center justify-center text-base">
                                        {hobby.icon || '⭐'}
                                    </div>
                                )}
                            </div>
                            <span className={`text-xs ${isToday ? 'font-bold text-gray-600' : 'text-gray-300'}`}>
                                {DAYS[i]}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full transition-all"
                    style={{
                        width: `${Math.min(100, (weekCount / goal) * 100)}%`,
                        background: c.text
                    }} />
            </div>
        </div>
    )
}

function AddHobbyModal({ uid, onSave, onClose }) {
    const [tab, setTab] = useState('preset') // 'preset' | 'custom'
    const [customName, setCustomName] = useState('')
    const [customIcon, setCustomIcon] = useState('⭐')
    const [weeklyGoal, setWeeklyGoal] = useState(3)
    const [saving, setSaving] = useState(false)

    const addPreset = async (preset) => {
        setSaving(true)
        const result = await saveHobby(uid, {
            name: preset.name, icon: preset.icon,
            weeklyGoal: Number(weeklyGoal), logs: []
        })
        if (result.success) {
            onSave({
                id: result.id, name: preset.name,
                icon: preset.icon, weeklyGoal: Number(weeklyGoal), logs: []
            })
            onClose()
        }
        setSaving(false)
    }

    const addCustom = async () => {
        if (!customName) return
        setSaving(true)
        const result = await saveHobby(uid, {
            name: customName, icon: customIcon,
            weeklyGoal: Number(weeklyGoal), logs: []
        })
        if (result.success) {
            onSave({
                id: result.id, name: customName,
                icon: customIcon, weeklyGoal: Number(weeklyGoal), logs: []
            })
            onClose()
        }
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center
                    justify-center z-50 px-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-gray-800 text-lg">✨ Add a hobby</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 bg-gray-100 rounded-xl p-1">
                    {['preset', 'custom'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${tab === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                        >
                            {t === 'preset' ? '🎯 Choose preset' : '✏️ Custom hobby'}
                        </button>
                    ))}
                </div>

                {/* Weekly goal (shared) */}
                <div className="mb-4">
                    <label className="text-xs text-gray-500 font-medium mb-1 block">
                        Weekly goal (days/week)
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7].map(n => (
                            <button
                                key={n}
                                onClick={() => setWeeklyGoal(n)}
                                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors
                  ${weeklyGoal === n
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>

                {tab === 'preset' ? (
                    <div className="grid grid-cols-2 gap-2">
                        {PRESET_HOBBIES.map(p => (
                            <button
                                key={p.name}
                                onClick={() => addPreset(p)}
                                disabled={saving}
                                className="flex items-center gap-2 p-3 rounded-2xl border
                           border-gray-100 hover:border-gray-300 transition-colors text-left"
                            >
                                <span style={{ fontSize: 20 }}>{p.icon}</span>
                                <span className="text-sm font-medium text-gray-700">{p.name}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <div className="w-14">
                                <label className="text-xs text-gray-500 font-medium mb-1 block">Icon</label>
                                <input
                                    type="text"
                                    value={customIcon}
                                    onChange={e => setCustomIcon(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-2 py-2
                             text-center text-lg outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 font-medium mb-1 block">Hobby name</label>
                                <input
                                    type="text"
                                    value={customName}
                                    onChange={e => setCustomName(e.target.value)}
                                    placeholder="e.g. Sketching"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2
                             text-sm text-gray-700 outline-none"
                                />
                            </div>
                        </div>
                        <button
                            onClick={addCustom}
                            disabled={saving || !customName}
                            className="w-full bg-gray-900 text-white py-3 rounded-2xl
                         text-sm font-semibold disabled:bg-gray-200
                         disabled:text-gray-400 hover:bg-gray-700 transition-colors"
                        >
                            {saving ? 'Saving...' : 'Add hobby'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function HobbyTracker({ uid, hobbies, setHobbies }) {
    const [showModal, setShowModal] = useState(false)

    const handleDelete = async (id) => {
        await deleteHobby(uid, id)
        setHobbies(prev => prev.filter(h => h.id !== id))
    }

    const handleUpdate = (updated) => {
        setHobbies(prev => prev.map(h => h.id === updated.id ? updated : h))
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="font-bold text-gray-800 text-lg">🎯 Hobbies Tracker</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Journal auto-marks your activities
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gray-900 text-white text-xs px-4 py-2
                     rounded-full hover:bg-gray-700 transition-colors font-medium"
                >
                    + Add Hobby
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {hobbies.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        <div className="text-3xl mb-2">🎯</div>
                        No hobbies yet — add your first one!
                    </div>
                ) : (
                    hobbies.map((hobby, i) => (
                        <HobbyCard
                            key={hobby.id}
                            hobby={hobby}
                            uid={uid}
                            colorIdx={i}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            {showModal && (
                <AddHobbyModal
                    uid={uid}
                    onSave={(h) => setHobbies(prev => [h, ...prev])}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}