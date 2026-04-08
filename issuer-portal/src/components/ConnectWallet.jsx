import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { Wallet, AlertCircle, ChevronDown, LogOut } from "lucide-react";

const ConnectWallet = ({ onConnect, onDisconnect }) => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [network, setNetwork] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    checkIfWalletIsConnected();

    if (!window.ethereum) {
      return undefined;
    }

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        handleDisconnect();
        return;
      }

      setAccount(accounts[0]);
      onConnect(accounts[0]);
      getNetwork();
    };

    const handleChainChanged = () => {
      getNetwork();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        onConnect(accounts[0]);
        getNetwork();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getNetwork = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    setNetwork(network.name);
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError(
          "MetaMask is not installed. Please install it to use this app.",
        );
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      onConnect(accounts[0]);
      getNetwork();
      setError(null);
    } catch (err) {
      setError("User rejected connection or an error occurred.");
    }
  };

  const handleDisconnect = () => {
    setAccount(null);
    setNetwork(null);
    setError(null);
    setMenuOpen(false);
    onDisconnect?.();
  };

  if (!window.ethereum) {
    return (
      <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl backdrop-blur-sm">
        <AlertCircle size={18} />
        <span className="text-sm">
          MetaMask not installed.{" "}
          <a
            href="https://metamask.io"
            target="_blank"
            rel="noreferrer"
            className="underline font-bold hover:text-amber-300"
          >
            Install here
          </a>
        </span>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="flex flex-col items-end relative">
      {account ? (
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-slate-200 px-4 py-2.5 rounded-xl backdrop-blur-md transition-all group shadow-lg">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 blur-sm opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative bg-slate-900 p-1.5 rounded-lg border border-slate-700">
              <Wallet size={16} className="text-green-400" />
            </div>
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="font-mono text-sm font-medium truncate max-w-35">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            {network && (
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                {network}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-900/80 transition-colors"
            aria-label="Wallet menu"
            title="Wallet menu"
          >
            <ChevronDown
              size={14}
              className={`text-slate-500 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div className="absolute top-full mt-2 right-0 w-44 rounded-xl border border-slate-700 bg-slate-950/95 backdrop-blur-md shadow-2xl overflow-hidden z-20">
              <button
                type="button"
                onClick={handleDisconnect}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <LogOut size={14} className="text-red-300" />
                Disconnect
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="relative group overflow-hidden rounded-xl p-px"
        >
          <span className="absolute inset-0 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
          <div className="relative flex items-center gap-2 bg-slate-900 px-6 py-2.5 rounded-xl transition-all group-hover:bg-slate-900/80">
            <Wallet size={18} className="text-blue-400" />
            <span className="font-medium text-slate-200">Connect Wallet</span>
          </div>
        </button>
      )}
      {error && (
        <p className="absolute top-full mt-2 right-0 text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
};

export default ConnectWallet;
