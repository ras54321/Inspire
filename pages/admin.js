import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiUsers, 
  HiDocumentText, 
  HiShieldExclamation, 
  HiUserGroup,
  HiTrendingUp,
  HiSearch,
  HiFilter,
  HiDotsVertical,
  HiCheck,
  HiX,
  HiBan,
  HiUserRemove,
  HiEye,
  HiDownload,
  HiRefresh,
  HiCog,
  HiBell
} from 'react-icons/hi';
import { getTotalPosts, getTotalUsers } from '../lib/contract';
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
    newUsersToday: 0,
    postsToday: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('7days');
  const [showExportModal, setShowExportModal] = useState(false);

  // Enhanced users data
  const [users, setUsers] = useState([
    {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8bEaF',
      username: 'web3dev',
      bio: 'Building the future of decentralized social media',
      postCount: 45,
      followerCount: 234,
      followingCount: 89,
      status: 'active',
      joinedAt: '2024-01-15',
      lastActive: '2024-04-21',
      verified: true,
      role: 'user',
      ip: '192.168.1.1',
    },
    {
      address: '0x1234567890123456789012345678901234567890',
      username: 'crypto_king',
      bio: 'DeFi explorer and NFT collector',
      postCount: 128,
      followerCount: 567,
      followingCount: 234,
      status: 'active',
      joinedAt: '2024-02-20',
      lastActive: '2024-04-20',
      verified: true,
      role: 'moderator',
      ip: '192.168.1.2',
    },
    {
      address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      username: 'nft_artist',
      bio: 'Digital artist creating unique NFTs',
      postCount: 67,
      followerCount: 892,
      followingCount: 45,
      status: 'active',
      joinedAt: '2024-03-10',
      lastActive: '2024-04-21',
      verified: false,
      role: 'user',
      ip: '192.168.1.3',
    },
    {
      address: '0x9876543210987654321098765432109876543210',
      username: 'spammer123',
      bio: 'Spam account detected',
      postCount: 234,
      followerCount: 12,
      followingCount: 567,
      status: 'suspended',
      joinedAt: '2024-03-25',
      lastActive: '2024-04-19',
      verified: false,
      role: 'user',
      ip: '192.168.1.4',
    },
    {
      address: '0x1111111111111111111111111111111111111111',
      username: 'toxic_user',
      bio: 'Multiple reports for harassment',
      postCount: 89,
      followerCount: 23,
      followingCount: 12,
      status: 'banned',
      joinedAt: '2024-01-05',
      lastActive: '2024-04-15',
      verified: false,
      role: 'user',
      ip: '192.168.1.5',
    },
  ]);

  // Enhanced reported posts with more details
  const [reportedPosts, setReportedPosts] = useState([
    {
      id: '1',
      author: 'spammer123',
      authorAddress: '0x9876543210987654321098765432109876543210',
      content: 'Check out this amazing crypto investment opportunity!!! Guaranteed 100x returns!!! DM me now!!! 💰💰💰',
      reports: 5,
      reporters: ['user1', 'user2', 'user3', 'user4', 'user5'],
      reason: 'Spam',
      status: 'pending',
      reportedAt: '2024-04-21',
      postDate: '2024-04-21',
      likes: 2,
      comments: 0,
      severity: 'medium',
    },
    {
      id: '2',
      author: 'unknown_user',
      authorAddress: '0x2222222222222222222222222222222222222222',
      content: 'This platform is garbage and all users here are idiots!',
      reports: 12,
      reporters: ['alice', 'bob', 'charlie', 'david', 'eve', 'frank', 'grace', 'henry', 'ivy', 'jack', 'kate', 'leo'],
      reason: 'Harassment',
      status: 'pending',
      reportedAt: '2024-04-20',
      postDate: '2024-04-19',
      likes: 0,
      comments: 3,
      severity: 'high',
    },
    {
      id: '3',
      author: 'crypto_scammer',
      authorAddress: '0x3333333333333333333333333333333333333333',
      content: 'Send me 0.5 ETH and I will send back 5 ETH instantly! Limited time offer!',
      reports: 8,
      reporters: ['victim1', 'victim2', 'victim3', 'victim4', 'victim5', 'victim6', 'victim7', 'victim8'],
      reason: 'Scam/Fraud',
      status: 'pending',
      reportedAt: '2024-04-19',
      postDate: '2024-04-18',
      likes: 1,
      comments: 15,
      severity: 'critical',
    },
    {
      id: '4',
      author: 'nft_artist',
      authorAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      content: 'Check out my new NFT collection dropping tomorrow!',
      reports: 1,
      reporters: ['hater123'],
      reason: 'Spam',
      status: 'dismissed',
      reportedAt: '2024-04-18',
      postDate: '2024-04-17',
      likes: 156,
      comments: 23,
      severity: 'low',
    },
  ]);

  // System logs
  const [systemLogs, setSystemLogs] = useState([
    { id: 1, action: 'User banned', target: 'toxic_user', admin: 'admin1', timestamp: '2024-04-21 14:30:22', type: 'user' },
    { id: 2, action: 'Post deleted', target: 'Post #1234', admin: 'admin1', timestamp: '2024-04-21 14:25:10', type: 'content' },
    { id: 3, action: 'User suspended', target: 'spammer123', admin: 'mod1', timestamp: '2024-04-21 13:45:33', type: 'user' },
    { id: 4, action: 'Report dismissed', target: 'Post #1230', admin: 'admin1', timestamp: '2024-04-21 12:20:15', type: 'moderation' },
    { id: 5, action: 'Contract upgraded', target: 'SocialMediaDapp', admin: 'system', timestamp: '2024-04-21 10:00:00', type: 'system' },
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
        bannedUsers: users.filter(u => u.status === 'banned').length,
        reportedPosts: reportedPosts.filter(r => r.status === 'pending').length,
        newUsersToday: 3,
        postsToday: 12,
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
    const newStatus = user.status === 'active' ? 'banned' : 'active';
    toast.success(`${user.username} has been ${newStatus}`);
    
    // Add to system logs
    const newLog = {
      id: systemLogs.length + 1,
      action: newStatus === 'banned' ? 'User banned' : 'User unbanned',
      target: user.username,
      admin: 'admin1',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: 'user'
    };
    setSystemLogs([newLog, ...systemLogs]);
  };

  const handleSuspendUser = (userAddress) => {
    setUsers(prev => prev.map(user =>
      user.address === userAddress
        ? { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' }
        : user
    ));
    const user = users.find(u => u.address === userAddress);
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    toast.success(`${user.username} has been ${newStatus}`);
  };

  const handleResolveReport = (postId, action) => {
    const report = reportedPosts.find(r => r.id === postId);
    setReportedPosts(prev => prev.filter(post => post.id !== postId));
    
    if (action === 'delete') {
      toast.success('Post has been deleted and user warned');
    } else if (action === 'ban') {
      const user = users.find(u => u.address === report.authorAddress);
      if (user) {
        handleBanUser(user.address);
      }
      toast.success('User has been banned for violating community guidelines');
    } else {
      toast.success('Report has been dismissed');
    }
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }
    
    if (action === 'ban') {
      selectedUsers.forEach(addr => handleBanUser(addr));
      toast.success(`${selectedUsers.length} users banned`);
    } else if (action === 'suspend') {
      selectedUsers.forEach(addr => handleSuspendUser(addr));
      toast.success(`${selectedUsers.length} users suspended`);
    }
    setSelectedUsers([]);
  };

  const toggleUserSelection = (address) => {
    setSelectedUsers(prev => 
      prev.includes(address) 
        ? prev.filter(a => a !== address)
        : [...prev, address]
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportData = (format) => {
    const data = {
      users: users,
      reports: reportedPosts,
      stats: stats,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowExportModal(false);
    toast.success('Data exported successfully');
  };

  const StatCard = ({ icon: Icon, title, value, change, color, trend }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {change && <p className="text-sm text-gray-400 mt-1">{change}</p>}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users, content, and platform settings</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <HiDownload className="w-5 h-5" />
              Export
            </button>
            <button
              onClick={loadStats}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
            >
              <HiRefresh className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: HiTrendingUp },
          { id: 'users', label: 'Users', icon: HiUsers },
          { id: 'reports', label: 'Reports', icon: HiShieldExclamation },
          { id: 'logs', label: 'System Logs', icon: HiDocumentText },
          { id: 'settings', label: 'Settings', icon: HiCog },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {tab.id === 'reports' && reportedPosts.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {reportedPosts.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={HiUsers}
              title="Total Users"
              value={stats.totalUsers}
              change={`+${stats.newUsersToday} today`}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              trend={12}
            />
            <StatCard
              icon={HiDocumentText}
              title="Total Posts"
              value={stats.totalPosts}
              change={`+${stats.postsToday} today`}
              color="bg-gradient-to-br from-green-500 to-green-600"
              trend={8}
            />
            <StatCard
              icon={HiUserGroup}
              title="Active Users"
              value={stats.activeUsers}
              change="Currently online"
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              trend={5}
            />
            <StatCard
              icon={HiShieldExclamation}
              title="Pending Reports"
              value={stats.reportedPosts}
              change="Needs attention"
              color="bg-gradient-to-br from-red-500 to-red-600"
              trend={-15}
            />
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent System Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {systemLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className={`w-2 h-2 rounded-full ${
                      log.type === 'user' ? 'bg-blue-500' :
                      log.type === 'content' ? 'bg-red-500' :
                      log.type === 'moderation' ? 'bg-yellow-500' :
                      'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.target} • {log.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                >
                  <HiUsers className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">Manage Users</p>
                  <p className="text-sm text-gray-500">{stats.totalUsers} total users</p>
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-left hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                >
                  <HiShieldExclamation className="w-6 h-6 text-red-500 mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">Review Reports</p>
                  <p className="text-sm text-gray-500">{stats.reportedPosts} pending</p>
                </button>
                <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-left hover:bg-green-100 dark:hover:bg-green-900/30 transition-all">
                  <HiDocumentText className="w-6 h-6 text-green-500 mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">Content Review</p>
                  <p className="text-sm text-gray-500">Moderate posts</p>
                </button>
                <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-left hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all">
                  <HiCog className="w-6 h-6 text-purple-500 mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">Settings</p>
                  <p className="text-sm text-gray-500">Platform config</p>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by username or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="posts">Most Posts</option>
              <option value="followers">Most Followers</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
            >
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {selectedUsers.length} users selected
              </span>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-colors"
                >
                  Suspend
                </button>
                <button
                  onClick={() => handleBulkAction('ban')}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                >
                  Ban
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.address));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Stats</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.address}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.address)}
                          onChange={() => toggleUserSelection(user.address)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">@{user.username}</span>
                              {user.verified && (
                                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                                  ✓
                                </span>
                              )}
                              {user.role === 'moderator' && (
                                <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full">
                                  MOD
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 font-mono">
                              {user.address.slice(0, 8)}...{user.address.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">{user.postCount} posts</p>
                          <p className="text-gray-500">{user.followerCount} followers</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : user.status === 'suspended'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <p>{user.joinedAt}</p>
                        <p className="text-xs">Last: {user.lastActive}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toast.info(`Viewing ${user.username}'s profile`)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                            title="View Profile"
                          >
                            <HiEye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleSuspendUser(user.address)}
                            className={`p-2 rounded-lg transition-all ${
                              user.status === 'suspended'
                                ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                            }`}
                            title={user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                          >
                            <HiUserRemove className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleBanUser(user.address)}
                            className={`p-2 rounded-lg transition-all ${
                              user.status === 'banned'
                                ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                            title={user.status === 'banned' ? 'Unban' : 'Ban'}
                          >
                            <HiBan className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Report Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pending', count: reportedPosts.filter(r => r.status === 'pending').length, color: 'bg-yellow-500' },
              { label: 'Critical', count: reportedPosts.filter(r => r.severity === 'critical').length, color: 'bg-red-500' },
              { label: 'Resolved Today', count: 12, color: 'bg-green-500' },
              { label: 'Avg Resolution', count: '4h', color: 'bg-blue-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {reportedPosts.filter(r => r.status === 'pending').length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <HiCheck className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Caught Up!</h3>
                <p className="text-gray-500">No pending reports to review</p>
              </div>
            ) : (
              reportedPosts.filter(r => r.status === 'pending').map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Severity Indicator */}
                    <div className={`w-1 h-full min-h-[100px] rounded-full ${
                      report.severity === 'critical' ? 'bg-red-500' :
                      report.severity === 'high' ? 'bg-orange-500' :
                      report.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          report.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          report.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          report.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {report.severity.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                          {report.reason}
                        </span>
                        <span className="text-sm text-gray-500">
                          {report.reports} reports
                        </span>
                        <span className="text-sm text-gray-400">
                          {report.reportedAt}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Posted by @{report.author}</p>
                        <p className="text-gray-900 dark:text-white text-lg">{report.content}</p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span>{report.likes} likes</span>
                        <span>{report.comments} comments</span>
                      </div>

                      {/* Reporters */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-500">Reported by:</span>
                        <div className="flex -space-x-2">
                          {report.reporters.slice(0, 5).map((reporter, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs border-2 border-white dark:border-gray-800"
                              title={reporter}
                            >
                              {reporter[0].toUpperCase()}
                            </div>
                          ))}
                          {report.reporters.length > 5 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 border-2 border-white dark:border-gray-800">
                              +{report.reporters.length - 5}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleResolveReport(report.id, 'dismiss')}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                          <HiX className="w-5 h-5" />
                          Dismiss
                        </button>
                        <button
                          onClick={() => toast.info('Post hidden from public view')}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-xl hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all"
                        >
                          <HiEye className="w-5 h-5" />
                          Hide Post
                        </button>
                        <button
                          onClick={() => handleResolveReport(report.id, 'delete')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                        >
                          <HiDocumentText className="w-5 h-5" />
                          Delete Post
                        </button>
                        <button
                          onClick={() => handleResolveReport(report.id, 'ban')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                        >
                          <HiBan className="w-5 h-5" />
                          Ban User
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* System Logs Tab */}
      {activeTab === 'logs' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">System Activity Log</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <HiDownload className="w-4 h-4" />
              Export Logs
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {systemLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{log.timestamp}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{log.target}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{log.admin}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.type === 'user' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        log.type === 'content' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        log.type === 'moderation' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl space-y-6"
        >
          {/* General Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">New User Registration</p>
                  <p className="text-sm text-gray-500">Allow new users to sign up</p>
                </div>
                <button className="relative w-14 h-8 bg-green-500 rounded-full transition-colors">
                  <span className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Post Moderation</p>
                  <p className="text-sm text-gray-500">Require approval for new posts</p>
                </div>
                <button className="relative w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors">
                  <span className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-gray-500">Send email alerts for reports</p>
                </div>
                <button className="relative w-14 h-8 bg-green-500 rounded-full transition-colors">
                  <span className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow" />
                </button>
              </div>
            </div>
          </div>

          {/* Contract Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Smart Contract</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contract Address
                </label>
                <input
                  type="text"
                  value="0xAC354667A5CcCE57095B7aB7B230efa1E224C55E"
                  readOnly
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-mono text-gray-600 dark:text-gray-400"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => toast.info('Contract verification in progress...')}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Verify Contract
                </button>
                <button
                  onClick={() => toast.info('Opening contract on Etherscan...')}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  View on Etherscan
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Data</h3>
              <p className="text-gray-500 mb-6">Choose the format for your data export</p>
              <div className="space-y-3">
                <button
                  onClick={() => exportData('json')}
                  className="w-full p-4 border-2 border-blue-500 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <p className="font-medium text-blue-600 dark:text-blue-400">JSON Format</p>
                  <p className="text-sm text-gray-500">Raw data for developers</p>
                </button>
                <button
                  onClick={() => toast.info('CSV export coming soon!')}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <p className="font-medium text-gray-700 dark:text-gray-300">CSV Format</p>
                  <p className="text-sm text-gray-500">Spreadsheet compatible</p>
                </button>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full mt-4 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
