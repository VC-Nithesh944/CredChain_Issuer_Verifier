import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConnectWallet from "./components/ConnectWallet";
import Dashboard from "./components/Dashboard";
import IssueCredentialForm from "./components/IssueCredentialForm";
import CredentialList from "./components/CredentialList";
import IssuerAdmin from "./components/IssuerAdmin";
import {
  Hexagon,
  LayoutDashboard,
  PlusCircle,
  List,
  UserCog,
} from "lucide-react";

function App() {
  const [account, setAccount] = useState(null);
  const location = useLocation();

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
          isActive
            ? "bg-blue-600/20 text-blue-400 font-medium shadow-[0_0_15px_rgba(37,99,235,0.2)]"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        }`}
      >
        <Icon size={18} />
        {children}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none"></div>

      {!window.ethereum && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-400 px-4 py-2 text-center text-sm font-medium backdrop-blur-sm z-20">
          Demo Mode — Blockchain signing disabled. Install MetaMask for full
          functionality.
        </div>
      )}

      <header className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 rounded-xl shadow-lg border border-blue-400/30">
                <Hexagon
                  size={24}
                  className="animate-[spin_10s_linear_infinite]"
                />
              </div>
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">
              Certi
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Chain
              </span>{" "}
              <span className="text-slate-500 font-normal text-lg ml-1">
                Issuer
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
            <NavLink to="/" icon={LayoutDashboard}>
              Dashboard
            </NavLink>
            <NavLink to="/issue" icon={PlusCircle}>
              Issue
            </NavLink>
            <NavLink to="/list" icon={List}>
              History
            </NavLink>
            <NavLink to="/admin" icon={UserCog}>
              Admin
            </NavLink>
          </nav>

          <ConnectWallet onConnect={setAccount} />
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/issue"
            element={<IssueCredentialForm account={account} />}
          />
          <Route path="/list" element={<CredentialList account={account} />} />
          <Route path="/admin" element={<IssuerAdmin account={account} />} />
        </Routes>
      </main>

      <ToastContainer
        position="bottom-right"
        theme="dark"
        toastClassName="bg-slate-900 border border-slate-800 text-slate-200"
      />
    </div>
  );
}

export default App;
