import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { getUser, getUserPosts, getPost } from '../../lib/contract';
import PostCard from '../../components/Posts/PostCard';
import toast from 'react-hot-toast';

const GroupDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadGroup();
      connectWallet();
    }
  }, [id]);

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

  const loadGroup = async () => {
    setLoading(true);
    try {
      // Get group data from localStorage (user-created groups)
      const userGroups = JSON.parse(localStorage.getItem('userGroups') || '[]');
      const groupData = userGroups.find(g => g.id === id);
      
      if (groupData) {
        setGroup(groupData);
        // Load group posts/messages
        loadGroupPosts();
      } else {
        toast.error('Group not found');
        router.push('/groups');
      }
    } catch (error) {
      console.error('Error loading group:', error);
      toast.error('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupPosts = async () => {
    try {
      // Load group posts from localStorage
      const groupPosts = JSON.parse(localStorage.getItem(`groupPosts_${id}`) || '[]');
      setPosts(groupPosts);
    } catch (error) {
      console.error('Error loading group posts:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!group.isJoined) {
      toast.error('Please join the group first');
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      author: currentAccount,
      contentIpfsHash: 'text',
      likeCount: 0,
      commentCount: 0,
      createdAt: Math.floor(Date.now() / 1000),
      textContent: newMessage,
    };

    const updatedPosts = [...posts, newPost];
    setPosts(updatedPosts);
    localStorage.setItem(`groupPosts_${id}`, JSON.stringify(updatedPosts));

    // Update group post count
    setGroup(prev => ({
      ...prev,
      postCount: prev.postCount + 1,
    }));

    setNewMessage('');
    toast.success('Message sent!');
  };

  const handleJoinGroup = () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Update group state
    const updatedGroup = {
      ...group,
      isJoined: !group.isJoined,
      memberCount: group.isJoined ? group.memberCount - 1 : group.memberCount + 1,
      members: group.isJoined 
        ? group.members.filter(m => m !== currentAccount)
        : [...group.members, currentAccount]
    };
    
    setGroup(updatedGroup);

    // Sync with localStorage groups
    const userGroups = JSON.parse(localStorage.getItem('userGroups') || '[]');
    const updatedGroups = userGroups.map(g => 
      g.id === id ? updatedGroup : g
    );
    localStorage.setItem('userGroups', JSON.stringify(updatedGroups));

    toast.success(group.isJoined ? 'Left the group' : 'Joined the group');
  };

  const refreshPosts = () => {
    loadGroupPosts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Group not found</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Group Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mr-6 flex items-center justify-center text-5xl shadow-lg">
                {group.avatar}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{group.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{group.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <span><strong className="text-gray-900 dark:text-white">{group.memberCount}</strong> members</span>
                  <span><strong className="text-gray-900 dark:text-white">{group.postCount}</strong> posts</span>
                  <span>Created {group.createdAt}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleJoinGroup}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                group.isJoined
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {group.isJoined ? 'Leave Group' : 'Join Group'}
            </button>
          </div>
        </div>

        {/* Group Posts/Messages */}
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-1.5 mb-6 shadow-lg">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all ${
                  activeTab === 'posts'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Chat
              </button>
            </div>
          </div>

          {activeTab === 'posts' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Group Posts</h2>
              {posts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center border border-gray-100 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No posts in this group yet</p>
                  {group.isJoined && (
                    <p className="text-sm text-gray-400">Be the first to post!</p>
                  )}
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {post.author.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {post.author.substring(0, 6)}...{post.author.substring(38)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(post.createdAt * 1000).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {post.textContent || post.contentIpfsHash}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Group Chat</h2>
              
              {group.isJoined ? (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                    {posts.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No messages yet. Start the conversation!
                      </p>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {posts.map((post) => (
                          <div key={post.id} className={`flex items-start space-x-3 ${
                            post.author === currentAccount ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              post.author === currentAccount 
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                                : 'bg-gradient-to-br from-gray-400 to-gray-500'
                            }`}>
                              {post.author.substring(0, 2).toUpperCase()}
                            </div>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              post.author === currentAccount
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            }`}>
                              <p className="text-sm">{post.textContent}</p>
                              <p className={`text-xs mt-1 ${
                                post.author === currentAccount ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {new Date(post.createdAt * 1000).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center border border-gray-100 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Join the group to participate in the chat</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GroupDetail;
