import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getTotalPosts, getPost } from '../lib/contract';
import PostCard from '../components/Posts/PostCard';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const router = useRouter();

  useEffect(() => {
    connectWallet();
    loadPosts();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setSigner(signer);
        setAccount(account);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const totalPosts = await getTotalPosts();
      const loadedPosts = [];
      
      for (let i = totalPosts; i > Math.max(0, totalPosts - 20); i--) {
        try {
          const post = await getPost(i);
          loadedPosts.push({ ...post, id: i });
        } catch (error) {
          console.error('Error loading post:', error);
        }
      }
      
      setPosts(loadedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = () => {
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            🌍 Explore
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Discover trending posts and content</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="space-y-4">
            <SkeletonLoader type="post" count={5} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No posts to explore yet. Be the first to post!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id?.toString() || post.id}
                post={post}
                signer={signer}
                currentAddress={account}
                onRefresh={refreshPosts}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ExplorePage;
