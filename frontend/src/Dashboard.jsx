import React, { useEffect, useState } from 'react'
import { auth } from './config/firebase'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'

const Dashboard = () => {
  const [userData, setUserData] = useState(null)
  const [myEvents, setMyEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [activeTab, setActiveTab] = useState('events')
  const [eventsSubTab, setEventsSubTab] = useState('my')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfileAndEvents = async () => {
      try {
        const idToken = await auth.currentUser.getIdToken()
        
        // Fetch Profile
        const profileResponse = await fetch('https://networking-k0cv.onrender.com/api/users/profile', {
          headers: { 'Authorization': `Bearer ${idToken}` }
        })
        const profileData = await profileResponse.json()
        // Map response to expected format: { id, name, email, role, linkedin_url, company, designation }
        setUserData({
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          role: profileData.role,
          linkedin_url: profileData.linkedin_url,
          company: profileData.company,
          designation: profileData.designation,
        })

        // Fetch My Events + Joined Events in parallel
        const [eventsResponse, joinedResponse] = await Promise.all([
          fetch('https://networking-k0cv.onrender.com/api/events/my-events',  { headers: { 'Authorization': `Bearer ${idToken}` } }),
          fetch('https://networking-k0cv.onrender.com/api/users/joined-events', { headers: { 'Authorization': `Bearer ${idToken}` } })
        ])
        const [eventsData, joinedData] = await Promise.all([eventsResponse.json(), joinedResponse.json()])
        if (Array.isArray(eventsData)) setMyEvents(eventsData)
        if (Array.isArray(joinedData)) setJoinedEvents(joinedData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (auth.currentUser) {
      fetchProfileAndEvents()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate('/auth')
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleRequestOrganizer = async () => {
    try {
      const idToken = await auth.currentUser.getIdToken()
      const response = await fetch('https://networking-k0cv.onrender.com/api/users/request-organizer', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      })
      if (response.ok) {
        alert('Organizer request submitted! Awaiting Super Admin approval.')
        window.location.reload()
      }
    } catch (error) {
      console.error("Error requesting role:", error)
    }
  }

  const handleCopyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/event/${slug}`)
    alert('Link copied!')
  }

  const statusStyle = (s) => ({
    APPROVED: { pill: 'bg-green-100 text-green-700', dot: 'bg-green-500', label: 'Live' },
    PENDING:  { pill: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400',  label: 'Pending' },
    REJECTED: { pill: 'bg-red-100 text-red-600',    dot: 'bg-red-400',    label: 'Rejected' },
    ARCHIVED: { pill: 'bg-gray-100 text-gray-500',  dot: 'bg-gray-300',   label: 'Archived' },
  }[s] || { pill: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300', label: s })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col md:flex-row">

      {/* Desktop Sidebar Nav */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-gray-100 flex-col items-center py-8 z-30 shadow-sm">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-blue-100 flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <div className="flex-1 flex flex-col gap-4 items-center">
          <button
            onClick={() => setActiveTab('events')}
            title="Dashboard"
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === 'events' ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
          
          <button
            onClick={() => navigate('/')}
            title="Explore"
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            title="Profile"
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === 'profile' ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>

        <button onClick={handleSignOut} title="Sign Out" className="w-12 h-12 rounded-2xl flex items-center justify-center text-red-400 hover:bg-red-50 transition-all">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </nav>

      <div className="flex-1 md:ml-20 flex flex-col">
        {/* Top header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between md:h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">EventSuite</span>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            userData?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
            userData?.role === 'ORGANIZER'   ? 'bg-blue-100 text-blue-700' :
                                               'bg-gray-100 text-gray-600'
          }`}>
            {userData?.role === 'SUPER_ADMIN' ? 'Admin' :
             userData?.role === 'ORGANIZER'   ? 'Organizer' : 'Member'}
          </span>
        </div>
      </header>

      {/* Scrollable content - now in the flex container */}
      <main className="max-w-5xl mx-auto px-4 pt-5 pb-20 md:pb-10 w-full space-y-4 md:space-y-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main content - takes 8 cols on desktop */}
          <div className="md:col-span-8 space-y-6">

        {/* â”€â”€â”€ EVENTS TAB â”€â”€â”€ */}
        {activeTab === 'events' && <>

          {/* Greeting */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Hey, {userData?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {myEvents.filter(e => e.status === 'APPROVED').length} live event{myEvents.filter(e => e.status === 'APPROVED').length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-gray-900">{myEvents.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-green-600">{myEvents.filter(e => e.status === 'APPROVED').length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Live</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-amber-500">{myEvents.filter(e => e.status === 'PENDING').length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Pending</p>
            </div>
          </div>

          {/* Events list */}
          <div>
            {/* Sub-tabs */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setEventsSubTab('my')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    eventsSubTab === 'my' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
                  }`}
                >
                  My Events
                </button>
                <button
                  onClick={() => setEventsSubTab('joined')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    eventsSubTab === 'joined' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
                  }`}
                >
                  Joined {joinedEvents.length > 0 && <span className="ml-1 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-[10px]">{joinedEvents.length}</span>}
                </button>
              </div>
              {eventsSubTab === 'my' && (
                <button
                  onClick={() => navigate('/create-event')}
                  className="text-sm font-semibold text-blue-600 active:opacity-60"
                >
                  + New
                </button>
              )}
            </div>

            {eventsSubTab === 'joined' ? (
              // ── Joined Events ──
              joinedEvents.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">You haven't joined any events yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {joinedEvents.map(event => (
                    <div key={event.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{event.name}</h3>
                        <div className="flex flex-wrap gap-x-3 text-xs text-gray-400">
                          {event.event_date && (
                            <span>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          )}
                          {event.location && <span>{event.location}</span>}
                          {event.organizer_name && <span>by {event.organizer_name}</span>}
                        </div>
                        <p className="text-xs text-gray-300 mt-1">
                          {event.participant_count} attendee{event.participant_count != 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="border-t border-gray-50">
                        <button
                          onClick={() => navigate(`/event/${event.id}/directory`)}
                          className="w-full flex items-center justify-center gap-2 py-3 text-[11px] font-semibold text-blue-600 active:bg-blue-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          View Directory
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : myEvents.length === 0 ? (
              <div
                onClick={() => navigate('/create-event')}
                className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 flex flex-col items-center gap-3 active:bg-gray-50"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-400 text-center">
                  No events yet.<br />Tap to create your first one.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myEvents.map(event => {
                  const c = statusStyle(event.status)
                  return (
                    <div key={event.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1">{event.name}</h3>
                          <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${c.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                            {c.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 text-xs text-gray-400">
                          {event.event_date && (
                            <span>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          )}
                          {event.location && <span>{event.location}</span>}
                        </div>
                      </div>

                      {event.status === 'APPROVED' && (
                        <div className="border-t border-gray-50 grid grid-cols-3 divide-x divide-gray-50">
                          <button
                            onClick={() => { setSelectedEvent(event); setShowQR(true) }}
                            className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold text-gray-600 active:bg-gray-50"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5a.5.5 0 11-1 0 .5.5 0 011 0zM6.5 20.5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                            </svg>
                            QR Code
                          </button>
                          <button
                            onClick={() => handleCopyLink(event.slug)}
                            className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold text-gray-600 active:bg-gray-50"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 01-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Copy Link
                          </button>
                          <button
                            onClick={() => navigate(`/event/${event.id}/directory`)}
                            className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold text-blue-600 active:bg-blue-50"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Directory
                          </button>
                        </div>
                      )}

                      {event.status === 'PENDING' && (
                        <div className="border-t border-gray-50 px-4 py-2.5">
                          <p className="text-xs text-amber-500 font-medium text-center">Waiting for admin approval</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Admin shortcut */}
          {userData?.role === 'SUPER_ADMIN' && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full bg-purple-600 text-white rounded-2xl p-4 flex items-center gap-3 active:bg-purple-700"
            >
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">Admin Panel</p>
                <p className="text-xs text-purple-200">Review pending requests</p>
              </div>
              <svg className="w-4 h-4 text-purple-300 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </>}

        {/* â”€â”€â”€ PROFILE TAB â”€â”€â”€ */}
        {activeTab === 'profile' && <>

          {/* Avatar + name */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-blue-600">
                  {(userData?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-base truncate">{userData?.name || 'User'}</p>
                <p className="text-sm text-gray-400 truncate">{userData?.email}</p>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              <div className="py-3 flex justify-between">
                <p className="text-sm text-gray-400">Role</p>
                <p className="text-sm font-semibold text-gray-800">
                  {userData?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                   userData?.role === 'ORGANIZER' ? 'Organizer' :
                   userData?.role === 'ORGANIZER_PENDING' ? 'Organizer (Pending)' : 'Member'}
                </p>
              </div>
              <div className="py-3 flex justify-between">
                <p className="text-sm text-gray-400">Designation</p>
                <p className="text-sm font-semibold text-gray-800">{userData?.designation || 'â€”'}</p>
              </div>
              <div className="py-3 flex justify-between">
                <p className="text-sm text-gray-400">Company</p>
                <p className="text-sm font-semibold text-gray-800 text-right">{userData?.company || 'â€”'}</p>
              </div>
              {userData?.linkedin_url && (
                <div className="py-3 flex justify-between items-center">
                  <p className="text-sm text-gray-400">LinkedIn</p>
                  <a
                    href={userData.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-600"
                  >
                    View â†’
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action list */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => navigate('/edit-profile')}
              className="w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50 border-b border-gray-50"
            >
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-800 flex-1 text-left">Edit Profile</span>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {userData?.role === 'PARTICIPANT' && (
              <button
                onClick={handleRequestOrganizer}
                className="w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50 border-b border-gray-50"
              >
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800 flex-1 text-left">Request Organizer Role</span>
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {userData?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => navigate('/admin')}
                className="w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50 border-b border-gray-50"
              >
                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800 flex-1 text-left">Admin Panel</span>
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50"
            >
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-sm font-medium text-red-600 flex-1 text-left">Sign Out</span>
            </button>
          </div>
        </>}

        </div>

        {/* Right Sidebar - Desktop only (4 cols) */}
        <aside className="hidden md:block md:col-span-4 space-y-6 sticky top-20">
          {/* Admin panel shortcut */}
          {userData?.role === 'SUPER_ADMIN' && activeTab === 'events' && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-[28px] p-6 flex items-center gap-4 shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase opacity-70">Admin Access</p>
                <p className="font-bold text-lg leading-tight">Control Panel</p>
              </div>
            </button>
          )}

          {/* Utilities card */}
          <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => navigate('/')} className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-900 hover:text-white transition-all group">
                <span className="text-xs uppercase font-black">Find Events</span>
                <svg className="w-4 h-4 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button onClick={() => navigate('/create-event')} className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all group">
                <span className="text-xs uppercase font-black">Host Event</span>
                <svg className="w-4 h-4 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Promo card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-700 rounded-[28px] p-6 text-white shadow-xl shadow-indigo-200 overflow-hidden relative group">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <p className="text-lg font-black leading-tight mb-2 relative z-10">Unlock more.</p>
            <p className="text-xs text-indigo-100 font-medium opacity-80 mb-6 relative z-10">Organize events, build your network, and take control.</p>
            <button onClick={() => navigate('/')} className="w-full bg-white text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest py-3 shadow-lg hover:-translate-y-1 transition-all relative z-10">Explore ✨</button>
          </div>
        </aside>
        </div>
      </main>

      {/* Close flex-1 wrapper */}
      </div>

      {/* Mobile-only Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20 w-full">
        <div className="max-w-lg mx-auto flex items-end px-6 pb-2 pt-1">

          {/* Events tab */}
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
              activeTab === 'events' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill={activeTab === 'events' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'events' ? 0 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-semibold">Events</span>
          </button>

          {/* Add (centre FAB raised above nav) */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => navigate('/create-event')}
              className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-300 -translate-y-4 active:scale-95 transition-transform"
            >
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Profile tab */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill={activeTab === 'profile' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'profile' ? 0 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-semibold">Profile</span>
          </button>

        </div>
      </nav>

      {/* â”€â”€â”€ QR Bottom Sheet â”€â”€â”€ */}
      {showQR && selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            {/* drag handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <p className="text-xs text-gray-400 text-center font-medium mb-1">Scan to Join</p>
            <h3 className="text-base font-bold text-gray-900 text-center mb-6 leading-snug">{selectedEvent.name}</h3>
            <div className="flex justify-center mb-5">
              <div className="p-4 border-2 border-gray-100 rounded-2xl">
                <QRCodeSVG
                  value={`${window.location.origin}/event/${selectedEvent.slug}`}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#1e293b"
                  level="H"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mb-6 break-all px-4">
              {window.location.origin}/event/{selectedEvent.slug}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleCopyLink(selectedEvent.slug)}
                className="flex-1 bg-blue-600 text-white text-sm font-semibold py-3.5 rounded-2xl active:bg-blue-700"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 bg-gray-100 text-gray-700 text-sm font-semibold py-3.5 rounded-2xl active:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Closing root flex container */}
    </div>
  )
}

export default Dashboard
