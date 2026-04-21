import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getUser, getTotalPosts, getPost, followUser, unfollowUser, isFollowing, getTotalUsers } from '../lib/contract';
import { getFollowers, getFollowing } from '../lib/contract';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../lib/constants';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import VerificationBadge from '../components/UI/VerificationBadge';
import { isUserVerified } from '../lib/verification';

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [followingStatus, setFollowingStatus] = useState({});
  const router = useRouter();

  useEffect(() => {
    connectWallet();
    loadAllUsers();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setCurrentAccount(account);
        setSigner(signer);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      // Get total number of users and load them
      const total = await getTotalUsers();
      const loadedUsers = [];
      
      for (let i = 1; i <= total; i++) {
        try {
          // Try to get user at index i (assuming sequential IDs)
          // In a real implementation, you'd need a proper way to enumerate users
          const sampleAddresses = [
            '0x742d35Cc6634C0532925a3b844Bc9e7595f8bEaF',
            '0x1234567890123456789012345678901234567890',
            '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            '0x9876543210987654321098765432109876543210',
            '0xfedcbafedcbafedcbafedcbafedcbafedcba',
          ];
          
          for (const address of sampleAddresses) {
            try {
              const user = await getUser(address);
              if (user.exists && user.username) {
                const userObj = { address, ...user };
                if (!loadedUsers.find(u => u.address === address)) {
                  loadedUsers.push(userObj);
                }
              }
            } catch (error) {
              // User doesn't exist, skip
            }
          }
        } catch (error) {
          // Skip invalid users
        }
      }
      
      setAllUsers(loadedUsers);
      setUsers(loadedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = (term) => {
    if (!term.trim()) {
      setUsers(allUsers);
      return;
    }

    const filtered = allUsers.filter(user => 
      user.username.toLowerCase().includes(term.toLowerCase()) ||
      user.address.toLowerCase().includes(term.toLowerCase())
    );
    setUsers(filtered);
  };

  useEffect(() => {
    searchUsers(searchTerm);
  }, [searchTerm, allUsers]);

  const handleFollow = async (userAddress) => {
    if (!signer) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    try {
      const isFollowing = followingStatus[userAddress];
      if (isFollowing) {
        await unfollowUser(userAddress, signer);
        toast.success(SUCCESS_MESSAGES.USER_UNFOLLOWED);
      } else {
        await followUser(userAddress, signer);
        toast.success(SUCCESS_MESSAGES.USER_FOLLOWED);
      }
      
      // Update following status
      setFollowingStatus(prev => ({
        ...prev,
        [userAddress]: !isFollowing
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error(ERROR_MESSAGES.CONTRACT_ERROR);
    }
  };

  const checkFollowingStatus = async (userAddress) => {
    if (currentAccount) {
      try {
        const following = await isFollowing(currentAccount, userAddress);
        setFollowingStatus(prev => ({
          ...prev,
          [userAddress]: following
        }));
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    }
  };

  useEffect(() => {
    users.forEach(user => {
      checkFollowingStatus(user.address);
    });
  }, [users, currentAccount]);

  const viewProfile = (address) => {
    router.push(`/profile/${address}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👥 User Directory</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover and connect with users</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by username or address..."
              className="w-full p-4 pl-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading users...</p>
          </div>
        ) : users.length === 0 && searchTerm ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No users found matching "{searchTerm}"</p>
          </div>
        ) : users.length === 0 && !searchTerm ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No users registered yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.address}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 cursor-pointer"
                onClick={() => viewProfile(user.address)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                      {user.username}
                    </h3>
                    <VerificationBadge userAddress={user.address} />
                  </div>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    {user.address.substring(0, 6)}...{user.address.substring(38)}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-6 mb-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-gray-900 dark:text-white">{user.followerCount?.toString() || 0}</p>
                      <p className="text-gray-500 dark:text-gray-400">followers</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900 dark:text-white">{user.followingCount?.toString() || 0}</p>
                      <p className="text-gray-500 dark:text-gray-400">following</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900 dark:text-white">{user.postCount?.toString() || 0}</p>
                      <p className="text-gray-500 dark:text-gray-400">posts</p>
                    </div>
                  </div>
                  
                  {user.bio && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                  
                  {currentAccount && currentAccount.toLowerCase() !== user.address.toLowerCase() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(user.address);
                      }}
                      className={`w-full px-6 py-2.5 rounded-xl font-semibold transition-all ${
                        followingStatus[user.address]
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {followingStatus[user.address] ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersPage;
