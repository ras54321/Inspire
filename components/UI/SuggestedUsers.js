import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const SuggestedUsers = ({ currentAccount }) => {
  const router = useRouter();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestedUsers();
  }, [currentAccount]);

  const loadSuggestedUsers = () => {
    try {
      // Sample suggested users (in a real app, this would come from the contract or API)
      const users = [
        {
          address: '0x1234...5678',
          username: 'crypto_enthusiast',
          bio: 'Web3 developer | DeFi enthusiast',
          followers: 1234,
          following: false
        },
        {
          address: '0xabcd...efgh',
          username: 'nft_collector',
          bio: 'Digital art collector | NFT trader',
          followers: 892,
          following: false
        },
        {
          address: '0x9876...5432',
          username: 'blockchain_dev',
          bio: 'Building the future of decentralized apps',
          followers: 2341,
          following: false
        },
        {
          address: '0x1111...2222',
          username: 'defi_expert',
          bio: 'DeFi analyst | Yield farming strategies',
          followers: 1567,
          following: false
        },
        {
          address: '0x3333...4444',
          username: 'web3_builder',
          bio: 'Smart contract developer | DAO contributor',
          followers: 987,
          following: false
        }
      ];

      setSuggestedUsers(users);
    } catch (error) {
      console.error('Error loading suggested users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = (index) => {
    const updatedUsers = [...suggestedUsers];
    updatedUsers[index].following = !updatedUsers[index].following;
    updatedUsers[index].followers += updatedUsers[index].following ? 1 : -1;
    setSuggestedUsers(updatedUsers);
  };

  const handleViewProfile = (address) => {
    router.push(`/profile/${address}`);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
          <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mr-3 flex items-center justify-center">
            <span className="text-white text-sm">👥</span>
          </span>
          Who to Follow
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mr-3 flex items-center justify-center">
          <span className="text-white text-sm">👥</span>
        </span>
        Who to Follow
      </h2>
      <div className="space-y-4">
        {suggestedUsers.map((user, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <div
              onClick={() => handleViewProfile(user.address)}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 hover:scale-105 transition-transform"
            >
              <span className="text-white font-bold text-sm">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div
                onClick={() => handleViewProfile(user.address)}
                className="cursor-pointer"
              >
                <p className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
                  @{user.username}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {user.bio}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {user.followers.toLocaleString()} followers
                </p>
              </div>
            </div>
            <button
              onClick={() => handleFollow(index)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                user.following
                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
              }`}
            >
              {user.following ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => router.push('/users')}
        className="w-full mt-4 py-2 text-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
      >
        Discover more users →
      </button>
    </div>
  );
};

export default SuggestedUsers;
