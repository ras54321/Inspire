import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getUser } from '../lib/contract';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const router = useRouter();

  // Load user-created groups from localStorage
  useEffect(() => {
    const savedGroups = JSON.parse(localStorage.getItem('userGroups') || '[]');
    setGroups(savedGroups);
    connectWallet();
  }, []);

  useEffect(() => {
    localStorage.setItem('userGroups', JSON.stringify(groups));
  }, [groups]);

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

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // Create group with user as creator
      const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        description: groupDescription || 'No description',
        creator: currentAccount,
        memberCount: 1,
        postCount: 0,
        isJoined: true,
        avatar: '📌',
        createdAt: new Date().toISOString(),
        members: [currentAccount],
        messages: [],
      };
      
      setGroups(prev => [newGroup, ...prev]);
      setGroupName('');
      setGroupDescription('');
      setShowCreateModal(false);
      toast.success('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const updatedGroups = groups.map(g => 
      g.id === groupId 
        ? { 
            ...g, 
            isJoined: !g.isJoined, 
            memberCount: g.isJoined ? g.memberCount - 1 : g.memberCount + 1,
            members: g.isJoined 
              ? g.members.filter(m => m !== currentAccount)
              : [...g.members, currentAccount]
          }
        : g
    );
    
    setGroups(updatedGroups);
    toast.success(group.isJoined ? `Left ${group.name}` : `Joined ${group.name}`);
  };

  const viewGroup = (groupId) => {
    router.push(`/groups/${groupId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Groups</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            + Create Group
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {groups.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No groups yet</p>
            <p className="text-gray-400 dark:text-gray-500 mb-6">Create your first group to get started!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div onClick={() => viewGroup(group.id)} className="cursor-pointer">
                  <div className="h-32 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <span className="text-6xl">{group.avatar}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{group.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{group.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        <strong className="text-gray-900 dark:text-white">{group.memberCount}</strong> members
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        <strong className="text-gray-900 dark:text-white">{group.postCount}</strong> posts
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinGroup(group.id);
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl font-semibold transition-all ${
                      group.isJoined
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {group.isJoined ? 'Leave Group' : 'Join Group'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  disabled={loading}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Description</label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Describe your group"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all"
                  rows={3}
                  disabled={loading}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
