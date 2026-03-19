import React, { useEffect, useState } from 'react'
import { auth } from './config/firebase'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import API_BASE_URL from './config/api'

const Dashboard = () => {
  const [userData, setUserData] = useState(null)
  const [myEvents, setMyEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfileAndEvents = async () => {
      try {
        const idToken = await auth.currentUser.getIdToken()
        
        // Fetch Profile
        const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${idToken}` }
        })
        const profileData = await profileResponse.json()
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
          fetch(`${API_BASE_URL}/events/my-events`,  { headers: { 'Authorization': `Bearer ${idToken}` } }),
          fetch(`${API_BASE_URL}/users/joined-events`, { headers: { 'Authorization': `Bearer ${idToken}` } })
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
      const response = await fetch(`${API_BASE_URL}/users/request-organizer`, {
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
    <div style={{ fontFamily: 'Poppins, sans-serif' }} className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-base">EventSync</span>
          </div>
          <button onClick={handleSignOut} className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium">
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24 md:pb-8">
        <div className="space-y-6">

          {/* HOME TAB */}
          {activeTab === 'home' && (
            <>
              {/* Welcome section */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {userData?.name?.split(' ')[0] || 'there'}
                </h1>
                <p className="text-gray-600">Discover events and grow your network</p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-3.5">
                  <div className="text-xs text-blue-600 font-medium mb-1">Events Created</div>
                  <div className="text-2xl font-bold text-blue-900">{myEvents.length}</div>
                </div>
                <div className="bg-purple-50 rounded-xl border border-purple-100 p-3.5">
                  <div className="text-xs text-purple-600 font-medium mb-1">Events Joined</div>
                  <div className="text-2xl font-bold text-purple-900">{joinedEvents.length}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/create-event')}
                  className="bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Create Event
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-100 text-gray-900 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 active:scale-95 transition-all"
                >
                  Explore Events
                </button>
              </div>

              {/* Events sections */}
              {myEvents.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900">Your Events</h2>
                  <div className="space-y-2.5">
                    {myEvents.slice(0, 3).map(event => {
                      const c = statusStyle(event.status)
                      return (
                        <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-3.5 flex items-start gap-3 cursor-pointer hover:shadow-md transition-all" onClick={() => navigate(`/event/${event.id}/directory`)}>
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{event.name}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {event.event_date && new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {event.location && ` • ${event.location}`}
                            </p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${c.pill}`}>
                            {c.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {joinedEvents.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900">Events You've Joined</h2>
                  <div className="space-y-2.5">
                    {joinedEvents.slice(0, 3).map(event => (
                      <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-3.5 flex items-start gap-3 cursor-pointer hover:shadow-md transition-all" onClick={() => navigate(`/event/${event.id}/directory`)}>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{event.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {event.event_date && new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {event.location && ` • ${event.location}`}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">{event.participant_count} attendees</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {myEvents.length === 0 && joinedEvents.length === 0 && (
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-12 flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m0 0l-2-1m2 1v2.5M14 4l-2 1m0 0L10 4m2 1v2.5M4 7l2-1m0 0l2 1m-2-1v2.5" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400 font-medium">No events yet</p>
                  <p className="text-xs text-gray-400">Create or join events to get started</p>
                </div>
              )}
            </>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <>
              {/* Profile card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl font-bold text-blue-600">
                      {(userData?.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base truncate">{userData?.name || 'User'}</p>
                    <p className="text-sm text-gray-500 truncate">{userData?.email}</p>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  <div className="py-3 flex justify-between">
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {userData?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                       userData?.role === 'ORGANIZER' ? 'Organizer' :
                       userData?.role === 'ORGANIZER_PENDING' ? 'Organizer (Pending)' : 'Member'}
                    </p>
                  </div>
                  <div className="py-3 flex justify-between">
                    <p className="text-sm text-gray-600">Designation</p>
                    <p className="text-sm font-semibold text-gray-900">{userData?.designation || '—'}</p>
                  </div>
                  <div className="py-3 flex justify-between">
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">{userData?.company || '—'}</p>
                  </div>
                  {userData?.linkedin_url && (
                    <div className="py-3 flex justify-between items-center">
                      <p className="text-sm text-gray-600">LinkedIn</p>
                      <a
                        href={userData.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View →
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action list */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => navigate('/edit-profile')}
                  className="w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50 border-b border-gray-100"
                >
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
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
                    className="w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50 border-b border-gray-100"
                  >
                    <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
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

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50"
                >
                  <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-red-600 flex-1 text-left">Sign Out</span>
                </button>
              </div>
            </>
          )}

        </div>
      </main>

      {/* Mobile-only Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20 w-full">
        <div className="max-w-2xl mx-auto flex items-end px-4 pb-2 pt-1">
          {/* Home tab */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
              activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill={activeTab === 'home' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'home' ? 0 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9M9 21h6M9 5h6M9 9h6" />
            </svg>
            <span className="text-[10px] font-semibold">Home</span>
          </button>

          {/* Explore tab */}
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[10px] font-semibold">Explore</span>
          </button>

          {/* Profile tab */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
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

      {/* QR Bottom Sheet */}
      {showQR && selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-t-3xl p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
            <p className="text-xs text-gray-500 text-center font-medium mb-1">Scan to join event</p>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-6 leading-snug">{selectedEvent.name}</h3>
            <div className="flex justify-center mb-6">
              <div className="p-4 border-2 border-gray-100 rounded-2xl bg-gray-50">
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
                className="flex-1 bg-blue-600 text-white text-sm font-semibold py-3.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 bg-gray-100 text-gray-700 text-sm font-semibold py-3.5 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
