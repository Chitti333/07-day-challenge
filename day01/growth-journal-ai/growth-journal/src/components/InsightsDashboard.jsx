import InsightCard, { Pill } from './InsightCard'

export default function InsightsDashboard({ insights, onReset }) {
    const {
        happy, sad, gratitude, learnings,
        motivation, keyTakeaway, tasksForTomorrow, habitsDetected
    } = insights

    return (
        <div className="w-full max-w-2xl">

            {/* Header row */}
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">Today's Insights</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long', month: 'long', day: 'numeric'
                        })}
                    </p>
                </div>
                <button
                    onClick={onReset}
                    className="text-xs text-indigo-500 hover:text-indigo-700 
                     border border-indigo-200 px-3 py-1.5 rounded-lg 
                     hover:bg-indigo-50 transition-colors"
                >
                    + New Entry
                </button>
            </div>

            {/* Row 1: Happy + Sad side by side */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <InsightCard icon="😊" label="Happy moments" color="green">
                    <div>
                        {happy?.length > 0
                            ? happy.map((item, i) => <Pill key={i} text={item} color="green" />)
                            : <p className="text-xs text-gray-400">Nothing noted</p>}
                    </div>
                </InsightCard>

                <InsightCard icon="😔" label="Stressors" color="red">
                    <div>
                        {sad?.length > 0
                            ? sad.map((item, i) => <Pill key={i} text={item} color="red" />)
                            : <p className="text-xs text-gray-400">Nothing noted</p>}
                    </div>
                </InsightCard>
            </div>

            {/* Row 2: Gratitude full width */}
            <div className="mb-3">
                <InsightCard icon="🙏" label="Gratitude" color="amber">
                    <div>
                        {gratitude?.length > 0
                            ? gratitude.map((item, i) => <Pill key={i} text={item} color="amber" />)
                            : <p className="text-xs text-gray-400">Nothing noted</p>}
                    </div>
                </InsightCard>
            </div>

            {/* Row 3: Learnings + Habits side by side */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <InsightCard icon="📚" label="Learnings" color="blue">
                    <div className="flex flex-col gap-1.5">
                        {learnings?.length > 0
                            ? learnings.map((item, i) => (
                                <p key={i} className="text-xs text-gray-600 leading-relaxed">
                                    · {item}
                                </p>
                            ))
                            : <p className="text-xs text-gray-400">Nothing noted</p>}
                    </div>
                </InsightCard>

                <InsightCard icon="🔁" label="Habits detected" color="purple">
                    <div>
                        {habitsDetected?.length > 0
                            ? habitsDetected.map((item, i) => <Pill key={i} text={item} color="purple" />)
                            : <p className="text-xs text-gray-400">None detected</p>}
                    </div>
                </InsightCard>
            </div>

            {/* Key Takeaway highlight */}
            {keyTakeaway && (
                <div
                    className="rounded-2xl p-4 mb-3 border"
                    style={{ background: '#EEEDFE', borderColor: '#AFA9EC' }}
                >
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{ color: '#534AB7' }}>
                        Key takeaway
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: '#26215C' }}>
                        {keyTakeaway}
                    </p>
                </div>
            )}

            {/* Tasks for tomorrow */}
            <div className="mb-3">
                <InsightCard icon="✅" label="Tasks for tomorrow" color="teal">
                    <div className="flex flex-col gap-2">
                        {tasksForTomorrow?.length > 0
                            ? tasksForTomorrow.map((task, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <div
                                        className="w-4 h-4 rounded flex-shrink-0 mt-0.5 border-2"
                                        style={{ borderColor: '#5DCAA5' }}
                                    />
                                    <span className="text-xs text-gray-700 leading-relaxed">{task}</span>
                                </div>
                            ))
                            : <p className="text-xs text-gray-400">No tasks generated</p>}
                    </div>
                </InsightCard>
            </div>

            {/* Motivation highlight */}
            {motivation && (
                <div
                    className="rounded-2xl p-4 border"
                    style={{ background: '#E1F5EE', borderColor: '#5DCAA5' }}
                >
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{ color: '#0F6E56' }}>
                        Motivation
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: '#04342C' }}>
                        {motivation}
                    </p>
                </div>
            )}

        </div>
    )
}