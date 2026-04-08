import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { Shield, ShieldCheck, ShieldX, Loader2, UserCog } from "lucide-react";

const IssuerAdmin = ({ account }) => {
  const [contractConfig, setContractConfig] = useState(null);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [isTargetRegistered, setIsTargetRegistered] = useState(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config");
        if (!response.ok) {
          throw new Error("Unable to load contract config");
        }
        const config = await response.json();
        setContractConfig(config);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load contract configuration");
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchOwner = async () => {
      if (!contractConfig || !window.ethereum) {
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          contractConfig.address,
          contractConfig.abi,
          provider,
        );
        const owner = await contract.owner();
        setOwnerAddress(owner);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch contract owner");
      }
    };

    fetchOwner();
  }, [contractConfig]);

  const isOwner = Boolean(
    account &&
      ownerAddress &&
      account.toLowerCase() === ownerAddress.toLowerCase(),
  );

  const parseError = (error) => {
    const message =
      error?.reason ||
      error?.shortMessage ||
      error?.message ||
      "Transaction failed";
    return message.replace("execution reverted: ", "");
  };

  const checkIssuerStatus = async () => {
    if (!contractConfig) {
      toast.error("Contract configuration not loaded yet");
      return;
    }

    if (!ethers.isAddress(targetAddress)) {
      toast.error("Enter a valid wallet address");
      return;
    }

    setChecking(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        provider,
      );
      const isRegistered = await contract.registeredIssuers(targetAddress);
      setIsTargetRegistered(isRegistered);
    } catch (error) {
      console.error(error);
      toast.error(parseError(error));
    } finally {
      setChecking(false);
    }
  };

  const updateIssuer = async (action) => {
    if (!contractConfig) {
      toast.error("Contract configuration not loaded yet");
      return;
    }

    if (!window.ethereum || !account) {
      toast.error("Connect MetaMask first");
      return;
    }

    if (!isOwner) {
      toast.error("Only contract owner can manage issuers");
      return;
    }

    if (!ethers.isAddress(targetAddress)) {
      toast.error("Enter a valid wallet address");
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        signer,
      );

      const tx =
        action === "register"
          ? await contract.registerIssuer(targetAddress)
          : await contract.unregisterIssuer(targetAddress);

      toast.info("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      toast.success(
        `Issuer ${
          action === "register" ? "registered" : "revoked"
        } successfully`,
      );
      await checkIssuerStatus();
    } catch (error) {
      console.error(error);
      toast.error(parseError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <UserCog className="text-blue-400" />
          Issuer Management
        </h2>

        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
              Connected Wallet
            </p>
            <p className="font-mono text-sm text-slate-200 break-all">
              {account || "Not connected"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
              Contract Owner
            </p>
            <p className="font-mono text-sm text-slate-200 break-all">
              {ownerAddress || "Loading..."}
            </p>
          </div>

          {ownerAddress && (
            <div
              className={`p-4 rounded-xl border ${
                isOwner
                  ? "bg-green-500/10 border-green-500/20 text-green-300"
                  : "bg-red-500/10 border-red-500/20 text-red-300"
              }`}
            >
              {isOwner ? (
                <div className="space-y-1">
                  <p className="font-medium">Admin access granted.</p>
                  <p className="text-sm text-green-200/90">
                    This wallet is the contract owner and can approve or revoke
                    issuers.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium">
                    Admin access denied for this wallet.
                  </p>
                  <p className="text-sm text-red-200/90">
                    Only the contract owner can manage issuers. Connect the
                    owner wallet to register or revoke issuer access.
                  </p>
                </div>
              )}
            </div>
          )}

          {!ownerAddress && (
            <div className="p-4 rounded-xl border bg-slate-800/70 border-slate-700 text-slate-300">
              Loading contract ownership... issuer management remains disabled
              until the owner is known.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Issuer Wallet Address
            </label>
            <input
              type="text"
              value={targetAddress}
              onChange={(e) => {
                setTargetAddress(e.target.value.trim());
                setIsTargetRegistered(null);
              }}
              placeholder="0x..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={checkIssuerStatus}
              disabled={checking || !targetAddress || !window.ethereum}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {checking ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Shield size={16} />
              )}
              Check Status
            </button>

            <button
              onClick={() => updateIssuer("register")}
              disabled={loading || !isOwner || !targetAddress}
              className="px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white border border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title={
                isOwner
                  ? "Register issuer"
                  : "Only the contract owner can register issuers"
              }
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <ShieldCheck size={16} />
              )}
              Register Issuer
            </button>

            <button
              onClick={() => updateIssuer("revoke")}
              disabled={loading || !isOwner || !targetAddress}
              className="px-4 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title={
                isOwner
                  ? "Revoke issuer"
                  : "Only the contract owner can revoke issuers"
              }
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <ShieldX size={16} />
              )}
              Revoke Issuer
            </button>
          </div>

          {isTargetRegistered !== null && (
            <div
              className={`p-4 rounded-xl border ${
                isTargetRegistered
                  ? "bg-green-500/10 border-green-500/20 text-green-300"
                  : "bg-slate-800/70 border-slate-700 text-slate-300"
              }`}
            >
              Address status:{" "}
              {isTargetRegistered ? "Registered issuer" : "Not registered"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssuerAdmin;
