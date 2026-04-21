import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Poll = ({ poll, onVote, currentAddress }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    if (poll) {
      const votes = poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);
      setTotalVotes(votes);
      
      // Check if current user has voted
      if (currentAddress && poll.voters) {
        setHasVoted(poll.voters.includes(currentAddress));
      }
    }
  }, [poll, currentAddress]);

  const handleVote = (optionIndex) => {
    if (hasVoted) {
      toast.error('You have already voted on this poll');
      return;
    }
    setSelectedOption(optionIndex);
    onVote(optionIndex);
    setHasVoted(true);
  };

  const getPercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  if (!poll) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mt-4">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">📊 Poll</h4>
      <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">{poll.question}</p>
      
      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const percentage = getPercentage(option.votes || 0);
          const isSelected = selectedOption === index;
          const isLeading = option.votes === Math.max(...poll.options.map(o => o.votes || 0)) && option.votes > 0;
          
          return (
            <div
              key={index}
              onClick={() => handleVote(index)}
              className={`relative cursor-pointer transition-all ${
                hasVoted ? 'cursor-default' : 'hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${isSelected ? 'font-semibold' : ''} text-gray-900 dark:text-white`}>
                  {option.text}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {percentage}%
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isLeading && hasVoted ? 'bg-green-500' : isSelected ? 'bg-blue-500' : 'bg-blue-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {option.votes || 0} votes
                </span>
                {hasVoted && isSelected && (
                  <span className="text-xs text-green-600 dark:text-green-400">✓ Your vote</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} total
      </div>
    </div>
  );
};

export default Poll;
