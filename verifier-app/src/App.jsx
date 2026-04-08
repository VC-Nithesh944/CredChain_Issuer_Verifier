import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import VerifyPage from './components/VerifyPage';
import CredentialCard from './components/CredentialCard';
import PublicDashboard from './components/PublicDashboard';
import { Hexagon } from 'lucide-react';

function App() {
  const location = useLocation();

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${isActive ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-900/10 blur-[120px] pointer-events-none"></div>

      <header className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10">
              <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-2 rounded-xl shadow-lg border border-emerald-400/30">
                <Hexagon size={24} className="animate-[spin_10s_linear_infinite]" />
              </div>
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">Certi<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Chain</span> <span className="text-slate-500 font-normal text-lg ml-1">Verifier</span></span>
          </Link>
          
          <nav className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
            <NavLink to="/">Verify</NavLink>
            <NavLink to="/network">Network Stats</NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
        <Routes>
          <Route path="/" element={<VerifyPage />} />
          <Route path="/credential/:id" element={<CredentialCard />} />
          <Route path="/network" element={<PublicDashboard />} />
        </Routes>
      </main>

      <footer className="bg-slate-900/50 border-t border-slate-800 py-8 mt-auto backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} CertiChain Decentralized Registry. All rights reserved.</p>
          <p className="mt-2 text-slate-600 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Powered by Ethereum & IPFS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
