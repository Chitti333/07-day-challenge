import { useState } from 'react'
import { saveBook, updateBook, deleteBook } from '../../services/firebaseService'

const STATUS_COLORS = {
    'yet to start': { bg: '#F1EFE8', text: '#5F5E5A', bar: '#B4B2A9' },
    'ongoing': { bg: '#EEEDFE', text: '#3C3489', bar: '#7F77DD' },
    'completed': { bg: '#E1F5EE', text: '#085041', bar: '#1D9E75' },
    'on hold': { bg: '#FAEEDA', text: '#854F0B', bar: '#EF9F27' },
}

function pagesPerDay(book) {
    if (!book.totalPages || !book.goalDays || !book.startDate) return null
    const pagesLeft = book.totalPages - (book.currentPage || 0)
    const start = new Date(book.startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + Number(book.goalDays))
    const today = new Date()
    const daysLeft = Math.max(1, Math.ceil((end - today) / (1000 * 60 * 60 * 24)))
    return Math.ceil(pagesLeft / daysLeft)
}

const Field = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
    <div>
        <label className="text-xs text-gray-500 font-medium mb-1 block">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-200 rounded-xl px-3 py-2
               text-sm text-gray-700 outline-none focus:border-indigo-300"
        />
    </div>
)

function AddBookModal({ uid, onSave, onClose }) {
    const [form, setForm] = useState({
        title: '', author: '', totalPages: '',
        goalDays: '', startDate: new Date().toISOString().split('T')[0],
        currentPage: '0', status: 'yet to start'
    })
    const [saving, setSaving] = useState(false)

    const handle = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async () => {
        if (!form.title || !form.totalPages) return
        setSaving(true)
        const result = await saveBook(uid, {
            ...form,
            totalPages: Number(form.totalPages),
            goalDays: Number(form.goalDays),
            currentPage: Number(form.currentPage),
        })
        if (result.success) {
            onSave({
                id: result.id, ...form,
                totalPages: Number(form.totalPages),
                goalDays: Number(form.goalDays),
                currentPage: Number(form.currentPage),
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
                    <h3 className="font-bold text-gray-800 text-lg">📚 Add a book</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="flex flex-col gap-3">
                    <Field label="Book title *" value={form.title} onChange={v => handle('title', v)} placeholder="e.g. Atomic Habits" />
                    <Field label="Author" value={form.author} onChange={v => handle('author', v)} placeholder="e.g. James Clear" />

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Total pages *" value={form.totalPages} onChange={v => handle('totalPages', v)} type="number" placeholder="320" />
                        <Field label="Current page" value={form.currentPage} onChange={v => handle('currentPage', v)} type="number" placeholder="0" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Goal (days)" value={form.goalDays} onChange={v => handle('goalDays', v)} type="number" placeholder="30" />
                        <Field label="Start date" value={form.startDate} onChange={v => handle('startDate', v)} type="date" />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 font-medium mb-1 block">Status</label>
                        <select
                            value={form.status}
                            onChange={e => handle('status', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2
                         text-sm text-gray-700 outline-none"
                        >
                            {Object.keys(STATUS_COLORS).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={submit}
                    disabled={saving || !form.title || !form.totalPages}
                    className="w-full mt-5 bg-gray-900 text-white py-3 rounded-2xl
                     text-sm font-semibold disabled:bg-gray-200 disabled:text-gray-400
                     hover:bg-gray-700 transition-colors"
                >
                    {saving ? 'Saving...' : 'Add book'}
                </button>
            </div>
        </div>
    )
}

function BookCard({ book, uid, onUpdate, onDelete }) {
    const [editing, setEditing] = useState(false)
    const [pageInput, setPageInput] = useState(book.currentPage || 0)
    const pct = Math.min(100, Math.round(((book.currentPage || 0) / book.totalPages) * 100))
    const ppd = pagesPerDay(book)
    const c = STATUS_COLORS[book.status] || STATUS_COLORS['yet to start']

    const savePage = async () => {
        const updated = {
            ...book,
            currentPage: Number(pageInput),
            status: Number(pageInput) >= book.totalPages ? 'completed' : 'ongoing'
        }
        await updateBook(uid, book.id, {
            currentPage: updated.currentPage,
            status: updated.status
        })
        onUpdate(updated)
        setEditing(false)
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
                <div className="w-12 h-16 rounded-xl flex items-center justify-center
                        text-2xl flex-shrink-0"
                    style={{ background: c.bg }}>
                    📖
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <div className="font-bold text-gray-800 text-sm truncate">{book.title}</div>
                            <div className="text-xs text-gray-400">{book.author}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: c.bg, color: c.text }}>
                                {book.status}
                            </span>
                            <button onClick={() => onDelete(book.id)}
                                className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: c.bar }} />
                    </div>

                    <div className="flex justify-between mt-1.5">
                        <span className="text-xs text-gray-400">
                            {book.currentPage || 0} / {book.totalPages} pages · {pct}%
                        </span>
                        {ppd && book.status !== 'completed' && (
                            <span className="text-xs font-semibold" style={{ color: c.text }}>
                                {ppd} pages/day to finish on time
                            </span>
                        )}
                    </div>

                    {/* Manual page update */}
                    {editing ? (
                        <div className="flex gap-2 mt-2">
                            <input
                                type="number"
                                value={pageInput}
                                onChange={e => setPageInput(e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-24 outline-none"
                                placeholder="Current page"
                            />
                            <button onClick={savePage}
                                className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg">
                                Save
                            </button>
                            <button onClick={() => setEditing(false)}
                                className="text-xs text-gray-400 px-2 py-1">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        book.status !== 'completed' && (
                            <button onClick={() => setEditing(true)}
                                className="mt-2 text-xs text-indigo-400 hover:text-indigo-600">
                                + Update page
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}

export default function BookTracker({ uid, books, setBooks }) {
    const [showModal, setShowModal] = useState(false)

    const stats = {
        ongoing: books.filter(b => b.status === 'ongoing').length,
        completed: books.filter(b => b.status === 'completed').length,
        yetToStart: books.filter(b => b.status === 'yet to start').length,
        totalPages: books.reduce((a, b) => a + (b.currentPage || 0), 0),
    }

    const handleDelete = async (bookId) => {
        await deleteBook(uid, bookId)
        setBooks(prev => prev.filter(b => b.id !== bookId))
    }

    const handleUpdate = (updated) => {
        setBooks(prev => prev.map(b => b.id === updated.id ? updated : b))
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="font-bold text-gray-800 text-lg">📚 Book Tracker</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Journal auto-updates your reading progress
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gray-900 text-white text-xs px-4 py-2
                     rounded-full hover:bg-gray-700 transition-colors font-medium"
                >
                    + Add Book
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                    { val: stats.ongoing, label: 'ongoing', color: '#534AB7' },
                    { val: stats.completed, label: 'completed', color: '#0F6E56' },
                    { val: stats.yetToStart, label: 'yet to start', color: '#854F0B' },
                    { val: stats.totalPages, label: 'pages read', color: '#D4537E' },
                ].map(s => (
                    <div key={s.label}
                        className="rounded-2xl p-3 text-center"
                        style={{ background: '#f9f9f9' }}>
                        <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Book list */}
            <div className="flex flex-col gap-3">
                {books.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        <div className="text-3xl mb-2">📚</div>
                        No books yet — add your first one!
                    </div>
                ) : (
                    books.map(book => (
                        <BookCard
                            key={book.id}
                            book={book}
                            uid={uid}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            {showModal && (
                <AddBookModal
                    uid={uid}
                    onSave={(book) => setBooks(prev => [book, ...prev])}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}