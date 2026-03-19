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
  const [activeTab, setActiveTab] = useState('events')
  const [eventsSubTab, setEventsSubTab] = useState('my')
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

      <div className="flex-1 flex flex-col">
          {/* Top header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span style={{ fontFamily: 'Poppins, sans-serif' }} className="font-bold text-slate-900 text-base">EventSync</span>
            </div>
            <div className="flex items-center gap-3">
              {/* <button onClick={() => navigate('/')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Discover</button> */}
              {/* <button onClick={() => setActiveTab('profile')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Profile</button> */}
              <button onClick={handleSignOut} className="text-sm text-red-600 hover:text-red-700 transition-colors">Sign Out</button>
            </div>
          </div>
        </header>

      {/* Scrollable content - now in the flex container */}
      <main className="max-w-6xl mx-auto px-6 lg:px-12 py-8 pb-20 md:pb-10 w-full space-y-6 flex-1">
        {/* Main content area */}
        <div className="space-y-8">

        {/* â”€â”€â”€ EVENTS TAB â”€â”€â”€ */}
        {activeTab === 'events' && <>
          {/* <div className="mb-2">
            <h1 style={{ fontFamily: 'Poppins, sans-serif' }} className="text-3xl font-bold text-slate-900 mb-1">
              Welcome back, {userData?.name?.split(' ')[0] || 'there'} 
            </h1>
            <p className="text-gray-600 text-sm">Explore events and grow your network</p>
          </div> */}

          {/* Events list */}
          <div>
            {/* Tabs header */}
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: 'Poppins, sans-serif' }} className="text-xl font-semibold text-slate-900">
                {eventsSubTab === 'my' ? 'Your Events' : 'Events You\'ve Joined'}
              </h2>
              {eventsSubTab === 'my' && (
                <button
                  onClick={() => navigate('/create-event')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  + Create Event
                </button>
              )}
            </div>
            
            {/* Sub-tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-200">
              <button
                onClick={() => setEventsSubTab('my')}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  eventsSubTab === 'my' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                My Events
              </button>
              <button
                onClick={() => setEventsSubTab('joined')}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  eventsSubTab === 'joined' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Joined Events {joinedEvents.length > 0 && <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">{joinedEvents.length}</span>}
              </button>
            </div>

            {eventsSubTab === 'joined' ? (
              // Joined Events
              joinedEvents.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-12 flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m0 0l-2-1m2 1v2.5M14 4l-2 1m0 0L10 4m2 1v2.5M4 7l2-1m0 0l2 1m-2-1v2.5" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-lg font-semibold text-gray-900">No events joined yet</p>
                    <p className="text-sm text-gray-600 mt-1">Discover and join events to meet your community</p>
                  </div>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Explore Events
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {joinedEvents.map(event => (
                    <div key={event.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(`/event/${event.id}/directory`)}>
                      <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-24" />
                      <div className="p-4">
                        <h3 style={{ fontFamily: 'Poppins, sans-serif' }} className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{event.name}</h3>
                        <div className="space-y-2 text-xs text-gray-600 mb-4">
                          {event.event_date && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-500">{event.participant_count} attendee{event.participant_count != 1 ? 's' : ''}</span>
                          {event.organizer_name && <span className="text-xs text-gray-400">by {event.organizer_name}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : myEvents.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-12 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-lg font-semibold text-gray-900">No events created yet</p>
                  <p className="text-sm text-gray-600 mt-1">Start hosting and connecting with others</p>
                </div>
                <button
                  onClick={() => navigate('/create-event')}
                  className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myEvents.map(event => {
                  const c = statusStyle(event.status)
                  return (
                    <div key={event.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                      <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-20 relative flex items-end justify-end p-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 ${c.pill.replace('bg-', 'text-').replace('text-', '')}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                          {c.label}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 style={{ fontFamily: 'Poppins, sans-serif' }} className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{event.name}</h3>
                        <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                          {event.event_date && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>

                        {event.status === 'APPROVED' && (
                          <div className="pt-3 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <button
                                onClick={() => { setSelectedEvent(event); setShowQR(true) }}
                                className="flex items-center justify-center gap-1 py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5a.5.5 0 11-1 0 .5.5 0 011 0zM6.5 20.5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                                </svg>
                                QR
                              </button>
                              <button
                                onClick={() => handleCopyLink(event.slug)}
                                className="flex items-center justify-center gap-1 py-2 text-xs font-semibold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 01-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Link
                              </button>
                            </div>
                            <button
                              onClick={() => navigate(`/event/${event.id}/directory`)}
                              className="w-full py-2.5 text-xs font-semibold text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        )}

                        {event.status === 'PENDING' && (
                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-center font-medium">⏳ Awaiting approval</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </>}

        {/* â”€â”€â”€ PROFILE TAB â”€â”€â”€ */}
        {activeTab === 'profile' && <>

          {/* Avatar + name */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <span style={{ fontFamily: 'Poppins, sans-serif' }} className="text-2xl font-bold text-blue-600">
                  {(userData?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="font-bold text-gray-900 text-base truncate">{userData?.name || 'User'}</p>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm text-gray-400 truncate">{userData?.email}</p>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              <div className="py-3 flex justify-between">
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm text-gray-400">Role</p>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm font-semibold text-gray-800">
                  {userData?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                   userData?.role === 'ORGANIZER' ? 'Organizer' :
                   userData?.role === 'ORGANIZER_PENDING' ? 'Organizer (Pending)' : 'Member'}
                </p>
              </div>
              <div className="py-3 flex justify-between">
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm text-gray-400">Designation</p>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm font-semibold text-gray-800">{userData?.designation || 'Not specified'}</p>
              </div>
              <div className="py-3 flex justify-between">
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm text-gray-400">Company</p>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm font-semibold text-gray-800 text-right">{userData?.company || 'Not specified'}</p>
              </div>
              {userData?.linkedin_url && (
                <div className="py-3 flex justify-between items-center">
                  <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm text-gray-400">LinkedIn</p>
                  <a
                    href={userData.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-600"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    View Profile
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
            <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-xs text-gray-400 text-center font-medium mb-1">Scan to Join</p>
            <h3 style={{ fontFamily: 'Poppins, sans-serif' }} className="text-base font-bold text-gray-900 text-center mb-6 leading-snug">{selectedEvent.name}</h3>
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
            <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-xs text-gray-400 text-center mb-6 break-all px-4">
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
