import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import Heroimg from './assets/hero1.png'
const Home = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }} className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-6 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
          <span className="text-lg font-bold text-slate-900">EventSync</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
          <a href="#services" className="text-sm text-slate-600 hover:text-slate-900">Services</a>
          <a href="#works" className="text-sm text-slate-600 hover:text-slate-900">Works</a>
          <a href="#about" className="text-sm text-slate-600 hover:text-slate-900">About Us</a>
          <a href="#careers" className="text-sm text-slate-600 hover:text-slate-900">Careers</a>
        </div>

        <div>
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-600 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
          ) : (
            <Link 
              to="/auth" 
              className="px-6 py-2 bg-blue-600 text-white text-sm font-600 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-slate-500 text-sm font-500 mb-4">You're invited to join</p>
            
            <h1 style={{ fontFamily: 'Poppins, sans-serif' }} className="text-5xl lg:text-6xl font-semibold text-black leading-tight mb-6">
              Night of the <br /> Enable House
            </h1>
            
            <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-slate-600 text-base font-400 mb-8 max-w-md leading-relaxed">
              Don't miss out on the once-a-year party where you will be showered with lots of fun, great food & drinks, and a great time. Bring your creative costume and join us now.
            </p>

            <div className="flex items-center gap-4 mb-12">
              <button className="px-8 py-3 bg-blue-600 text-white font-600 rounded-lg hover:bg-blue-700 transition">
                Join event
              </button>
              <button className="flex items-center gap-2 text-slate-900 font-600 hover:text-blue-600 transition">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                Watch video
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-12">
              <div>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-3xl font-900 text-black">200+</p>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm text-slate-500 font-500">People joined already</p>
              </div>
              <div>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-3xl font-900 text-black">1.2k+</p>
                <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm text-slate-500 font-500">Laughs will be given</p>
              </div>
            </div>
          </div>

          {/* Right Side - Hero Image */}
          <div className="relative h-100 lg:h-full flex items-center justify-center">
            <img 
              src={Heroimg}
              alt="EventSync Hero"
              className="w-[800px] h-auto  object-contain "
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-gradient-to-br from-slate-900 to-black px-6 lg:px-12 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 style={{ fontFamily: 'Poppins, sans-serif' }} className="text-3xl lg:text-5xl font-900 text-white mb-6">
            Ready to Network?
          </h2>
          <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
            Join hundreds of professionals at Enable House and expand your network with meaningful connections.
          </p>
          <button className="px-10 py-4 bg-blue-600 text-white font-700 rounded-lg hover:bg-blue-700 transition text-lg">
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  )
}

export default Home

