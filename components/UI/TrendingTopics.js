import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const TrendingTopics = () => {
  const router = useRouter();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingTopics();
  }, []);

  const loadTrendingTopics = () => {
    try {
      // Load hashtags from localStorage (simulated data)
      const hashtags = JSON.parse(localStorage.getItem('hashtags') || '[]');
      
      // Count hashtag occurrences
      const hashtagCounts = {};
      hashtags.forEach(tag => {
        const hashtag = tag.toLowerCase();
        hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
      });

      // Sort by count and take top 10
      const sortedHashtags = Object.entries(hashtagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([hashtag, count]) => ({
          hashtag,
          count,
          posts: count // Simplified: assuming 1 mention = 1 post
        }));

      // If no real data, add sample trending topics
      if (sortedHashtags.length === 0) {
        setTrending([
          { hashtag: '#web3', count: 1250, posts: 450 },
          { hashtag: '#blockchain', count: 980, posts: 320 },
          { hashtag: '#crypto', count: 850, posts: 280 },
          { hashtag: '#nft', count: 720, posts: 240 },
          { hashtag: '#defi', count: 650, posts: 210 },
          { hashtag: '#metamask', count: 540, posts: 180 },
          { hashtag: '#ethereum', count: 480, posts: 160 },
          { hashtag: '#dapp', count: 420, posts: 140 },
          { hashtag: '#decentralized', count: 380, posts: 125 },
          { hashtag: '#smartcontract', count: 320, posts: 105 },
        ]);
      } else {
        setTrending(sortedHashtags);
      }
    } catch (error) {
      console.error('Error loading trending topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagClick = (hashtag) => {
    router.push(`/?q=${hashtag.substring(1)}`);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
          <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-3 flex items-center justify-center">
            <span className="text-white text-sm">📈</span>
          </span>
          Trending
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-3 flex items-center justify-center">
          <span className="text-white text-sm">📈</span>
        </span>
        Trending
      </h2>
      <div className="space-y-4">
        {trending.map((topic, index) => (
          <div
            key={topic.hashtag}
            onClick={() => handleHashtagClick(topic.hashtag)}
            className="cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl p-3 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {topic.hashtag}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {topic.posts.toLocaleString()} posts
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {topic.count.toLocaleString()}
                </span>
                <span className="text-lg">💬</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics;
