import { loginWithGoogle } from '../services/firebaseService'

export default function Login() {
    const handleLogin = async () => {
        try {
            await loginWithGoogle()
        } catch (e) {
            console.error('Login failed:', e)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center"
            style={{ background: '#fdf8f6' }}>

            {/* Floating mood pills decoration */}
            <div className="flex gap-2 mb-8 flex-wrap justify-center px-4">
                {['😊 happy moments', '🙏 gratitude', '📚 learnings', '🔁 habits', '✅ tasks'].map(t => (
                    <span key={t}
                        className="text-xs px-3 py-1.5 rounded-full font-medium"
                        style={{ background: '#FBEAF0', color: '#72243E' }}>
                        {t}
                    </span>
                ))}
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-10
                      flex flex-col items-center text-center max-w-sm w-full mx-4"
                style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.06)' }}>

                <div className="text-5xl mb-4">🌱</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Growth Journal</h1>
                <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                    Your personal space to reflect, grow,<br />and track what truly matters.
                </p>

                {/* Sample pin cards mini preview */}
                <div className="flex gap-2 mb-8 w-full">
                    {[
                        { bg: '#FBEAF0', accent: '#F4C0D1', text: '#4B1528', quote: '"Today I learned to slow down"' },
                        { bg: '#EEEDFE', accent: '#CECBF6', text: '#26215C', quote: '"Grateful for small wins"' },
                    ].map((c, i) => (
                        <div key={i} className="flex-1 rounded-2xl overflow-hidden border border-gray-100"
                            style={{ background: c.bg }}>
                            <div style={{ background: c.accent, height: '6px' }} />
                            <div className="p-2.5">
                                <div className="text-xs font-semibold leading-tight" style={{ color: c.text }}>
                                    {c.quote}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Google Sign In */}
                <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-3 
                     bg-gray-900 hover:bg-gray-700 text-white 
                     py-3 rounded-2xl font-medium text-sm transition-colors"
                >
                    <svg width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z" />
                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.6 0-14.2 4.3-17.7 10.7z" />
                        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.6 4.8C9.8 39.6 16.4 44 24 44z" />
                        <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z" />
                    </svg>
                    Continue with Google
                </button>

                <p className="text-xs text-gray-300 mt-4">
                    Your journal is private and secure
                </p>
            </div>
        </div>
    )
}