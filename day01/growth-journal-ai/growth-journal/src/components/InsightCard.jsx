export default function InsightCard({ icon, label, color, children }) {
    const colorMap = {
        green: { bg: '#EAF3DE', text: '#27500A', border: '#97C459' },
        red: { bg: '#FCEBEB', text: '#A32D2D', border: '#F09595' },
        amber: { bg: '#FAEEDA', text: '#633806', border: '#FAC775' },
        blue: { bg: '#E6F1FB', text: '#0C447C', border: '#85B7EB' },
        purple: { bg: '#EEEDFE', text: '#3C3489', border: '#AFA9EC' },
        teal: { bg: '#E1F5EE', text: '#085041', border: '#5DCAA5' },
    }

    const c = colorMap[color] || colorMap.blue

    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: c.bg }}
                >
                    {icon}
                </div>
                <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: c.text }}
                >
                    {label}
                </span>
            </div>
            {children}
        </div>
    )
}

// Reusable pill tag
export function Pill({ text, color }) {
    const colorMap = {
        green: { bg: '#EAF3DE', text: '#27500A' },
        red: { bg: '#FCEBEB', text: '#A32D2D' },
        amber: { bg: '#FAEEDA', text: '#633806' },
        blue: { bg: '#E6F1FB', text: '#0C447C' },
        purple: { bg: '#EEEDFE', text: '#3C3489' },
        teal: { bg: '#E1F5EE', text: '#085041' },
    }
    const c = colorMap[color] || colorMap.blue

    return (
        <span
            className="inline-block px-2.5 py-1 rounded-md text-xs font-medium m-0.5"
            style={{ background: c.bg, color: c.text }}
        >
            {text}
        </span>
    )
}