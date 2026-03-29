import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { saveEntry } from '../services/firebaseService'
import JournalInput from '../components/JournalInput'
import InsightsDashboard from '../components/InsightsDashboard'

export default function Home() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [insights, setInsights] = useState(null)
    const [saving, setSaving] = useState(false)

    // If user clicked a pin from profile, show that entry
    useEffect(() => {
        if (location.state?.entry) {
            setInsights(location.state.entry.insights)
        }
    }, [location.state])

    const handleInsightsReady = async (data, text) => {
        setInsights(data)
        if (user) {
            setSaving(true)
            await saveEntry(user.uid, text, data)
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
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
                    {user?.photoURL && (
                        <img
                            src={user.photoURL}
                            alt="avatar"
                            onClick={() => navigate('/profile')}
                            className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ outline: '2px solid #ED93B1' }}
                        />
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center px-4 py-10">
                {!insights ? (
                    <>
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-gray-800">How was your day?</h2>
                            <p className="text-gray-400 mt-1 text-sm">
                                Write or speak freely — AI will extract your insights
                            </p>
                        </div>
                        <JournalInput onInsightsReady={handleInsightsReady} />
                    </>
                ) : (
                    <InsightsDashboard
                        insights={insights}
                        onReset={() => { setInsights(null) }}
                    />
                )}
            </div>
        </div>
    )
}