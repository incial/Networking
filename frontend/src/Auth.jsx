import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import heroimg from './assets/hero.png'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false)

  return (
    <div className="min-h-screen bg-[#f0f7ff] font-sans text-slate-900 flex flex-col lg:flex-row relative overflow-hidden">
      {/* Left Side: Visual / Marketing (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e293b] relative items-center justify-center p-12 overflow-hidden">
        {/* Subtle Path Effect synced with Home */}
        <svg className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 opacity-20 pointer-events-none" viewBox="0 0 1200 300" fill="none">
          <path d="M-50,150 C200,50 400,250 600,150 C800,50 1000,250 1250,150" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        </svg>

        <div className="relative z-10 w-full max-w-lg">
          <div className="inline-flex items-center gap-2 mb-6 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Security Protocol v2.0 Active</span>
          </div>

          <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white uppercase mb-8">
            EVENT-BASED <br />
            NETWORKING <br />
            <span className="text-blue-500 italic underline decoration-blue-500/30">SYNCED.</span>
          </h1>

          <div className="relative mt-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
            <img 
              src={heroimg} 
              alt="EventSync Interface" 
              className="w-full h-auto drop-shadow-2xl opacity-90 scale-110"
            />
            {/* Floating Tag */}
            <div className="absolute top-12 right-6 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-lg shadow-xl animate-bounce-slow">
              ROI DASHBOARD ACTIVE
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
            <div>
              <p className="text-xs font-black text-white uppercase tracking-tighter">Zero App Fatigue</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Web-First Access</p>
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-tighter">Verified Context</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Skill-Tagged Sync</p>
            </div>
          </div>
        </div>

        {/* Diagonal Stripes on Left Panel */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 20px)` }}>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        {/* Sync Background Pattern with Home */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 20px)` }}>
        </div>

        <div className="w-full max-w-[440px] z-10">
      

          <div className="bg-white rounded-[10px] p-10  border border-slate-100 relative overflow-hidden">
            {/* <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div> */}
            
            <div className="mb-10">
              <h2 className="text-3xl font-black text-[#1e293b] uppercase tracking-tighter leading-none mb-3">
                {isLogin ? 'Authenticate' : 'Join Event'}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-50 py-3">
                {isLogin ? 'Member of the Networking Suite' : 'Ready for ROI-Focused Networking'}
              </p>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Attendee Name</label>
                  <input 
                    type="text" 
                    placeholder="FULL NAME"
                    className="w-full px-5 py-3.5 rounded-[10px] bg-slate-50 border border-slate-100 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-300 uppercase"
                  />
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Professional Email</label>
                <input 
                  type="email" 
                  placeholder="NAME@COMPANY.COM"
                  className="w-full px-5 py-3.5 rounded-[10px] bg-slate-50 border border-slate-100 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-300 uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Secure Key</label>
                  {isLogin && <a href="#" className="text-[9px] font-black text-blue-600 uppercase hover:underline underline-offset-2">Recover?</a>}
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 rounded-[10px] bg-slate-50 border border-slate-100 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-300"
                />
              </div>

              <button className="w-full bg-blue-600 text-white font-black text-[11px] uppercase py-4.5 rounded-[10px] shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-transform mt-4 tracking-[0.15em]">
                {isLogin ? 'Authenticate →' : 'Begin Networking →'}
              </button>
            </form>

            <div className="my-10 flex items-center gap-4 text-center">
              <div className="h-px flex-1 bg-slate-100"></div>
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] whitespace-nowrap">Provision via SSO</span>
              <div className="h-px flex-1 bg-slate-100"></div>
            </div>

            <button className="w-full bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase py-4 rounded-[10px] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm group">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2。18C1。43 8。55 1 10。２２ 1 １２s。4３ ３。４５ １。１８ ４。９３l２。８５-２。２２。８１-.６２z" fill="#FBBC05"/>
                <path d="M1２ ５。３８c１。６２ ０ ３。０６。５６ ４。２１ １。６４l３。１５-３。１５C１７。４５ ２。０９ １４。９７ １ １２ １ ７。７ １ ３。９９ ３。４７ ２。１８ ７。０７l３。６６ ２。８４c。
８７-.６０ ３。３０-２。２４ ６。１６-２。２４z" fill="#EA4335"/>
              </svg>
              <span className="group-hover:underline">Continue with Google</span>
            </button>
          </div>

          <p className="text-center mt-8 text-[11px] font-black text-slate-400 uppercase tracking-tight">
            {isLogin ? "No infrastructure slot?" : "Existing provider?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-blue-600 hover:underline decoration-2 underline-offset-4"
            >
              {isLogin ? 'Request Slot' : 'Authenticate'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}


export default Auth


