import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { getUser, getUserPosts, followUser, unfollowUser, isFollowing, getPost } from '../../lib/contract';
import { getFollowers, getFollowing } from '../../lib/contract';
import { uploadToPinata } from '../../lib/pinata';
import PostCard from '../../components/Posts/PostCard';
import VerificationBadge from '../../components/UI/VerificationBadge';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../lib/constants';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const router = useRouter();
  const { address } = router.query;
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [showBannerUpload, setShowBannerUpload] = useState(false);

  useEffect(() => {
    if (address) {
      loadProfileData();
    }
    connectWallet();
  }, [address]);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setCurrentAccount(account);
        setSigner(signer);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  const handleBannerUpload = async () => {
    if (!bannerFile) return;

    try {
      const bannerHash = await uploadToPinata(bannerFile);
      
      // Save banner to localStorage
      const banners = JSON.parse(localStorage.getItem('banners') || '{}');
      banners[address] = bannerHash;
      localStorage.setItem('banners', JSON.stringify(banners));
      
      setUser(prev => ({ ...prev, bannerHash }));
      setBannerFile(null);
      setShowBannerUpload(false);
      toast.success('Banner updated successfully!');
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Failed to upload banner');
    }
  };

  const getBannerUrl = () => {
    const banners = JSON.parse(localStorage.getItem('banners') || '{}');
    const bannerHash = banners[address] || user?.bannerHash;
    if (bannerHash) {
      return `https://gateway.pinata.cloud/ipfs/${bannerHash}`;
    }
    return null;
  };

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const userData = await getUser(address);
      setUser(userData);

      const postIds = await getUserPosts(address);
      const loadedPosts = [];
      
      for (const postId of postIds) {
        try {
          const post = await getPost(postId);
          if (post.exists) {
            loadedPosts.push(post);
          }
        } catch (error) {
          console.error(`Error loading post ${postId}:`, error);
        }
      }
      
      setPosts(loadedPosts.reverse());

      const followerList = await getFollowers(address);
      setFollowers(followerList);

      const followingList = await getFollowing(address);
      setFollowing(followingList);

      if (currentAccount) {
        const following = await isFollowing(currentAccount, address);
        setIsFollowingUser(following);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error(ERROR_MESSAGES.CONTRACT_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!signer) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    try {
      if (isFollowingUser) {
        await unfollowUser(address, signer);
        setIsFollowingUser(false);
        setFollowers(prev => prev.filter(f => f.toLowerCase() !== currentAccount.toLowerCase()));
        toast.success(SUCCESS_MESSAGES.USER_UNFOLLOWED);
      } else {
        await followUser(address, signer);
        setIsFollowingUser(true);
        setFollowers(prev => [...prev, currentAccount]);
        toast.success(SUCCESS_MESSAGES.USER_FOLLOWED);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error(ERROR_MESSAGES.CONTRACT_ERROR);
    }
  };

  const formatDate = (timestamp) => {
    const ts = timestamp?.toString() || '0';
    const date = new Date(Number(ts) * 1000);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !user.exists) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SocialDApp</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          {/* Banner */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            {getBannerUrl() && (
              <img
                src={getBannerUrl()}
                alt="Profile Banner"
                className="w-full h-full object-cover"
              />
            )}
            {currentAccount?.toLowerCase() === address?.toLowerCase() && (
              <button
                onClick={() => setShowBannerUpload(!showBannerUpload)}
                className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                {getBannerUrl() ? 'Change Banner' : 'Add Banner'}
              </button>
            )}
          </div>

          {/* Banner Upload Modal */}
          {showBannerUpload && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <input
                type="file"
                onChange={(e) => setBannerFile(e.target.files[0])}
                accept="image/*"
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400
                  hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                  file:transition-colors cursor-pointer mb-3"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleBannerUpload}
                  disabled={!bannerFile}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Upload
                </button>
                <button
                  onClick={() => {
                    setShowBannerUpload(false);
                    setBannerFile(null);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mr-4 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                  {user.username ? user.username[0].toUpperCase() : address[2].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    {user.username}
                    <VerificationBadge userAddress={address} />
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">{address.substring(0, 6)}...{address.substring(38)}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Joined {formatDate(user.createdAt)}</p>
              </div>
            </div>
            
            {currentAccount && currentAccount.toLowerCase() !== address.toLowerCase() && (
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-lg ${
                  isFollowingUser
                    ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isFollowingUser ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>

          {user.bio && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">{user.bio}</p>
          )}

          <div className="flex space-x-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{user.postCount?.toString() || 0}</p>
              <p className="text-gray-500 dark:text-gray-400">Posts</p>
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{user.followerCount?.toString() || 0}</p>
              <p className="text-gray-500 dark:text-gray-400">Followers</p>
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{user.followingCount?.toString() || 0}</p>
              <p className="text-gray-500 dark:text-gray-400">Following</p>
            </div>
          </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-4">Posts</h3>
          {posts.length === 0 ? (
            <p className="text-gray-500">No posts yet</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id?.toString() || post.id}
                post={post}
                signer={signer}
                currentAddress={currentAccount}
                onRefresh={loadProfileData}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
