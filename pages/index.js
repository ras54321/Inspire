import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import CreatePost from '../components/Posts/CreatePost';
import PostCard from '../components/Posts/PostCard';
import DarkModeToggle from '../components/UI/DarkModeToggle';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import Notifications from '../components/UI/Notifications';
import StoryViewer from '../components/Stories/StoryViewer';
import SuggestedUsers from '../components/UI/SuggestedUsers';
import { getTotalPosts, getPost, userExists, createUser, getUser, getFollowing } from '../lib/contract';
import { uploadUserProfile } from '../lib/pinata';
import { APP_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../lib/constants';
import toast from 'react-hot-toast';

const Index = () => {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [activeTab, setActiveTab] = useState('for-you');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    connectWallet();
    loadStories();
  }, []);

  const loadStories = () => {
    const savedStories = JSON.parse(localStorage.getItem('stories') || '[]');
    // Filter out expired stories
    const validStories = savedStories.filter(story => story.expiresAt > Math.floor(Date.now() / 1000));
    setStories(validStories);
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined') {
      toast.error('Please use this app in a browser');
      return;
    }

    if (!window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask to use this app.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      if (!accounts || accounts.length === 0) {
        toast.error('Please allow MetaMask to connect');
        return;
      }
      
      // Get the network
      const network = await provider.getNetwork();
      const sepoliaChainId = 11155111;
      
      // Check if on correct network (Sepolia)
      if (network.chainId !== sepoliaChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
          });
          // Refresh provider after network switch
          const newProvider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = newProvider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          setSigner(signer);
          checkUserProfile(address);
          toast.success('Wallet connected successfully!');
          return;
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Testnet',
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://rpc.ankr.com/eth_sepolia'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                  },
                ],
              });
              // Refresh provider after network switch
              const newProvider = new ethers.providers.Web3Provider(window.ethereum);
              const signer = newProvider.getSigner();
              const address = await signer.getAddress();
              setAccount(address);
              setSigner(signer);
              checkUserProfile(address);
              toast.success('Wallet connected successfully!');
              return;
            } catch (addError) {
              console.error('Error adding Sepolia network:', addError);
              toast.error('Please switch to Sepolia network manually');
              return;
            }
          } else if (switchError.code === 4001) {
            // User rejected the network switch
            toast.error('Please switch to Sepolia network to use this app');
            return;
          } else {
            console.error('Error switching network:', switchError);
            toast.error('Please switch to Sepolia network manually');
            return;
          }
        }
      }
      
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setSigner(signer);
      checkUserProfile(address);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      // Handle specific error codes
      if (error.code === 4001) {
        // User rejected the connection
        toast.error('Connection rejected. Please approve the connection in MetaMask.');
      } else if (error.code === -32002) {
        // Request already pending
        toast.error('Please check your MetaMask extension and approve the pending request.');
      } else if (error.code === 4100) {
        // Unauthorized
        toast.error('Please unlock your MetaMask wallet.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    }
  };

  const checkUserProfile = async (address) => {
    try {
      const exists = await userExists(address);
      if (exists) {
        const user = await getUser(address);
        setUserProfile(user);
      } else {
        // Redirect to create-profile page instead of showing modal
        router.push('/create-profile');
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
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
      const profileData = await uploadUserProfile(username, bio);
      await createUser(
        profileData.username,
        profileData.bio,
        profileData.avatarIpfsHash,
        signer
      );
      
      toast.success(SUCCESS_MESSAGES.USER_CREATED);
      setShowProfileModal(false);
      checkUserProfile(account);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error(ERROR_MESSAGES.CONTRACT_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      if (activeTab === 'following' && account) {
        // Load posts from followed users
        const following = await getFollowing(account);
        const loadedPosts = [];
        
        for (const followedAddress of following) {
          try {
            const userPosts = await getUserPosts(followedAddress);
            for (const postId of userPosts) {
              try {
                const post = await getPost(postId);
                if (post.exists) {
                  loadedPosts.push(post);
                }
              } catch (error) {
                console.error(`Error loading post ${postId}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error loading posts from ${followedAddress}:`, error);
          }
        }
        
        // Sort by creation time (newest first)
        loadedPosts.sort((a, b) => b.createdAt - a.createdAt);
        
        // Remove duplicates by post ID
        const uniquePosts = Array.from(new Map(loadedPosts.map(post => [post.id?.toString(), post])).values());
        const paginatedPosts = uniquePosts.slice(0, pageNum * APP_CONSTANTS.POSTS_PER_PAGE);
        
        if (append) {
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id?.toString()));
            const newPosts = paginatedPosts.filter(p => !existingIds.has(p.id?.toString()));
            return [...prev, ...newPosts];
          });
        } else {
          setPosts(paginatedPosts);
        }
        
        setHasMore(paginatedPosts.length < uniquePosts.length);
      } else {
        // Load all posts
        const total = await getTotalPosts();
        const loadedPosts = [];
        
        const startIndex = append ? (pageNum - 1) * APP_CONSTANTS.POSTS_PER_PAGE + 1 : 1;
        const endIndex = Math.min(startIndex + APP_CONSTANTS.POSTS_PER_PAGE - 1, total);
        
        for (let i = startIndex; i <= endIndex; i++) {
          try {
            const post = await getPost(i);
            if (post.exists) {
              loadedPosts.push(post);
            }
          } catch (error) {
            console.error(`Error loading post ${i}:`, error);
          }
        }
        
        // Remove duplicates by post ID
        const uniquePosts = Array.from(new Map(loadedPosts.map(post => [post.id?.toString(), post])).values());
        
        if (append) {
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id?.toString()));
            const newPosts = uniquePosts.reverse().filter(p => !existingIds.has(p.id?.toString()));
            return [...prev, ...newPosts];
          });
        } else {
          setPosts(uniquePosts.reverse());
        }
        
        setHasMore(endIndex < total);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      setPage(1);
      setHasMore(true);
      loadPosts(1, false);
    }
  }, [account, activeTab]);

  const loadMorePosts = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage, true);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, loading, page]);

  const refreshPosts = () => {
    setPage(1);
    setHasMore(true);
    loadPosts(1, false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create Your Profile</h2>
            <form onSubmit={handleCreateProfile}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  disabled={loading}
                />
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? 'Creating...' : 'Create Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="bg-gradient-to-r from-white via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 shadow-xl border-b border-gray-200 dark:border-gray-700 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 
                onClick={() => router.push('/')}
                className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 animate-gradient"
              >
                Inspire
              </h1>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-1">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              >
                🏠 Home
              </button>
              <button
                type="button"
                onClick={() => router.push('/explore')}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              >
                🌍 Explore
              </button>
              <button
                type="button"
                onClick={() => router.push('/groups')}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              >
                👥 Groups
              </button>
              <button
                type="button"
                onClick={() => router.push('/messages')}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              >
                💬 Messages
              </button>
              <button
                type="button"
                onClick={() => router.push('/saved')}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              >
                🔖 Saved
              </button>
              <button
                type="button"
                onClick={() => router.push('/users')}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              >
                👤 Discover
              </button>
              <button
                type="button"
                onClick={() => router.push('/events')}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              >
                📅 Events
              </button>
              <button
                type="button"
                onClick={() => router.push('/ai-chat')}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              >
                🤖 AI Assistant
              </button>
              {!account ? (
                <button
                  onClick={connectWallet}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Connect Wallet
                </button>
              ) : (
                <>
                  <div className="relative group">
                    <div className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl cursor-pointer hover:from-green-500 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg">
                      <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold">
                        {account.substring(0, 6)}...{account.substring(38)}
                      </span>
                    </div>
                    {/* Disconnect Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                      <button
                        onClick={() => {
                          setAccount(null);
                          setSigner(null);
                          setUserProfile(null);
                          toast.success('Wallet disconnected from app');
                        }}
                        className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-t-xl transition-colors font-medium"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div className="flex items-center space-x-2">
                <DarkModeToggle />
                <Notifications />
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 min-w-0">
            {/* Stories Section */}
            {signer && (
              <StoryViewer 
                stories={stories} 
                currentAccount={account}
                onClose={() => loadStories()}
              />
            )}

            {userProfile && signer && (
              <CreatePost signer={signer} onPostCreated={refreshPosts} />
            )}

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-1.5 mb-6 shadow-lg">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('for-you')}
                  className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all ${
                    activeTab === 'for-you'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  For You
                </button>
                <button
                  onClick={() => setActiveTab('following')}
              className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all ${
                activeTab === 'following'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Following
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading && posts.length === 0 ? (
            <SkeletonLoader type="post" count={3} />
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.id?.toString() || post.id}
                  post={post}
                  signer={signer}
                  currentAddress={account}
                  onRefresh={refreshPosts}
                />
              ))}
              {hasMore && (
                <div ref={observerRef} className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}
            </>
          )}
        </div>
          </div>

        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block space-y-6">
          <SuggestedUsers currentAccount={account} />
        </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
