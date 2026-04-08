import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Shield,
  ShieldAlert,
  ShieldX,
  Loader2,
  Hexagon,
} from "lucide-react";

const VerifyPage = () => {
  const [credentialId, setCredentialId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!credentialId.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Navigate to the credential page which handles the actual verification
      navigate(`/credential/${credentialId.trim()}`);
    } catch (err) {
      setError("An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto text-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 sm:px-6 lg:px-8">
      <div className="mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-slate-900 border border-emerald-500/30 p-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <Shield size={48} className="text-emerald-400" />
            </div>
          </div>
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
          Verify a Credential
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Enter a credential ID to instantly verify its authenticity on the
          Ethereum blockchain.
        </p>
      </div>

      <div className="bg-slate-900/50 p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm mb-16 relative overflow-hidden text-left">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-80"></div>
        <div className="grid grid-cols-1 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-5">
              <Hexagon size={14} /> Verifier Portal
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Public Verification With layered Trust 
            </h3>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              Check whether the record exists on-chain, whether the database matches the
              blockchain, and whether the credential has been altered after
              issuance.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-4xl">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <Shield className="text-emerald-400 mt-1 shrink-0" size={20} />
                <div>
                  <h4 className="text-slate-200 font-medium mb-1">
                    Verified on Chain
                  </h4>
                  <p className="text-slate-500 text-sm">
                    The stored hash matches the blockchain record.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <ShieldX className="text-red-400 mt-1 shrink-0" size={20} />
                <div>
                  <h4 className="text-slate-200 font-medium mb-1">
                    Tampered or Missing
                  </h4>
                  <p className="text-slate-500 text-sm">
                    The record is missing on-chain or no longer matches.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 md:p-6 my-10">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <ShieldAlert size={18} className="text-emerald-400" />{" "}
              Verification States
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <span className="text-emerald-300 font-medium">Verified</span>
                <span className="text-emerald-200">
                  On-chain hash matches DB
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                <span className="text-amber-300 font-medium">Not on Chain</span>
                <span className="text-amber-200">
                  Record exists in DB, not found on-chain
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <span className="text-red-300 font-medium">Tampered</span>
                <span className="text-red-200">Hashes do not match</span>
              </div>
              <div className="flex items-center justify-between gap-4 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3">
                <span className="text-slate-300 font-medium">Not Found</span>
                <span className="text-slate-400">
                  No DB record for the credential ID
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-800 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-50"></div>

        <form onSubmit={handleVerify} className="relative max-w-2xl mx-auto">
          <div className="relative flex items-center group">
            <div className="absolute inset-0 bg-linear-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative flex items-center w-full bg-slate-950 border border-slate-700 rounded-2xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all shadow-inner">
              <div className="pl-6 pr-3 flex items-center justify-center">
                <Search
                  className="text-slate-500 group-focus-within:text-emerald-400 transition-colors"
                  size={24}
                />
              </div>
              <input
                type="text"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="Paste Credential ID here..."
                className="w-full py-5 text-lg bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none"
                required
              />
              <div className="pr-3 pl-2">
                <button
                  type="submit"
                  disabled={loading || !credentialId.trim()}
                  className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-500/30"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </div>
          </div>
          {error && (
            <p className="text-red-400 mt-4 text-left flex items-center gap-2">
              <ShieldAlert size={16} /> {error}
            </p>
          )}
        </form>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 text-left max-w-6xl mx-auto">
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Shield size={24} />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">Authentic</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              The credential exists on the blockchain and the cryptographic hash
              matches perfectly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-amber-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-colors"></div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <Hexagon size={24} />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">Not on Chain</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              The database has a record, but the blockchain has no matching
              issuance for this credential ID.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-red-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-red-500/10 transition-colors"></div>
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4 border border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">Tampered</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              The data has been altered since issuance. The hashes do not match
              the blockchain record.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-amber-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-colors"></div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <ShieldX size={24} />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">Not Found</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              The credential ID does not exist in our decentralized registry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
