import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/router';
import { 
  HiSearch, 
  HiUser, 
  HiDocumentText, 
  HiUserGroup, 
  HiX,
  HiFilter,
  HiTrendingUp
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const Search = memo(() => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({ users: [], posts: [], groups: [] });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Load recent searches from localStorage - only once on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches', e);
      }
    }
  }, []);

  // Better debounce implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Save recent search - memoized
  const saveRecentSearch = useCallback((searchQuery) => {
    if (!searchQuery.trim()) return;
    setRecentSearches(prev => {
      const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Search functionality - memoized results
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ users: [], posts: [], groups: [] });
      return;
    }

    setLoading(true);

    try {
      // Mock search results - in production, this would query the contract/IPFS
      const mockUsers = [
        { address: '0x742d35...', username: 'web3enthusiast', bio: 'Building the future of social', avatar: null },
        { address: '0x123456...', username: 'cryptoking', bio: 'DeFi explorer and NFT collector', avatar: null },
        { address: '0xabcdef...', username: 'nftartist', bio: 'Digital artist creating unique NFTs', avatar: null },
      ].filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

      const mockPosts = [
        { id: 1, content: 'Just minted my first NFT! 🎨 #Web3 #NFT', author: 'nftartist', likes: 42, comments: 8 },
        { id: 2, content: 'DeFi is the future of finance 💰 #DeFi #Crypto', author: 'cryptoking', likes: 156, comments: 23 },
        { id: 3, content: 'Building on Ethereum is amazing! 🚀 #ETH #Blockchain', author: 'web3enthusiast', likes: 89, comments: 15 },
      ].filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()));

      const mockGroups = [
        { id: 1, name: 'Web3 Developers', members: 1234, description: 'A community for blockchain developers' },
        { id: 2, name: 'NFT Artists', members: 567, description: 'Share and discuss NFT art' },
        { id: 3, name: 'DeFi Enthusiasts', members: 890, description: 'All things decentralized finance' },
      ].filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

      setResults({
        users: mockUsers,
        posts: mockPosts,
        groups: mockGroups
      });
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error performing search');
    } finally {
      setLoading(false);
    }
  }, [saveRecentSearch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const clearSearch = () => {
    setQuery('');
    setResults({ users: [], posts: [], groups: [] });
  };

  const removeRecentSearch = (search, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== search);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Memoized trending topics
  const trendingTopics = useMemo(() => ['#Web3', '#NFT', '#DeFi', '#Blockchain', '#Crypto', '#Ethereum', '#Metaverse'], []);
  
  // Memoized tab configuration
  const tabs = useMemo(() => ['all', 'users', 'posts', 'groups'], []);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Header - CSS animation instead of motion */}
      <div className="sticky top-0 z-20 bg-gray-50/95 dark:bg-gray-900/95 pb-4 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <HiSearch className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, posts, groups..."
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-4 flex items-center"
            >
              <div className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <HiX className="w-4 h-4 text-gray-500" />
              </div>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'users', 'posts', 'groups'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ml-auto"
          >
            <HiFilter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters Panel - CSS transition */}
      <div
        className={`overflow-hidden transition-all duration-200 ${showFilters ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Filters</h3>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
              Most Recent
            </button>
            <button className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">
              Most Popular
            </button>
            <button className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">
              Verified Only
            </button>
          </div>
        </div>
      </div>

      {/* Results or Suggestions */}
      {query ? (
        <div className="space-y-4 animate-fade-in">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Users Results */}
              {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <HiUser className="w-5 h-5 text-blue-500" />
                    Users
                  </h2>
                  <div className="grid gap-3">
                    {results.users.map((user) => (
                      <div
                        key={user.address}
                        onClick={() => router.push(`/profile/${user.address}`)}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {user.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">@{user.username}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.bio}</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
                          Follow
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Posts Results */}
              {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <HiDocumentText className="w-5 h-5 text-green-500" />
                    Posts
                  </h2>
                  <div className="grid gap-3">
                    {results.posts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => router.push(`/post/${post.id}`)}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">@{post.author}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{post.likes} likes</span>
                          <span>{post.comments} comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Groups Results */}
              {(activeTab === 'all' || activeTab === 'groups') && results.groups.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <HiUserGroup className="w-5 h-5 text-purple-500" />
                    Groups
                  </h2>
                  <div className="grid gap-3">
                    {results.groups.map((group) => (
                      <div
                        key={group.id}
                        onClick={() => router.push(`/groups/${group.id}`)}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{group.description}</p>
                        <span className="text-sm text-blue-500">{group.members.toLocaleString()} members</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* No Results */}
              {results.users.length === 0 && results.posts.length === 0 && results.groups.length === 0 && (
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <HiSearch className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No results found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms</p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Searches</h2>
                <button
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('recentSearches');
                  }}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setQuery(search)}
                    className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <HiSearch className="w-4 h-4 text-gray-400" />
                    <span>{search}</span>
                    <div
                      onClick={(e) => removeRecentSearch(search, e)}
                      className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <HiX className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Trending Topics */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <HiTrendingUp className="w-5 h-5 text-red-500" />
              Trending Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setQuery(topic)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full text-blue-600 dark:text-blue-400 font-medium hover:from-blue-500/20 hover:to-purple-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  {topic}
                </button>
              ))}
            </div>
          </section>

          {/* Suggested Users */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Suggested Users</h2>
            <div className="grid gap-3">
              {[
                { username: 'vitalik.eth', bio: 'Ethereum Founder', followers: '2.1M' },
                { username: 'sbf', bio: 'Building the future', followers: '890K' },
                { username: 'cdixon', bio: 'Partner @ a16z', followers: '567K' },
              ].map((user, index) => (
                <div
                  key={user.username}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <span className="text-white font-bold">{user.username[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">@{user.username}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.bio}</p>
                    <span className="text-xs text-gray-400">{user.followers} followers</span>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Search;
