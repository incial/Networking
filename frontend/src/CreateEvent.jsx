import React, { useState } from 'react'
import { auth } from './config/firebase'
import { useNavigate } from 'react-router-dom'

const SUGGESTED_TAGS = ['Investor', 'Startup Founder', 'Developer', 'Designer', 'Product Manager', 'Marketing', 'Sales', 'Recruiter', 'Mentor', 'Student']

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    event_date: '',
  })
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const addTag = (tag) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setTagInput('')
  }

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag))

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const idToken = await auth.currentUser.getIdToken()
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ ...formData, tags })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to create event')
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[2.5rem] p-14 text-center shadow-xl border border-slate-100 max-w-md w-full">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[#1e293b] uppercase tracking-tighter mb-3">Event Submitted!</h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Your event is in the <span className="text-yellow-500">PENDING</span> queue.<br />
            QR code and link will be active once an admin approves it.
          </p>
          <p className="text-[10px] text-slate-300 mt-8 uppercase tracking-widest animate-pulse">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f4ff] font-sans">

      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">New Event</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">Event Creation</p>
          <h1 className="text-4xl font-black text-[#1e293b] uppercase tracking-tighter leading-none">Create Event</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Submitted events go to PENDING — active after admin approval</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Main Fields */}
          <div className="lg:col-span-2 space-y-5">

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>
              </div>
            )}

            {/* Event Name */}
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Event Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tech Summit 2026"
                className="w-full text-xl font-black text-[#1e293b] uppercase tracking-tight placeholder:text-slate-200 placeholder:font-black bg-transparent border-none outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Description</label>
              <textarea
                rows={4}
                placeholder="What is this event about? Who should attend?"
                className="w-full text-[12px] font-bold text-slate-700 placeholder:text-slate-300 bg-transparent border-none outline-none resize-none leading-relaxed"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Date + Location */}
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  <svg className="w-3 h-3 inline mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  className="w-full text-sm font-bold text-[#1e293b] bg-transparent border-none outline-none"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  <svg className="w-3 h-3 inline mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Venue or Virtual"
                  className="w-full text-sm font-bold text-[#1e293b] placeholder:text-slate-300 bg-transparent border-none outline-none uppercase"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Participant Tags</label>

              {/* Added tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 bg-[#1e293b] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-300 transition-colors">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag input */}
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100 focus-within:border-blue-400 transition-colors">
                <input
                  type="text"
                  placeholder="Type a tag and press Enter or comma..."
                  className="flex-1 text-[11px] font-bold text-slate-700 placeholder:text-slate-300 bg-transparent outline-none"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Suggestions */}
              <div className="mt-3">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Quick Add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="text-[8px] font-black text-slate-400 uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-all"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary + Submit */}
          <div className="space-y-5">

            {/* Preview Card */}
            <div className="bg-[#1e293b] rounded-[1.5rem] p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 60%)'}}></div>
              <div className="relative">
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Preview</p>
                <h3 className="text-lg font-black uppercase tracking-tighter leading-tight mb-3 text-white">
                  {formData.name || <span className="text-slate-500">Event Name</span>}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{formData.event_date || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{formData.location || '—'}</p>
                  </div>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/10">
                    {tags.map(tag => (
                      <span key={tag} className="text-[7px] font-black bg-white/10 text-blue-300 px-2 py-1 rounded uppercase tracking-widest">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="text-[8px] font-black bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded uppercase tracking-widest">PENDING APPROVAL</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5 space-y-2.5">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Checklist</p>
              {[
                { label: 'Event name', done: !!formData.name },
                { label: 'Date set', done: !!formData.event_date },
                { label: 'Location added', done: !!formData.location },
                { label: 'Description written', done: !!formData.description },
                { label: 'Tags added', done: tags.length > 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-green-100' : 'bg-slate-100'}`}>
                    {item.done && (
                      <svg className="w-2.5 h-2.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${item.done ? 'text-slate-600' : 'text-slate-300'}`}>{item.label}</p>
                </div>
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-[11px] uppercase tracking-widest py-5 rounded-2xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit for Approval
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            <p className="text-[8px] font-bold text-slate-300 uppercase text-center tracking-widest">
              Event will be PENDING until a Super Admin approves it
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEvent
