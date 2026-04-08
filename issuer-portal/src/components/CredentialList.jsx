import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, Clock, FileText } from 'lucide-react';

const CredentialList = ({ account }) => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account) {
      fetchCredentials();
    } else {
      setLoading(false);
    }
  }, [account]);

  const fetchCredentials = async () => {
    try {
      const response = await fetch(`/api/credentials?issuer=${account}`);
      if (response.ok) {
        const data = await response.json();
        setCredentials(data);
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="bg-slate-900/50 p-12 rounded-2xl shadow-xl border border-slate-800 text-center backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
          <Clock className="text-slate-500" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h3>
        <p className="text-slate-400">Please connect your wallet to view your issued credentials history.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 rounded-2xl shadow-xl border border-slate-800 overflow-hidden backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="text-blue-400" />
          Issued Credentials
        </h2>
        <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.1)]">
          {credentials.length} Total
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs text-slate-300 uppercase bg-slate-800/50 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Recipient</th>
              <th className="px-6 py-4 font-semibold">Course</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Links</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse bg-slate-900/30">
                  <td className="px-6 py-5"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-800 rounded w-32"></div></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-800 rounded w-12 ml-auto"></div></td>
                </tr>
              ))
            ) : credentials.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileText size={32} className="text-slate-700 mb-3" />
                    <p>No credentials issued yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              credentials.map((cred) => (
                <tr key={cred.credentialId} className="bg-slate-900/20 hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-200">
                    {cred.recipientName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300">{cred.course}</span>
                    <div className="text-xs text-slate-500 mt-1 font-mono">Grade: {cred.grade}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(cred.issuedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full w-max shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                      <CheckCircle size={12} /> Verified
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <a href={`https://ipfs.io/ipfs/${cred.ipfsCid}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700" title="View on IPFS">
                        IPFS
                      </a>
                      <a href={`https://sepolia.etherscan.io/tx/${cred.txHash}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors p-1.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700" title="View Transaction">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CredentialList;
