import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { userExists, createUser, getUser } from '../lib/contract';
import { uploadUserProfile } from '../lib/pinata';
import { APP_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../lib/constants';
import toast from 'react-hot-toast';

const CreateProfile = () => {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        
        // Check if on correct network (Sepolia)
        const network = await provider.getNetwork();
        const sepoliaChainId = 11155111;
        
        if (network.chainId !== sepoliaChainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: ethers.utils.hexValue(sepoliaChainId) }],
            });
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
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
        
        // Check if user already has a profile
        const exists = await userExists(account);
        setUserExists(exists);
        
        if (exists) {
          toast.info('You already have a profile. Redirecting to home...');
          setTimeout(() => router.push('/'), 2000);
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast.error(ERROR_MESSAGES.WALLET_CONNECTION_ERROR);
      }
    } else {
      toast.error('Please install MetaMask to use this application');
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    
    if (!signer) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    if (username.length < APP_CONSTANTS.MIN_USERNAME_LENGTH) {
      toast.error(`Username must be at least ${APP_CONSTANTS.MIN_USERNAME_LENGTH} characters`);
      return;
    }

    setLoading(true);

    try {
      const profileData = await uploadUserProfile(username, bio, avatar);
      await createUser(
        username,
        bio,
        profileData.avatarIpfsHash,
        signer
      );
      
      toast.success(SUCCESS_MESSAGES.USER_CREATED);
      
      // Redirect to home after successful profile creation
      setTimeout(() => router.push('/'), 1500);
    } catch (error) {
      console.error('Error creating profile:', error);
      const errorMessage = error?.reason || error?.message || ERROR_MESSAGES.CONTRACT_ERROR;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SocialDApp</h1>
            <p className="text-gray-600 dark:text-gray-400">Create your profile to get started</p>
          </div>
          
          <div className="mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🦊</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">MetaMask Required</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Connect your wallet to create a profile</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={connectWallet}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>Connect MetaMask</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>By connecting, you agree to our Terms of Service</p>
          </div>
        </div>
      </div>
    );
  }

  if (userExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Already Exists</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You already have a profile. Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Set up your profile to join the community</p>
        </div>

        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Wallet Connected</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{account.substring(0, 6)}...{account.substring(38)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateProfile}>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              disabled={loading}
              required
              minLength={APP_CONSTANTS.MIN_USERNAME_LENGTH}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Minimum {APP_CONSTANTS.MIN_USERNAME_LENGTH} characters
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Avatar (Optional)</label>
            <input
              type="file"
              onChange={handleAvatarUpload}
              accept="image/*"
              className="w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400
                hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                file:transition-colors cursor-pointer"
              disabled={loading}
            />
            {avatar && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                ✓ {avatar.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
