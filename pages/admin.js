import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getTotalPosts, getTotalUsers, getUser } from '../lib/contract';
import toast from 'react-hot-toast';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalGroups: 4,
    activeUsers: 0,
    reportedPosts: 0,
    bannedUsers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);

  // Sample users data for admin panel
  const [users, setUsers] = useState([
    {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8bEaF',
      username: 'web3dev',
      postCount: 45,
      followerCount: 234,
      followingCount: 89,
      status: 'active',
      joinedAt: '2024-01-15',
    },
    {
      address: '0x1234567890123456789012345678901234567890',
      username: 'crypto_king',
      postCount: 128,
      followerCount: 567,
      followingCount: 234,
      status: 'active',
      joinedAt: '2024-02-20',
    },
    {
      address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      username: 'nft_artist',
      postCount: 67,
      followerCount: 892,
      followingCount: 45,
      status: 'active',
      joinedAt: '2024-03-10',
    },
    {
      address: '0x9876543210987654321098765432109876543210',
      username: 'spammer123',
      postCount: 234,
      followerCount: 12,
      followingCount: 567,
      status: 'suspended',
      joinedAt: '2024-03-25',
    },
  ]);

  // Sample reported posts
  const [reportedPosts, setReportedPosts] = useState([
    {
      id: '1',
      author: 'spammer123',
      content: 'This is spam content...',
      reports: 5,
      reason: 'Spam',
      status: 'pending',
      reportedAt: '2024-04-15',
    },
    {
      id: '2',
      author: 'unknown_user',
      content: 'Inappropriate content...',
      reports: 12,
      reason: 'Inappropriate',
      status: 'pending',
      reportedAt: '2024-04-18',
    },
  ]);

  useEffect(() => {
    connectWallet();
    loadStats();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setCurrentAccount(account);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  const loadStats = async () => {
    try {
      const totalPosts = await getTotalPosts();
      setStats(prev => ({
        ...prev,
        totalPosts: totalPosts?.toString() || 0,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
      }));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleBanUser = (userAddress) => {
    setUsers(prev => prev.map(user =>
      user.address === userAddress
        ? { ...user, status: user.status === 'active' ? 'banned' : 'active' }
        : user
    ));
    const user = users.find(u => u.address === userAddress);
    toast.success(user.status === 'active' ? `Banned ${user.username}` : `Unbanned ${user.username}`);
  };

  const handleResolveReport = (postId, action) => {
    setReportedPosts(prev => prev.filter(post => post.id !== postId));
    toast.success(action === 'delete' ? 'Post deleted' : 'Report dismissed');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'reports'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Reports
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Users</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                <p className="text-green-500 text-sm mt-2">+12% from last month</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Posts</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPosts}</p>
                <p className="text-green-500 text-sm mt-2">+8% from last month</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Active Users</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
                <p className="text-green-500 text-sm mt-2">+5% from last month</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Groups</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalGroups}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Reported Posts</h3>
                <p className="text-3xl font-bold text-red-500">{stats.reportedPosts}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Banned Users</h3>
                <p className="text-3xl font-bold text-red-500">{stats.bannedUsers}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Posts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Followers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.address}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mr-3 flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.address.substring(0, 6)}...{user.address.substring(38)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.postCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.followerCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : user.status === 'suspended'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.joinedAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleBanUser(user.address)}
                        className={`${
                          user.status === 'active' 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.status === 'active' ? 'Ban' : 'Unban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reportedPosts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">No pending reports</p>
              </div>
            ) : (
              reportedPosts.map((report) => (
                <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">{report.reason}</span>
                        <span className="text-sm text-gray-500">{report.reports} reports</span>
                        <span className="text-sm text-gray-500">{report.reportedAt}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">By: {report.author}</p>
                      <p className="text-gray-900 dark:text-white">{report.content}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleResolveReport(report.id, 'dismiss')}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveReport(report.id, 'delete')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Delete Post
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
