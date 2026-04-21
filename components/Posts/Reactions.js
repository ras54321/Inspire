import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const REACTIONS = [
  { emoji: '❤️', name: 'love', color: 'text-red-500' },
  { emoji: '😂', name: 'laugh', color: 'text-yellow-500' },
  { emoji: '😮', name: 'wow', color: 'text-blue-500' },
  { emoji: '😢', name: 'sad', color: 'text-gray-500' },
  { emoji: '😡', name: 'angry', color: 'text-orange-500' },
  { emoji: '👍', name: 'like', color: 'text-green-500' },
];

const Reactions = ({ postId, currentAddress, onReact }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [userReactions, setUserReactions] = useState({});
  const [reactionCounts, setReactionCounts] = useState({});
  const containerRef = useRef(null);

  useEffect(() => {
    loadReactions();
  }, [postId, currentAddress]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowReactions(false);
      }
    };

    if (showReactions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReactions]);

  const loadReactions = () => {
    try {
      const allReactions = JSON.parse(localStorage.getItem('reactions') || '{}');
      const postReactions = allReactions[postId] || { counts: {}, users: {} };
      
      setReactionCounts(postReactions.counts);
      
      if (currentAddress) {
        setUserReactions(postReactions.users[currentAddress] || {});
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const handleReaction = (reaction) => {
    if (!currentAddress) {
      toast.error('Please connect your wallet to react');
      return;
    }

    try {
      const allReactions = JSON.parse(localStorage.getItem('reactions') || '{}');
      
      if (!allReactions[postId]) {
        allReactions[postId] = { counts: {}, users: {} };
      }

      const postReactions = allReactions[postId];
      
      // Initialize counts if not exists
      if (!postReactions.counts[reaction.name]) {
        postReactions.counts[reaction.name] = 0;
      }

      // Remove previous reaction if exists
      if (userReactions[reaction.name]) {
        postReactions.counts[reaction.name] -= 1;
        delete postReactions.users[currentAddress][reaction.name];
      } else {
        // Remove other reactions (one reaction per user per post)
        Object.keys(userReactions).forEach(oldReaction => {
          postReactions.counts[oldReaction] -= 1;
        });
        
        // Add new reaction
        postReactions.counts[reaction.name] += 1;
        postReactions.users[currentAddress] = { [reaction.name]: true };
      }

      localStorage.setItem('reactions', JSON.stringify(allReactions));
      
      loadReactions();
      setShowReactions(false);
      
      if (onReact) {
        onReact(reaction);
      }
    } catch (error) {
      console.error('Error saving reaction:', error);
      toast.error('Failed to save reaction');
    }
  };

  const getTotalReactions = () => {
    return Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setShowReactions(!showReactions)}
        className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <span className="text-lg">😊</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {getTotalReactions()}
        </span>
      </button>

      {showReactions && (
        <div className="absolute bottom-full left-0 mb-2 flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {REACTIONS.map((reaction) => {
            const count = reactionCounts[reaction.name] || 0;
            const hasReacted = userReactions[reaction.name];
            
            return (
              <button
                key={reaction.name}
                onClick={() => handleReaction(reaction)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-125 ${
                  hasReacted ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={reaction.name}
              >
                <span className="text-2xl">{reaction.emoji}</span>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reactions;
