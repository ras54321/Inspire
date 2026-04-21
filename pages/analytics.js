import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { getUser, getUserPosts, getFollowers, getFollowing, getPost } from '../lib/contract';
import toast from 'react-hot-toast';

const Analytics = () => {
  const router = useRouter();
  const [currentAccount, setCurrentAccount] = useState(null);
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    totalLikes: 0,
    totalComments: 0,
    engagementRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStat, setSelectedStat] = useState(null);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setCurrentAccount(account);
        loadUserStats(account);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast.error('Failed to connect wallet');
      } finally {
        setLoading(false);
      }
    }
  };

  const loadUserStats = async (address) => {
    try {
      const user = await getUser(address);
      const followers = await getFollowers(address);
      const following = await getFollowing(address);
      const postIds = await getUserPosts(address);

      // Fetch actual posts to get real likes and comments
      let totalLikes = 0;
      let totalComments = 0;
      const activity = [];

      for (const postId of postIds) {
        try {
          const post = await getPost(postId);
          if (post.exists) {
            totalLikes += Number(post.likeCount?.toString() || 0);
            totalComments += Number(post.commentCount?.toString() || 0);

            // Add to recent activity
            const postTime = new Date(post.createdAt * 1000);
            const now = new Date();
            const diffHours = Math.floor((now - postTime) / (1000 * 60 * 60));
            
            if (diffHours < 24 * 7) { // Only show activity from last 7 days
              let timeAgo;
              if (diffHours < 1) {
                timeAgo = 'Just now';
              } else if (diffHours < 24) {
                timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
              } else {
                const diffDays = Math.floor(diffHours / 24);
                timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
              }

              activity.push({
                type: 'post',
                message: `You created a new post`,
                time: timeAgo,
              });
            }
          }
        } catch (error) {
          console.error(`Error loading post ${postId}:`, error);
        }
      }

      // Sort activity by time (most recent first)
      activity.sort((a, b) => {
        const timeA = parseTimeAgo(a.time);
        const timeB = parseTimeAgo(b.time);
        return timeA - timeB;
      });

      setRecentActivity(activity.slice(0, 5)); // Show only 5 most recent activities
      
      // Engagement rate calculation
      const engagementRate = followers.length > 0 
        ? ((totalLikes + totalComments) / followers.length) * 100 
        : 0;

      setUserStats({
        totalPosts: postIds.length,
        totalFollowers: followers.length,
        totalFollowing: following.length,
        totalLikes,
        totalComments,
        engagementRate: engagementRate.toFixed(2),
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const parseTimeAgo = (timeStr) => {
    // Parse time string to comparable number
    if (timeStr === 'Just now') return 0;
    const value = parseInt(timeStr);
    if (timeStr.includes('hour')) return value;
    if (timeStr.includes('day')) return value * 24;
    return 9999;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Please connect your wallet to view your analytics</p>
          <button
            onClick={connectWallet}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={() => router.push('/')}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Posts</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.totalPosts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
            <p className="text-green-500 text-sm mt-2">View your posts →</p>
          </div>

          <div 
            onClick={() => router.push('/users')}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Followers</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.totalFollowers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <p className="text-green-500 text-sm mt-2">Discover users →</p>
          </div>

          <div 
            onClick={() => router.push('/users')}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Following</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.totalFollowing}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">➕</span>
              </div>
            </div>
            <p className="text-green-500 text-sm mt-2">Find people to follow →</p>
          </div>

          <div 
            onClick={() => router.push('/')}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Likes</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.totalLikes}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">❤️</span>
              </div>
            </div>
            <p className="text-green-500 text-sm mt-2">View liked content →</p>
          </div>

          <div 
            onClick={() => router.push('/')}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Comments</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.totalComments}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
            </div>
            <p className="text-green-500 text-sm mt-2">View comments →</p>
          </div>

          <div 
            onClick={() => setSelectedStat('engagement')}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Engagement Rate</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.engagementRate}%</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
            <p className="text-green-500 text-sm mt-2">View details →</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'post' ? 'bg-blue-100 dark:bg-blue-900' :
                    activity.type === 'like' ? 'bg-red-100 dark:bg-red-900' :
                    activity.type === 'follow' ? 'bg-purple-100 dark:bg-purple-900' :
                    'bg-yellow-100 dark:bg-yellow-900'
                  }`}>
                    {activity.type === 'post' && <span>📝</span>}
                    {activity.type === 'like' && <span>❤️</span>}
                    {activity.type === 'follow' && <span>👥</span>}
                    {activity.type === 'comment' && <span>💬</span>}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                  <span className="text-gray-400 dark:text-gray-500">→</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-xl font-bold mb-4">💡 Tips to Grow Your Presence</h2>
          <ul className="space-y-2">
            <li>• Post consistently to keep your audience engaged</li>
            <li>• Respond to comments to build community</li>
            <li>• Use relevant hashtags to increase discoverability</li>
            <li>• Share high-quality content that provides value</li>
            <li>• Engage with other users' posts to increase visibility</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
