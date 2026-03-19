import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import API_BASE_URL from './config/api'

const EventPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [event, setEvent] = useState(null)
  const [eventError, setEventError] = useState('')
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [profile, setProfile] = useState(null)
  const [authUser, setAuthUser] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [joinForm, setJoinForm] = useState({ linkedin_url: '', company: '', designation: '' })

  useEffect(() => {
    fetch(`${API_BASE_URL}/events/slug/${slug}`)
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(data => setEvent(data))
      .catch(() => setEventError('Event not found or no longer available.'))
  }, [slug])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setAuthUser(user))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (authUser === undefined || !event) return
    if (authUser === null) { setLoading(false); return }

    const loadUserData = async () => {
      try {
        const idToken = await authUser.getIdToken()
        const [tagsRes, profileRes] = await Promise.all([
          fetch(`${API_BASE_URL}/tags/events/${event.id}`, { headers: { Authorization: `Bearer ${idToken}` } }),
          fetch(`${API_BASE_URL}/users/profile`,            { headers: { Authorization: `Bearer ${idToken}` } })
        ])
        const [tagsData, profileData] = await Promise.all([tagsRes.json(), profileRes.json()])
        if (Array.isArray(tagsData)) setTags(tagsData)
        setProfile(profileData)
        setJoinForm({ linkedin_url: profileData.linkedin_url || '', company: profileData.company || '', designation: profileData.designation || '' })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadUserData()
  }, [authUser, event])

  useEffect(() => { if (eventError) setLoading(false) }, [eventError])

  const handleSignIn = () => {
    sessionStorage.setItem('returnUrl', location.pathname)
    navigate('/auth')
  }

  const toggleTag = id =>
    setSelectedTags(prev => prev.includes(id) ? [] : [id])

  const handleJoin = async () => {
    setJoining(true)
    setJoinError('')
    try {
      const idToken = await authUser.getIdToken()
      const res = await fetch(`${API_BASE_URL}/participants/join/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ join_method: 'QR', selected_tags: selectedTags, ...joinForm })
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) { navigate(`/event/${event.id}/directory`); return }
        throw new Error(data.error || 'Failed to join event')
      }
      setJoined(true)
      setTimeout(() => navigate(`/event/${event.id}/directory`), 1500)
    } catch (err) {
      setJoinError(err.message)
    } finally {
      setJoining(false)
    }
  }

  if (loading || authUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (eventError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center gap-4">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-700">{eventError}</p>
        <button onClick={() => navigate('/')} className="text-sm font-semibold text-blue-600">â† Back to Home</button>
      </div>
    )
  }

  if (joined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-900">You're in!</p>
        <p className="text-sm text-gray-400">Opening directoryâ€¦</p>
      </div>
    )
  }

  const eventDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">EventSuite</span>
          </div>
          {authUser
            ? <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold text-gray-400 active:opacity-60">Dashboard</button>
            : <button onClick={handleSignIn} className="text-sm font-semibold text-blue-600 active:opacity-60">Sign In</button>
          }
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 pb-10 space-y-4">

        {/* Event card */}
        <div className="bg-gray-900 rounded-2xl p-5 text-white">
          <p className="text-xs font-semibold text-blue-400 mb-2">Event</p>
          <h1 className="text-xl font-bold leading-snug mb-3">{event.name}</h1>
          {event.description && (
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{event.description}</p>
          )}
          <div className="flex flex-col gap-1.5">
            {eventDate && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-300">{eventDate}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-300">{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Not logged in */}
        {!authUser ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base mb-1">Sign in to join</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Create an account or sign in to join this event and connect with attendees.
              </p>
            </div>
            <button
              onClick={handleSignIn}
              className="w-full bg-blue-600 text-white font-semibold text-sm py-4 rounded-2xl active:bg-blue-700"
            >
              Sign In / Sign Up ’
            </button>
          </div>
        ) : (
          <>
            {/* Tag picker */}
            {tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold text-gray-900 mb-1">Pick your tag</p>
                <p className="text-xs text-gray-400 mb-4">Select what describes you best at this event. Others will see this.</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                        selectedTags.includes(tag.id)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {selectedTags.includes(tag.id) && '✓'}{tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Profile info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">Your info</p>
                {profile && <span className="text-xs text-gray-400">{profile.name}</span>}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={joinForm.designation}
                    onChange={e => setJoinForm(f => ({ ...f, designation: e.target.value }))}
                    placeholder="e.g. Founder, Engineer, Investor"
                    className="w-full text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 placeholder-gray-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Company</label>
                  <input
                    type="text"
                    value={joinForm.company}
                    onChange={e => setJoinForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="e.g. Acme Corp"
                    className="w-full text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 placeholder-gray-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">LinkedIn <span className="text-gray-300">(optional)</span></label>
                  <input
                    type="url"
                    value={joinForm.linkedin_url}
                    onChange={e => setJoinForm(f => ({ ...f, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourname"
                    className="w-full text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 placeholder-gray-300"
                  />
                </div>
              </div>
            </div>

            {joinError && (
              <p className="text-sm text-red-500 font-medium text-center px-2">{joinError}</p>
            )}

            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full bg-blue-600 disabled:opacity-60 text-white font-semibold text-base py-4 rounded-2xl flex items-center justify-center gap-2 active:bg-blue-700"
            >
              {joining
                ? <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : null}
              {joining ? 'Joiningâ€¦' : 'Join Event â†’'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default EventPage

