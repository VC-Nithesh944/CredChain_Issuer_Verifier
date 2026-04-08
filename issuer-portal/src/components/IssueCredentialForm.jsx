import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import {
  CheckCircle,
  Loader2,
  ExternalLink,
  Shield,
  FileText,
  Award,
  AlertTriangle,
} from "lucide-react";

const IssueCredentialForm = ({ account }) => {
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    course: "",
    grade: "",
    issueDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: input, 1: uploading, 2: signing, 3: success
  const [result, setResult] = useState(null);
  const [contractConfig, setContractConfig] = useState(null);
  const [partialFailure, setPartialFailure] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config");
        if (response.ok) {
          const config = await response.json();
          setContractConfig(config);
        } else {
          console.error("Failed to fetch contract config");
        }
      } catch (error) {
        console.error("Error fetching contract config:", error);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getReadableTxError = (error) => {
    const raw =
      error?.reason ||
      error?.shortMessage ||
      error?.message ||
      "Transaction failed";
    if (raw.includes("Only registered issuers can call this")) {
      return "Authorization failed: connected wallet is not a registered issuer.";
    }
    if (raw.includes("user rejected") || raw.includes("User denied")) {
      return "Transaction was rejected in wallet.";
    }
    return raw.replace("execution reverted: ", "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!contractConfig) {
      toast.error("Contract configuration not loaded yet. Please try again.");
      return;
    }

    setLoading(true);
    setStep(1);
    setPartialFailure(null);

    try {
      // 1. Send to backend to hash and upload to IPFS
      const response = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          issuerAddress: account,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save credential to backend");
      }

      const data = await response.json();
      const { credentialId, hash, ipfsCid } = data;

      setStep(2);

      // 2. Sign transaction on blockchain
      let txHash = null;
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractConfig.address,
          contractConfig.abi,
          signer,
        );

        try {
          const tx = await contract.issueCredential(
            credentialId,
            hash,
            ipfsCid,
          );
          toast.info("Transaction submitted. Waiting for confirmation...");
          const receipt = await tx.wait();
          txHash = receipt.hash;
        } catch (txError) {
          const userMessage = getReadableTxError(txError);
          setPartialFailure({
            credentialId,
            message: userMessage,
          });
          throw new Error(
            `Blockchain step failed after database save. Credential ID: ${credentialId}. ${userMessage}`,
          );
        }
      } else {
        toast.warning("Demo Mode: Blockchain signing disabled");
        txHash = `0xmock${Math.random().toString(16).substring(2)}`;
      }

      setStep(3);
      setResult({ credentialId, hash, ipfsCid, txHash });
      toast.success("Credential issued successfully!");

      // Reset form
      setFormData({
        recipientName: "",
        recipientEmail: "",
        course: "",
        grade: "",
        issueDate: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred");
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <Shield className="text-blue-400" />
          Issue New Credential
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Recipient Name
            </label>
            <input
              type="text"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleChange}
              required
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Satoshi Nakamoto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Recipient Email
            </label>
            <input
              type="email"
              name="recipientEmail"
              value={formData.recipientEmail}
              onChange={handleChange}
              required
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              placeholder="satoshi@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Course / Degree Title
            </label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              placeholder="Master of Blockchain Engineering"
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Grade / Score
              </label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="A+ / 4.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Issue Date
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                required
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !account}
            className={`w-full py-3.5 rounded-xl text-white font-medium flex justify-center items-center gap-2 transition-all mt-4 ${
              loading || !account
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] border border-blue-500/30"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Shield size={18} /> Issue on Blockchain
              </>
            )}
          </button>
        </form>

        {step > 0 && step < 3 && (
          <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 backdrop-blur-sm">
            <h3 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} /> Processing
              Transaction
            </h3>
            <div className="space-y-3 text-sm">
              <div
                className={`flex items-center gap-3 ${
                  step >= 1 ? "text-blue-300" : "text-slate-500"
                }`}
              >
                {step === 1 ? (
                  <Loader2 className="animate-spin text-blue-400" size={16} />
                ) : (
                  <CheckCircle className="text-green-400" size={16} />
                )}
                <span>Uploading to IPFS & Saving to Database</span>
              </div>
              <div
                className={`flex items-center gap-3 ${
                  step >= 2 ? "text-blue-300" : "text-slate-500"
                }`}
              >
                {step === 2 ? (
                  <Loader2 className="animate-spin text-blue-400" size={16} />
                ) : step > 2 ? (
                  <CheckCircle className="text-green-400" size={16} />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                )}
                <span>Signing Transaction on Blockchain</span>
              </div>
            </div>
          </div>
        )}

        {partialFailure && (
          <div className="mt-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 backdrop-blur-sm">
            <h3 className="font-medium text-amber-400 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} /> Partial Failure
            </h3>
            <p className="text-sm text-amber-200 leading-relaxed">
              Credential was saved to database, but blockchain issuance did not
              complete. This record will not verify as authentic until issuance
              succeeds on-chain.
            </p>
            <p className="text-xs text-amber-300/90 mt-2 font-mono break-all">
              Credential ID: {partialFailure.credentialId}
            </p>
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-800 backdrop-blur-sm flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <FileText className="text-indigo-400" />
          Live Preview
        </h2>

        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="w-full max-w-md bg-slate-800/80 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden relative backdrop-blur-md transform transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(37,99,235,0.15)]">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 w-full"></div>
            <div className="p-8 text-center relative">
              <div className="absolute top-4 right-4 opacity-10">
                <Award size={100} />
              </div>
              <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Award size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">
                Certificate of Completion
              </h3>
              <p className="text-slate-400 text-sm mb-8 uppercase tracking-widest">
                This is to certify that
              </p>

              <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-8 border-b border-slate-700 pb-4 inline-block min-w-[250px]">
                {formData.recipientName || "Student Name"}
              </h4>

              <p className="text-slate-400 mb-2">has successfully completed</p>
              <h5 className="text-xl font-semibold text-slate-200 mb-8">
                {formData.course || "Course Title"}
              </h5>

              <div className="flex justify-between items-end mt-8 pt-6 border-t border-slate-700/50 text-sm">
                <div className="text-left">
                  <p className="text-slate-500 mb-1 uppercase tracking-wider text-xs">
                    Grade
                  </p>
                  <p className="font-bold text-slate-200 text-lg">
                    {formData.grade || "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 mb-1 uppercase tracking-wider text-xs">
                    Date
                  </p>
                  <p className="font-bold text-slate-200 text-lg">
                    {formData.issueDate || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-8 p-5 bg-green-500/10 border border-green-500/20 rounded-xl text-sm backdrop-blur-sm relative z-10 animate-in fade-in slide-in-from-bottom-2">
            <h4 className="font-bold text-green-400 mb-3 flex items-center gap-2 text-base">
              <CheckCircle size={18} /> Success!
            </h4>
            <div className="space-y-2 text-slate-300">
              <p className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                <span className="font-medium text-slate-400">ID:</span>
                <span className="font-mono text-xs">{result.credentialId}</span>
              </p>
              <p className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                <span className="font-medium text-slate-400">IPFS:</span>
                <a
                  href={`https://ipfs.io/ipfs/${result.ipfsCid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1 transition-colors"
                >
                  {result.ipfsCid.substring(0, 14)}...{" "}
                  <ExternalLink size={12} />
                </a>
              </p>
              <p className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                <span className="font-medium text-slate-400">Tx:</span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1 transition-colors"
                >
                  {result.txHash.substring(0, 14)}... <ExternalLink size={12} />
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCredentialForm;
