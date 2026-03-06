import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null)
  const [dbUser, setDbUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken()
          const res = await fetch('https://networking-k0cv.onrender.com/api/users/profile', {
            headers: { 'Authorization': `Bearer ${idToken}` }
          })
          const data = await res.json()
          setDbUser(data)
        } catch (err) {
          console.error("Error fetching role:", err)
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f7ff]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" />
  }

  if (allowedRoles && (!dbUser || !allowedRoles.includes(dbUser.role))) {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default ProtectedRoute
