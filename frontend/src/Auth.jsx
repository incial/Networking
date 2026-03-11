import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, googleProvider } from './config/firebase'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  
  const navigate = useNavigate()

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard')
      }
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [navigate])

  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      let userCredential
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password)
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
      }

      const user = userCredential.user
      const idToken = await user.getIdToken()

      // Sync user with backend
      await fetch('https://networking-k0cv.onrender.com/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: name || user.displayName || user.email.split('@')[0]
        })
      })

      const returnUrl = sessionStorage.getItem('returnUrl')
      sessionStorage.removeItem('returnUrl')
      navigate(returnUrl || '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      const idToken = await user.getIdToken()

      // Sync user with backend
      await fetch('https://networking-k0cv.onrender.com/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0]
        })
      })

      const returnUrl = sessionStorage.getItem('returnUrl')
      sessionStorage.removeItem('returnUrl')
      navigate(returnUrl || '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }} className="min-h-screen bg-white flex flex-col lg:flex-row relative overflow-hidden">
      {/* Left Side: Visual / Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-black relative items-center justify-center p-12 overflow-hidden">
        <div className="relative z-10 w-full max-w-lg text-white">
          <div className="inline-flex items-center gap-2 mb-6 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span style={{ fontFamily: 'Poppins, sans-serif' }} className="text-[10px] font-600 uppercase tracking-widest text-blue-400">Join the Network</span>
          </div>

          <h1 style={{ fontFamily: 'Poppins, sans-serif' }} className="text-5xl lg:text-6xl font-900 leading-tight tracking-tight mb-8">
            Professional <br /> Networking <br /> <span className="text-blue-400">Made Easy</span>
          </h1>

          <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-base font-400 text-slate-300 mb-12 leading-relaxed">
            Connect with professionals at events. Share your skills, expand your network, and build meaningful professional relationships.
          </p>

          {/* Benefits */}
          <div className="space-y-4 border-t border-white/10 pt-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm font-600">Instant Connections</p>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-xs text-slate-400">Connect with professionals instantly</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm font-600">Skill Tags</p>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-xs text-slate-400">Showcase your expertise and interests</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm font-600">Real-time Analytics</p>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-xs text-slate-400">Track your networking impact and ROI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md z-10">
          {/* Logo/Home Link */}
          <div className="mb-8 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
              <span style={{ fontFamily: 'Poppins, sans-serif' }} className="text-lg font-bold text-slate-900">EventSync</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="mb-8">
            <h2 style={{ fontFamily: 'Poppins, sans-serif' }} className="text-3xl font-800 text-slate-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Join EventSync'}
            </h2>
            <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm text-slate-500">
              {isLogin ? 'Sign in to your account or create a new one' : 'Create an account to start networking'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-600">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleAuth}>
            {!isLogin && (
              <div>
                <label style={{ fontFamily: 'Poppins, sans-serif' }} className="block text-sm font-600 text-slate-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              </div>
            )}
            
            <div>
              <label style={{ fontFamily: 'Poppins, sans-serif' }} className="block text-sm font-600 text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label style={{ fontFamily: 'Poppins, sans-serif' }} className="block text-sm font-600 text-slate-700">Password</label>
                {isLogin && <a href="#" style={{ fontFamily: 'Poppins, sans-serif' }} className="text-xs font-600 text-blue-600 hover:underline">Forgot password?</a>}
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-600 text-sm py-3 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span style={{ fontFamily: 'Poppins, sans-serif' }} className="text-xs text-slate-400 font-500">Or continue with</span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          {/* Google Auth */}
          <button 
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-white border border-slate-200 text-slate-700 font-600 text-sm py-3 rounded-lg hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-.60 3.30-2.24 6.16-2.24z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Toggle Login/Signup */}
          <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-center mt-6 text-sm text-slate-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="font-600 text-blue-600 hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          {/* Footer Note */}
          <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-center mt-8 text-xs text-slate-400">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}


export default Auth


