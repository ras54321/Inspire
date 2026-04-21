import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { userExists } from '../lib/contract';
import toast from 'react-hot-toast';

const Welcome = () => {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkWalletAndProfile();
  }, []);

  const checkWalletAndProfile = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = provider.getSigner();
          const account = await signer.getAddress();
          setAccount(account);
          setSigner(signer);
          
          // Check if user has a profile
          const exists = await userExists(account);
          setHasProfile(exists);
          
          if (exists) {
            // User has profile, redirect to home
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    }
    setLoading(false);
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        
        // Check network
        const network = await provider.getNetwork();
        const sepoliaChainId = 11155111;
        
        if (network.chainId !== sepoliaChainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: ethers.utils.hexValue(sepoliaChainId) }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              toast.error('Please add Sepolia testnet to MetaMask');
              return;
            }
            toast.error('Failed to switch to Sepolia network');
            return;
          }
        }
        
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setAccount(account);
        setSigner(signer);
        
        // Check if user has a profile
        const exists = await userExists(account);
        setHasProfile(exists);
        
        if (exists) {
          toast.success('Welcome back!');
          router.push('/');
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast.error('Failed to connect wallet');
      }
    } else {
      toast.error('Please install MetaMask to use this application');
    }
  };

  const handleCreateProfile = () => {
    router.push('/create-profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-4xl">S</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SocialDApp
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your decentralized social media platform
          </p>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Web3 Social Media
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your wallet and create your profile to start posting, connecting with others, and exploring the decentralized social world.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Create Posts</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Connect</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <div className="text-3xl mb-2">📱</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Stories</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
            <div className="text-3xl mb-2">🎨</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">NFTs</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {!account ? (
            <button
              onClick={connectWallet}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>Connect Wallet</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </button>
          ) : !hasProfile ? (
            <button
              onClick={handleCreateProfile}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Create Your Profile
            </button>
          ) : (
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              Go to Feed
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by Ethereum & IPFS</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
