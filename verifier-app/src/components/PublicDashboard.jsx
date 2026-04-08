import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  ShieldCheck,
  Activity,
  Hexagon,
  ArrowRight,
  Loader2,
} from "lucide-react";

const PublicDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    uniqueIssuers: 0,
  });
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, credentialsResponse] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/credentials"),
      ]);

      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data);
      }

      if (credentialsResponse.ok) {
        const credentials = await credentialsResponse.json();
        setRecentVerifications(credentials.slice(0, 5));
      } else {
        throw new Error("Failed to load recent credentials");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Unable to load live activity from the database.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return "recently";
    }

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60)
      return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  };

  return (
    <div className="max-w-5xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-slate-900/50 p-8 rounded-3xl shadow-lg border border-slate-800 text-center backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Globe size={32} />
          </div>
          <h3 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
            {stats.total}
          </h3>
          <p className="text-slate-400 font-medium uppercase tracking-wider text-sm">
            Credentials Secured
          </p>
        </div>

        <div className="bg-slate-900/50 p-8 rounded-3xl shadow-lg border border-slate-800 text-center backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
            {stats.uniqueIssuers}
          </h3>
          <p className="text-slate-400 font-medium uppercase tracking-wider text-sm">
            Verified Issuers
          </p>
        </div>

        <div className="bg-slate-900/50 p-8 rounded-3xl shadow-lg border border-slate-800 text-center backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors"></div>
          <div className="bg-purple-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <Activity size={32} />
          </div>
          <h3 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
            {stats.thisWeek}
          </h3>
          <p className="text-slate-400 font-medium uppercase tracking-wider text-sm">
            Issued This Week
          </p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-3xl shadow-xl border border-slate-800 overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8">
              <div className="absolute inset-0 bg-emerald-500 rounded-lg blur opacity-40 animate-pulse"></div>
              <Activity size={20} className="text-emerald-400 relative z-10" />
            </div>
            Live Verification Activity
          </h3>
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live
          </span>
        </div>
        <div className="divide-y divide-slate-800/50">
          {loading && (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-emerald-400" size={22} />
              <p>Loading live records from the database...</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-8 text-center text-red-300">{error}</div>
          )}

          {!loading && !error && recentVerifications.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No credential activity found yet.
            </div>
          )}

          {!loading &&
            !error &&
            recentVerifications.map((item) => (
              <Link
                key={item.credentialId}
                to={`/credential/${item.credentialId}`}
                className="p-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors group"
              >
                <div className="flex items-center gap-5 min-w-0">
                  <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] group-hover:bg-emerald-500/20 transition-colors shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white text-lg truncate">
                      {item.course}
                    </p>
                    <p className="text-sm text-slate-400 truncate">
                      {item.recipientName} · Grade {item.grade}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Hexagon size={12} className="text-slate-600" /> Verified{" "}
                      {formatTimeAgo(item.issuedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    Authentic
                  </span>
                  <ArrowRight
                    size={18}
                    className="text-slate-500 group-hover:text-emerald-400 transition-colors"
                  />
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;
