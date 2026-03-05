import React from 'react'
import { Link } from 'react-router-dom'
import heroimg from './assets/hero.png'

const Home = () => {
  return (
    <div className="min-h-screen bg-[#f0f7ff] font-sans text-slate-900 relative overflow-hidden">
      {/* Subtle Diagonal Stripes Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 20px)` }}>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 h-20 flex items-center">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/10">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight">EventSync</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            {['Services', 'Contacts', 'About us', 'Our jobs'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link to="/auth" className="rounded-full border border-slate-200 bg-white/50 backdrop-blur px-6 py-2 text-[13px] font-bold text-slate-700 hover:bg-white transition-all flex items-center gap-2">
              Login <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-0 pb-12 lg:h-[calc(100vh-80px)] lg:flex lg:flex-col lg:justify-center">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative w-full">
          
          {/* Blue Connecting Line Effect (SVG) */}
          <svg className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 -z-10 pointer-events-none opacity-30" viewBox="0 0 1200 300" fill="none">
            <path d="M-50,150 C200,50 400,250 600,150 C800,50 1000,250 1250,150" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Content */}
            <div className="z-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-4 bg-white/50 backdrop-blur px-3 py-1 rounded-full border border-blue-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">v2.0 Event Infrastructure</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[4.2rem] font-black leading-[0.95] tracking-tight text-[#1e293b] uppercase mb-6">
                STRUCTURED <br />
                NETWORKING <span className="inline-block px-3 py-0.5 bg-[#fca311] text-white rounded-md -rotate-2 relative">
                  BEYOND
                  <span className="absolute top-0 right-[-8px] text-white text-lg">✦</span>
                </span> <br />
                THE ROOM.
              </h1>

              <p className="text-sm font-bold text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed mb-8 uppercase tracking-tight py-2 border-l-2 border-blue-500 pl-4">
                The lightweight directory for high-stakes events. <br/>
                No downloads. Just scanning, tagging, and <span className="text-blue-600">professional ROI</span>.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <button className="rounded-full bg-blue-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform flex items-center gap-2">
                  Host Free Event <span className="text-lg">→</span>
                </button>
                
                <button className="flex items-center gap-2 group">
                  <div className="h-10 w-10 rounded-full bg-[#fca311] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-600 border-b border-slate-200 uppercase tracking-tighter">View Demo</span>
                </button>
              </div>

              {/* Added mini-feature grid for "more content full" */}
              <div className="mt-10 grid grid-cols-2 gap-4 max-w-xs mx-auto lg:mx-0 border-t border-slate-200 pt-6">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">✓</div>
                  <span className="text-[9px] font-black uppercase text-slate-400">QR Join Flow</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">✓</div>
                  <span className="text-[9px] font-black uppercase text-slate-400">ROI Analytics</span>
                </div>
              </div>
            </div>

            {/* Right: Illustration & Floating Cards */}
            <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="relative w-full max-w-[280px] sm:max-w-md lg:max-w-lg">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl -z-10"></div>
                
                {/* Floating Card 1 */}
                <div className="absolute top-10 right-[-10px] z-30 bg-white p-2 rounded-lg shadow-lg border border-slate-50 flex items-center gap-2 animate-bounce-slow">
                  <div className="text-sm">🤝</div>
                  <div>
                    <p className="text-[9px] font-black text-slate-900 whitespace-nowrap">Event Verified</p>
                    <p className="text-[7px] text-slate-400 uppercase font-bold">ROI Dashboard Active</p>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute bottom-10 left-[-20px] z-30 bg-white p-2 rounded-lg shadow-lg border border-slate-50 flex items-center gap-2">
                  <div className="h-6 w-6 bg-blue-100 rounded text-blue-600 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-900 whitespace-nowrap">Skill Tagging</p>
                    <p className="text-[7px] text-blue-600 uppercase font-bold">Context Preserved</p>
                  </div>
                </div>

                <img 
                  src={heroimg} 
                  alt="EventSync App" 
                  className="w-full h-auto drop-shadow-xl relative z-10 max-h-[45vh] object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Card */}
   
      </main>

      {/* Dynamic Content Structure */}
      <section className="bg-white py-14 border-t border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f0f7ff] rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left: The Challenge */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full border border-rose-100 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                The Connection Gap
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-[#1e293b] leading-[0.9] uppercase tracking-tighter italic">
                WHY MOST <br /> EVENTS <span className="text-rose-500 underline decoration-rose-200">FAIL</span>.
              </h2>
              <div className="space-y-4 max-w-sm">
                {[
                  { label: "App Fatigue", desc: "Attendees refuse to download another one-time app." },
                  { label: "Data Black Hole", desc: "Organizers lose 90% of networking metadata." },
                  { label: "Lost Context", desc: "Connections die the moment the lanyard comes off." }
                ].map((item) => (
                  <div key={item.label} className="group border-l-2 border-slate-100 pl-4 hover:border-rose-400 transition-colors">
                    <p className="text-xs font-black text-slate-800 uppercase mb-1">{item.label}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase leading-tight tracking-tight">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: The Solution (Infrastructure Card) */}
            <div className="bg-[#1e293b] rounded-[2.5rem] p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase mb-6 leading-tight">
                  ENTERPRISE <br /> <span className="text-blue-500">NETWORKING</span> <br /> ENGINE.
                </h3>
                
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {[
                    "Private Skill-Tagged Directories",
                    "Real-time ROI Tracking Dashboard",
                    "Zero-friction QR Join Flow",
                    "API Integration for CRM Sync"
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-3">
                      <div className="h-5 w-5 bg-blue-500 rounded flex items-center justify-center text-[10px] font-bold">✓</div>
                      <span className="text-[10px] font-black uppercase tracking-tight text-slate-300">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Performance Status</p>
                      <p className="text-xs font-black text-blue-500 uppercase">Optimized v2.0</p>
                   </div>
                   <div className="text-[10px] font-black bg-blue-500 text-white px-3 py-1 rounded-md">
                      LOAD &lt; 2S
                   </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-slate-100 py-12 bg-[#f0f7ff]/30">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">EventSync Infrastructure</p>
          </div>
          <div className="flex gap-8">
            {['Twitter', 'GitHub', 'LinkedIn'].map(social => (
              <a key={social} href="#" className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">{social}</a>
            ))}
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© 2026 Structured Labs</p>
        </div>
      </footer>
    </div>
  )
}

export default Home

