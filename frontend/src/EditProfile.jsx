import React, { useEffect, useState } from 'react'
import { auth } from './config/firebase'
import { useNavigate } from 'react-router-dom'

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    linkedin_url: '',
    company: '',
    designation: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const idToken = await auth.currentUser.getIdToken()
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: { 'Authorization': `Bearer ${idToken}` }
        })
        const data = await response.json()
        setFormData({
          name: data.name || '',
          linkedin_url: data.linkedin_url || '',
          company: data.company || '',
          designation: data.designation || '',
        })
      } catch (err) {
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }

    if (auth.currentUser) fetchProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const idToken = await auth.currentUser.getIdToken()
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to update profile')
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const field = (key) => ({
    value: formData[key],
    onChange: (e) => setFormData({ ...formData, [key]: e.target.value })
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f4ff] font-sans">

      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Edit Profile</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 lg:px-12 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">Account Settings</p>
          <h1 className="text-4xl font-black text-[#1e293b] uppercase tracking-tighter leading-none">Edit Profile</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
            Update your public identity shown to other members
          </p>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
            <span className="text-2xl font-black text-white uppercase">
              {(formData.name || auth.currentUser?.displayName || 'U').charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-lg font-black text-[#1e293b] uppercase tracking-tight leading-tight">
              {formData.name || auth.currentUser?.displayName || 'Your Name'}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{auth.currentUser?.email}</p>
            {formData.designation && (
              <p className="text-[10px] font-bold text-blue-500 mt-0.5 uppercase">{formData.designation} {formData.company ? `· ${formData.company}` : ''}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl">
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Profile updated! Redirecting...</p>
            </div>
          )}

          {/* Name */}
          <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="John Doe"
              className="w-full text-lg font-black text-[#1e293b] placeholder:text-slate-200 placeholder:font-black bg-transparent border-none outline-none"
              {...field('name')}
            />
          </div>

          {/* Designation + Company */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                Designation
              </label>
              <input
                type="text"
                placeholder="Software Engineer"
                className="w-full text-sm font-bold text-[#1e293b] placeholder:text-slate-300 bg-transparent border-none outline-none"
                {...field('designation')}
              />
            </div>
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                Company / Organization
              </label>
              <input
                type="text"
                placeholder="Tech Corp"
                className="w-full text-sm font-bold text-[#1e293b] placeholder:text-slate-300 bg-transparent border-none outline-none"
                {...field('company')}
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
              <svg className="w-3 h-3 inline mr-1.5 -mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn URL
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/johndoe"
              className="w-full text-sm font-bold text-[#1e293b] placeholder:text-slate-300 bg-transparent border-none outline-none"
              {...field('linkedin_url')}
            />
            {formData.linkedin_url && (
              <a
                href={formData.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline"
              >
                Preview link
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-white border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  Save Profile
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfile
