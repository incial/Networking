import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { auth } from './config/firebase'

const EventDirectory = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [eventTags, setEventTags] = useState([])
  const [favorites, setFavorites] = useState(new Set())
  const [search, setSearch] = useState('')
  const [selectedTagFilter, setSelectedTagFilter] = useState([])
  const [loading, setLoading] = useState(true)
  const [togglingFav, setTogglingFav] = useState(null)

  const fetchDirectory = useCallback(async (searchTerm = '', tagFilters = []) => {
    try {
      const idToken = await auth.currentUser.getIdToken()
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (tagFilters.length > 0) params.set('tags', tagFilters.join(','))

      const res = await fetch(
        `https://networking-k0cv.onrender.com/api/participants/events/${eventId}/directory?${params}`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      )
      const data = await res.json()
      if (Array.isArray(data)) setParticipants(data)
    } catch (err) {
      console.error('Directory fetch error:', err)
    }
  }, [eventId])

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/auth')
      return
    }

    const init = async () => {
      try {
        const idToken = await auth.currentUser.getIdToken()
        const [eventRes, tagsRes, favsRes, dirRes] = await Promise.all([
          fetch(`https://networking-k0cv.onrender.com/api/events/${eventId}`, {
            headers: { Authorization: `Bearer ${idToken}` }
          }),
          fetch(`https://networking-k0cv.onrender.com/api/tags/events/${eventId}`, {
            headers: { Authorization: `Bearer ${idToken}` }
          }),
          fetch(`https://networking-k0cv.onrender.com/api/favorites/events/${eventId}`, {
            headers: { Authorization: `Bearer ${idToken}` }
          }),
          fetch(`https://networking-k0cv.onrender.com/api/participants/events/${eventId}/directory`, {
            headers: { Authorization: `Bearer ${idToken}` }
          })
        ])

        const [eventData, tagsData, favsData, dirData] = await Promise.all([
          eventRes.json(), tagsRes.json(), favsRes.json(), dirRes.json()
        ])

        if (eventData && !eventData.error) setEvent(eventData)
        if (Array.isArray(tagsData)) setEventTags(tagsData)
        if (Array.isArray(favsData)) {
          // favorites response may be array of objects with participant_id or id
          setFavorites(new Set(favsData.map(f => f.participant_id ?? f.id)))
        }
        if (Array.isArray(dirData)) setParticipants(dirData)
      } catch (err) {
        console.error('Init error:', err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [eventId, navigate])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchDirectory(search, selectedTagFilter)
  }

  const toggleTagFilter = (tagName) => {
    const updated = selectedTagFilter.includes(tagName)
      ? selectedTagFilter.filter(t => t !== tagName)
      : [...selectedTagFilter, tagName]
    setSelectedTagFilter(updated)
    fetchDirectory(search, updated)
  }

  const clearFilters = () => {
    setSelectedTagFilter([])
    setSearch('')
    fetchDirectory('', [])
  }

  const toggleFavorite = async (participantId) => {
    if (togglingFav === participantId) return
    setTogglingFav(participantId)
    try {
      const idToken = await auth.currentUser.getIdToken()
      const isFav = favorites.has(participantId)
      await fetch(
        `https://networking-k0cv.onrender.com/api/favorites/events/${eventId}/participants/${participantId}`,
        { method: isFav ? 'DELETE' : 'POST', headers: { Authorization: `Bearer ${idToken}` } }
      )
      setFavorites(prev => {
        const next = new Set(prev)
        if (isFav) next.delete(participantId)
        else next.add(participantId)
        return next
      })
    } catch (err) {
      console.error('Favorite toggle error:', err)
    } finally {
      setTogglingFav(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 active:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-base truncate">{event?.name || 'Directory'}</h1>
            <p className="text-xs text-gray-400">
              {participants.length} attendee{participants.length !== 1 ? 's' : ''}
              {favorites.size > 0 && ` Â· ${favorites.size} saved`}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, company, roleâ€¦"
            className="flex-1 text-sm text-gray-800 bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-400 placeholder-gray-300"
          />
          <button
            type="submit"
            className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white active:bg-blue-700 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* Tag filters */}
        {eventTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {eventTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTagFilter(tag.name)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                  selectedTagFilter.includes(tag.name)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
            {(selectedTagFilter.length > 0 || search) && (
              <button
                onClick={clearFilters}
                className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold bg-red-50 text-red-400 border border-red-100"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Participant list */}
        {participants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-medium">
              {search || selectedTagFilter.length > 0 ? 'No matches found.' : 'No attendees yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {participants.map(participant => (
              <div key={participant.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="text-base font-bold text-blue-600">
                      {(participant.name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{participant.name}</p>
                    {participant.designation && (
                      <p className="text-xs text-blue-600 font-medium">{participant.designation}</p>
                    )}
                    {participant.company && (
                      <p className="text-xs text-gray-400">{participant.company}</p>
                    )}
                    {participant.tags && participant.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {participant.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full">
                            {typeof tag === 'string' ? tag : tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleFavorite(participant.id)}
                      disabled={togglingFav === participant.id}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        favorites.has(participant.id)
                          ? 'bg-yellow-100 text-yellow-500'
                          : 'bg-gray-50 text-gray-300'
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill={favorites.has(participant.id) ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                    {participant.linkedin_url && (
                      <a
                        href={participant.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventDirectory
