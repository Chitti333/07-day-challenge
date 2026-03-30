import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loadBooks, loadHobbies } from '../services/firebaseService'
import BookTracker from '../components/trackers/BookTracker'
import HobbyTracker from '../components/trackers/HobbyTracker'

export default function Trackers() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [tab, setTab] = useState('books')
    const [books, setBooks] = useState([])
    const [hobbies, setHobbies] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        Promise.all([
            loadBooks(user.uid),
            loadHobbies(user.uid)
        ]).then(([b, h]) => {
            setBooks(b)
            setHobbies(h)
            setLoading(false)
        })
    }, [user])

    return (
        <div className="min-h-screen" style={{ background: '#fdf8f6' }}>

            {/* Navbar */}
            <div className="bg-white border-b border-gray-100 px-6 py-3
                      flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/profile')}
                        className="text-gray-400 hover:text-gray-600 text-sm">
                        ← Back
                    </button>
                    <span className="font-bold text-gray-800">🌱 Trackers</span>
                </div>
                <button
                    onClick={() => navigate('/journal')}
                    className="bg-gray-900 text-white text-xs px-4 py-2
                     rounded-full hover:bg-gray-700 transition-colors"
                >
                    + New Journal Entry
                </button>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Tab switcher */}
                <div className="flex gap-2 bg-white border border-gray-100
                        rounded-2xl p-1.5 mb-6">
                    {[
                        { id: 'books', label: '📚 Books' },
                        { id: 'hobbies', label: '🎯 Hobbies' },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors
                ${tab === t.id
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400 text-sm animate-pulse">
                        Loading trackers...
                    </div>
                ) : (
                    <>
                        {tab === 'books' && <BookTracker uid={user.uid} books={books} setBooks={setBooks} />}
                        {tab === 'hobbies' && <HobbyTracker uid={user.uid} hobbies={hobbies} setHobbies={setHobbies} />}
                    </>
                )}
            </div>
        </div>
    )
}