'use client';

import { useEffect, useState } from 'react';
import { IotaClient, getFullnodeUrl } from '@iota/iota-sdk/client';
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { Transaction } from '@iota/iota-sdk/transactions';

const PACKAGE_ID = '0x1349d25e9193ce1ccb0f3f58d8082a3986d376e72f6355be5ad22b684055d926';

type Grant = {
  id: string;
  student: string;
  amount: string;
  timestamp: string;
};

export default function Home() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentAddress, setStudentAddress] = useState('');
  const [grantAmount, setGrantAmount] = useState('');
  const [minting, setMinting] = useState(false);
  const [addressError, setAddressError] = useState('');
  
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  function validateAddress(address: string): boolean {
    // IOTA addresses should be 66 characters long and start with 0x
    const addressRegex = /^0x[a-fA-F0-9]{64}$/;
    return addressRegex.test(address);
  }

  function handleAddressChange(value: string) {
    setStudentAddress(value);
    if (value && !validateAddress(value)) {
      setAddressError('Invalid address format. Must be 66 characters starting with 0x');
    } else {
      setAddressError('');
    }
  }

  function useMyAddress() {
    if (currentAccount) {
      setStudentAddress(currentAccount.address);
      setAddressError('');
    }
  }

  useEffect(() => {
    fetchGrants();
  }, []);

  async function fetchGrants() {
    const client = new IotaClient({ url: getFullnodeUrl('testnet') });

    const events = await client.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::grant::GrantMinted` },
      limit: 50,
    });

    const parsed = events.data.map((e) => ({
      id: (e.parsedJson as any).grant_id,
      student: (e.parsedJson as any).student,
      amount: (e.parsedJson as any).amount,
      timestamp: new Date(Number(e.timestampMs)).toLocaleString(),
    }));

    setGrants(parsed);
    setLoading(false);
  }

  async function handleMintGrant(e: React.FormEvent) {
    e.preventDefault();
    if (!currentAccount) {
      alert('Please connect your wallet first');
      return;
    }

    if (!validateAddress(studentAddress)) {
      setAddressError('Please enter a valid IOTA address (66 characters starting with 0x)');
      return;
    }

    setMinting(true);

    try {
      const client = new IotaClient({ url: getFullnodeUrl('testnet') });
      
      // Find the AdminCap object owned by the current account
      const objects = await client.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PACKAGE_ID}::grant::AdminCap`,
        },
      });

      if (objects.data.length === 0) {
        alert('AdminCap not found. Only the admin can mint grants.');
        setMinting(false);
        return;
      }

      const adminCapId = objects.data[0].data?.objectId;
      if (!adminCapId) {
        alert('AdminCap object ID not found');
        setMinting(false);
        return;
      }

      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::grant::mint`,
        arguments: [
          tx.object(adminCapId),
          tx.pure.address(studentAddress),
          tx.pure.u64(grantAmount),
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async () => {
            alert('Grant minted successfully!');
            setStudentAddress('');
            setGrantAmount('');
            // Wait a bit for the event to be indexed
            setTimeout(() => fetchGrants(), 2000);
          },
          onError: (error) => {
            console.error('Error minting grant:', error);
            alert('Failed to mint grant: ' + error.message);
          },
        }
      );
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to mint grant: ' + (error as Error).message);
    } finally {
      setMinting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0E11] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12 pb-6 border-b border-gray-800">
          <div>
            <h1 className="text-4xl font-semibold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              ScholarFlow Grants
            </h1>
            <p className="text-gray-500 text-sm">Live from IOTA Testnet</p>
          </div>
          <ConnectButton />
        </div>

        {currentAccount && (
          <div className="bg-[#131619] rounded-xl border border-[#1F2428] p-8 mb-10 shadow-lg shadow-black/30 hover:border-gray-700 transition-all duration-300">
            <h2 className="text-2xl font-semibold mb-6 text-gray-100">Mint New Grant</h2>
            <form onSubmit={handleMintGrant} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Student Address
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={studentAddress}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    placeholder="0x1234567890abcdef..."
                    className={`flex-1 px-4 py-3 bg-[#0B0E11] rounded-lg border ${
                      addressError ? 'border-red-500' : 'border-[#1F2428]'
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-mono text-sm transition-all duration-200`}
                    required
                  />
                  <button
                    type="button"
                    onClick={useMyAddress}
                    className="px-5 py-3 bg-[#1F2428] hover:bg-[#2A2F35] rounded-lg text-sm whitespace-nowrap transition-all duration-200 border border-[#2A2F35] hover:border-gray-600"
                  >
                    Use My Address
                  </button>
                </div>
                {addressError && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <span>⚠</span> {addressError}
                  </p>
                )}
                <p className="text-gray-600 text-xs mt-2">
                  Format: 66 characters starting with 0x
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Grant Amount
                </label>
                <input
                  type="number"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full px-4 py-3 bg-[#0B0E11] rounded-lg border border-[#1F2428] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={minting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 px-6 py-3.5 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:shadow-none"
              >
                {minting ? '⏳ Minting...' : '✨ Mint Grant'}
              </button>
            </form>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-6 text-gray-100">Recent Grants</h2>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#131619] rounded-xl border border-[#1F2428] p-6 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : grants.length === 0 ? (
          <div className="bg-[#131619] rounded-xl border border-[#1F2428] p-12 text-center">
            <div className="text-gray-600 mb-2 text-4xl">📋</div>
            <p className="text-gray-500 text-lg">No grants minted yet.</p>
            <p className="text-gray-600 text-sm mt-2">Mint your first grant to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grants.map((grant) => (
              <div 
                key={grant.id} 
                className="bg-[#131619] rounded-xl border border-[#1F2428] p-6 shadow-lg shadow-black/20 hover:border-gray-700 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 transform hover:scale-[1.01]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Grant ID</p>
                    <a
                      href={`https://explorer.iota.org/object/${grant.id}?network=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 inline-flex items-center gap-1 group"
                    >
                      <span className="group-hover:underline">{grant.id.slice(0, 20)}...</span>
                      <span className="opacity-60 group-hover:opacity-100 transition-opacity">↗</span>
                    </a>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      {grant.amount}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Amount</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#1F2428]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Student:</span>
                      <a
                        href={`https://explorer.iota.org/address/${grant.student}?network=testnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 inline-flex items-center gap-1 group"
                      >
                        <span className="group-hover:underline">{grant.student.slice(0, 10)}...{grant.student.slice(-8)}</span>
                        <span className="opacity-60 group-hover:opacity-100 transition-opacity">↗</span>
                      </a>
                    </div>
                    <p className="text-xs text-gray-600">{grant.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}