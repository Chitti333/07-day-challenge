import { useEffect } from 'react'

export default function Toast({ messages, onClose }) {
    useEffect(() => {
        if (messages.length === 0) return
        const timer = setTimeout(onClose, 5000)
        return () => clearTimeout(timer)
    }, [messages])

    if (messages.length === 0) return null

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
            {messages.map((msg, i) => (
                <div
                    key={i}
                    className="flex items-start gap-3 bg-white border border-gray-200
                     rounded-2xl px-4 py-3 shadow-lg animate-bounce-in"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                >
                    <span style={{ fontSize: 16 }}>{msg.icon}</span>
                    <div>
                        <div className="text-xs font-semibold text-gray-800">{msg.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{msg.body}</div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-auto text-gray-300 hover:text-gray-500 text-xs"
                    >✕</button>
                </div>
            ))}
        </div>
    )
}