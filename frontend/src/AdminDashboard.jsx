import React, { useEffect, useState } from 'react'
import { auth } from './config/firebase'
import API_BASE_URL from './config/api'

const AdminDashboard = () => {
  const [pendingEvents, setPendingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPending = async () => {
    try {
      const idToken = await auth.currentUser.getIdToken()
      const res = await fetch(`${API_BASE_URL}/events/admin/pending`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      })
      const data = await res.json()
      setPendingEvents(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPending() }, [])

  const handleAction = async (id, action) => {
    const idToken = await auth.currentUser.getIdToken()
    await fetch(`${API_BASE_URL}/events/${id}/${action}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${idToken}` }
    })
    fetchPending()
  }

  if (loading) return <div>Loading Protocol...</div>

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-[#1e293b] uppercase mb-10">Admin Control [Pending Events]</h1>
        <div className="space-y-4">
          {pendingEvents.map(event => (
            <div key={event.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-black uppercase text-slate-800">{event.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{event.location} • {event.event_date}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction(event.id, 'approve')} className="bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg">Approve</button>
                <button onClick={() => handleAction(event.id, 'reject')} className="bg-red-50 text-red-600 text-[10px] font-black uppercase px-4 py-2 rounded-lg">Reject</button>
              </div>
            </div>
          ))}
          {pendingEvents.length === 0 && <p className="text-center text-slate-400 uppercase font-black py-20 text-xs">No pending protocols in queue.</p>}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
