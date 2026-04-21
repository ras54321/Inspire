import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getPost } from '../lib/contract';
import PostCard from '../components/Posts/PostCard';
import toast from 'react-hot-toast';

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [signer, setSigner] = useState(null);

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
        setSigner(signer);
        loadSavedPosts();
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  const loadSavedPosts = async () => {
    setLoading(true);
    try {
      const savedPostIds = JSON.parse(localStorage.getItem('savedPosts') || '[]');
      const posts = [];
      
      for (const postId of savedPostIds) {
        try {
          const post = await getPost(postId);
          if (post.exists) {
            posts.push(post);
          }
        } catch (error) {
          console.error(`Error loading post ${postId}:`, error);
        }
      }
      
      setSavedPosts(posts.reverse());
    } catch (error) {
      console.error('Error loading saved posts:', error);
      toast.error('Failed to load saved posts');
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = () => {
    loadSavedPosts();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Posts</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading saved posts...</p>
          </div>
        ) : savedPosts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No saved posts yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Bookmark posts to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedPosts.map((post) => (
              <PostCard
                key={post.id?.toString() || post.id}
                post={post}
                signer={signer}
                currentAddress={currentAccount}
                onRefresh={refreshPosts}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedPosts;
