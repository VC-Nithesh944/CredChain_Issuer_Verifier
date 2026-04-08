import React, { useState, useEffect } from "react";
import {
  Award,
  Users,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Database,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) {
      setCount(end);
      return;
    }

    let totalDuration = 1500;
    let incrementTime = totalDuration / end;

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      className="bg-slate-900/50 p-6 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-sm flex items-center gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-hidden group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${colorClass
          .split(" ")[0]
          .replace("text-", "bg-")}`}
      ></div>
      <div
        className={`p-4 rounded-xl bg-slate-800/80 border border-slate-700 shadow-inner ${colorClass}`}
      >
        <Icon size={28} />
      </div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">
          {count}
        </h3>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    uniqueIssuers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-slate-900/50 p-6 rounded-2xl shadow-xl border border-slate-800 h-32 animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Credentials"
          value={stats.total}
          icon={Award}
          colorClass="text-blue-400"
          delay={0}
        />
        <StatCard
          title="Issued This Week"
          value={stats.thisWeek}
          icon={Calendar}
          colorClass="text-indigo-400"
          delay={100}
        />
        <StatCard
          title="Active Issuers"
          value={stats.uniqueIssuers}
          icon={Users}
          colorClass="text-purple-400"
          delay={200}
        />
      </div>

      <div className="bg-slate-900/50 p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-800 backdrop-blur-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Zap size={14} className="fill-blue-400" /> Issuer Portal v2.0
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            Secure, Verifiable Credentials on the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Blockchain
            </span>
          </h2>

          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            This portal allows authorized institutions to issue verifiable
            credentials anchored on the Ethereum blockchain. All credentials are
            cryptographically hashed and stored on IPFS, ensuring immutability,
            privacy, and global verifiability.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <ShieldCheck className="text-green-400 mt-1 shrink-0" size={20} />
              <div>
                <h4 className="text-slate-200 font-medium mb-1">
                  Cryptographic Proof
                </h4>
                <p className="text-slate-500 text-sm">
                  Every credential is signed and anchored to a smart contract.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <Database className="text-blue-400 mt-1 shrink-0" size={20} />
              <div>
                <h4 className="text-slate-200 font-medium mb-1">
                  Decentralized Storage
                </h4>
                <p className="text-slate-500 text-sm">
                  Metadata is securely hosted on the IPFS network.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/issue"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] border border-blue-500/30 flex items-center gap-2 group"
            >
              Issue New Credential
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              to="/list"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3.5 rounded-xl font-medium transition-all border border-slate-700 hover:border-slate-600 flex items-center gap-2"
            >
              View History
            </Link>
            <Link
              to="/admin"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3.5 rounded-xl font-medium transition-all border border-slate-700 hover:border-slate-600 flex items-center gap-2"
            >
              Manage Issuers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
