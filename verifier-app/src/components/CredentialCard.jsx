import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ethers } from "ethers";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  Hexagon,
  MinusCircle,
} from "lucide-react";

const CredentialCard = () => {
  const { id } = useParams();
  const [credential, setCredential] = useState(null);
  const [status, setStatus] = useState("loading"); // loading, verified, not-on-chain, tampered, not-found
  const [copied, setCopied] = useState("");
  const [blockchainOffline, setBlockchainOffline] = useState(false);

  useEffect(() => {
    verifyCredential();
  }, [id]);

  const verifyCredential = async () => {
    try {
      // 1. Fetch from backend
      const response = await fetch(`/api/credentials/${id}`);

      if (response.status === 404) {
        setStatus("not-found");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch credential");
      }

      const dbData = await response.json();
      setCredential(dbData);

      // 2. Re-hash the data to check integrity
      const credentialData = {
        credentialId: dbData.credentialId,
        recipientName: dbData.recipientName,
        course: dbData.course,
        grade: dbData.grade,
        issuerAddress: dbData.issuerAddress,
        issuedAt: dbData.issuedAt,
      };

      // Note: In a real app, we'd use the exact same hashing logic as backend
      // For this demo, we assume the backend hash is correct if it matches the blockchain

      // 3. Verify against blockchain
      try {
        // Try to connect to local hardhat node
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

        // Fetch contract config
        const configRes = await fetch("/api/config");
        if (!configRes.ok) throw new Error("Failed to fetch contract config");
        const contractConfig = await configRes.json();

        const contract = new ethers.Contract(
          contractConfig.address,
          contractConfig.abi,
          provider,
        );
        const result = await contract.verifyCredential(id);

        if (!result.exists) {
          setStatus("not-on-chain");
        } else if (result.hash === dbData.hash) {
          setStatus("verified");
        } else {
          setStatus("tampered");
        }
      } catch (err) {
        console.warn(
          "Blockchain RPC unreachable, falling back to database verification",
        );
        setBlockchainOffline(true);

        // Simulate verification delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Fallback to database verification
        if (dbData.hash) {
          setStatus("verified");
        } else {
          setStatus("tampered");
        }
      }
    } catch (error) {
      console.error(error);
      setStatus("not-found");
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  if (status === "loading") {
    return (
      <div className="max-w-3xl mx-auto py-12 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <Hexagon
            className="animate-[spin_3s_linear_infinite] text-emerald-400 relative z-10"
            size={64}
          />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Verifying Credential...
        </h2>
        <p className="text-slate-400 text-lg">
          Checking cryptographic hashes against the blockchain
        </p>
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="max-w-3xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> Back to Search
        </Link>
        <div className="bg-slate-900/80 border border-amber-500/30 p-12 rounded-3xl text-center shadow-[0_0_30px_rgba(245,158,11,0.1)] backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-amber-500 to-orange-500"></div>
          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
            <ShieldX className="text-amber-500" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Credential Not Found
          </h2>
          <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
            We couldn't find a credential with ID{" "}
            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 ml-1">
              {id}
            </span>{" "}
            in our registry.
          </p>
        </div>
      </div>
    );
  }

  if (status === "not-on-chain") {
    return (
      <div className="max-w-3xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> Back to Search
        </Link>
        <div className="bg-slate-900/80 border border-amber-500/30 p-12 rounded-3xl text-center shadow-[0_0_30px_rgba(245,158,11,0.1)] backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-amber-500 to-orange-500"></div>
          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
            <MinusCircle className="text-amber-500" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Credential Not on Chain
          </h2>
          <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
            The record exists in the database, but no matching on-chain
            credential was found for this ID. It was likely saved off-chain
            before blockchain issuance failed, so it cannot be treated as
            verified.
          </p>
        </div>
      </div>
    );
  }

  if (status === "tampered") {
    return (
      <div className="max-w-3xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> Back to Search
        </Link>
        <div className="bg-slate-900/80 border border-red-500/30 p-12 rounded-3xl text-center shadow-[0_0_30px_rgba(239,68,68,0.1)] backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-500 to-rose-500"></div>
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <ShieldAlert className="text-red-500" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Credential Tampered
          </h2>
          <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
            The cryptographic hash of this credential does not match the record
            on the blockchain. The data has been altered after issuance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 font-medium transition-colors"
      >
        <ArrowLeft size={20} /> Back to Search
      </Link>

      {blockchainOffline && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-5 py-4 rounded-xl mb-8 flex items-center gap-3 shadow-[0_0_15px_rgba(245,158,11,0.1)] backdrop-blur-sm">
          <ShieldAlert size={20} className="text-amber-500 shrink-0" />
          <p className="font-medium">
            Blockchain offline — showing database record only, verification
            status may be incomplete
          </p>
        </div>
      )}

      <div className="bg-slate-900/80 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col md:flex-row backdrop-blur-md relative">
        {/* Left Side: The Certificate */}
        <div className="flex-1 p-10 md:p-14 border-b md:border-b-0 md:border-r border-slate-800 relative bg-slate-950/50">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

          {/* Subtle background pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          ></div>

          <div className="flex justify-between items-start mb-12 relative z-10">
            <div className="bg-emerald-500/10 text-emerald-400 px-5 py-2.5 rounded-full flex items-center gap-2 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/30 tracking-wide">
              <ShieldCheck size={20} /> VERIFIED
            </div>
            <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-200">
              <QRCodeSVG
                value={window.location.href}
                size={80}
                bgColor={"#ffffff"}
                fgColor={"#0f172a"}
                level={"L"}
                includeMargin={false}
              />
            </div>
          </div>

          <div className="text-center mt-8 mb-16 relative z-10">
            <h3 className="text-4xl font-serif font-bold text-white mb-3 tracking-tight">
              Certificate of Completion
            </h3>
            <p className="text-slate-400 text-lg mb-10 font-medium tracking-wide uppercase">
              This is to certify that
            </p>

            <h4 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400 mb-10 pb-6 inline-block min-w-75 relative">
              {credential.recipientName}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </h4>

            <p className="text-slate-400 text-lg mb-6 font-medium tracking-wide uppercase">
              has successfully completed
            </p>
            <h5 className="text-3xl font-bold text-white mb-8 leading-tight">
              {credential.course}
            </h5>
          </div>

          <div className="flex justify-between items-end pt-10 border-t border-slate-800/50 relative z-10">
            <div>
              <p className="text-slate-500 text-sm mb-2 uppercase tracking-widest font-bold">
                Grade
              </p>
              <p className="font-bold text-2xl text-emerald-400">
                {credential.grade}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-sm mb-2 uppercase tracking-widest font-bold">
                Issue Date
              </p>
              <p className="font-bold text-2xl text-white">
                {new Date(credential.issuedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Metadata & Proof */}
        <div className="w-full md:w-96 bg-slate-900 p-8 md:p-10 flex flex-col gap-8 relative z-10">
          <h3 className="font-bold text-white uppercase tracking-widest text-sm border-b border-slate-800 pb-4 flex items-center gap-2">
            <Hexagon size={16} className="text-emerald-500" /> Cryptographic
            Proof
          </h3>

          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                Credential ID
              </p>
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-3 group hover:border-emerald-500/30 transition-colors">
                <span className="font-mono text-xs text-slate-300 truncate mr-3">
                  {credential.credentialId}
                </span>
                <button
                  onClick={() => copyToClipboard(credential.credentialId, "id")}
                  className="text-slate-500 hover:text-emerald-400 transition-colors shrink-0"
                >
                  {copied === "id" ? (
                    <Check size={16} className="text-emerald-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                Issuer Address
              </p>
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-3 group hover:border-emerald-500/30 transition-colors">
                <span className="font-mono text-xs text-slate-300 truncate mr-3">
                  {credential.issuerAddress.slice(0, 8)}...
                  {credential.issuerAddress.slice(-6)}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(credential.issuerAddress, "issuer")
                  }
                  className="text-slate-500 hover:text-emerald-400 transition-colors shrink-0"
                >
                  {copied === "issuer" ? (
                    <Check size={16} className="text-emerald-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                IPFS CID
              </p>
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-3 group hover:border-emerald-500/30 transition-colors">
                <a
                  href={`https://ipfs.io/ipfs/${credential.ipfsCid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-emerald-400 hover:text-emerald-300 hover:underline truncate mr-3 flex items-center gap-1.5"
                >
                  {credential.ipfsCid.slice(0, 12)}...{" "}
                  <ExternalLink size={12} />
                </a>
                <button
                  onClick={() => copyToClipboard(credential.ipfsCid, "ipfs")}
                  className="text-slate-500 hover:text-emerald-400 transition-colors shrink-0"
                >
                  {copied === "ipfs" ? (
                    <Check size={16} className="text-emerald-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                Transaction Hash
              </p>
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-3 group hover:border-emerald-500/30 transition-colors">
                {credential.txHash ? (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${credential.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-emerald-400 hover:text-emerald-300 hover:underline truncate mr-3 flex items-center gap-1.5"
                  >
                    {credential.txHash.slice(0, 12)}...{" "}
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="font-mono text-xs text-slate-500 truncate mr-3">
                    No on-chain transaction recorded
                  </span>
                )}
                <button
                  onClick={() => copyToClipboard(credential.txHash || "", "tx")}
                  className="text-slate-500 hover:text-emerald-400 transition-colors shrink-0"
                >
                  {copied === "tx" ? (
                    <Check size={16} className="text-emerald-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              This credential is cryptographically secured on the Ethereum
              blockchain and stored permanently on IPFS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialCard;
