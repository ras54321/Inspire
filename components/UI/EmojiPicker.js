import React, { useState } from 'react';

const EmojiPicker = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const commonEmojis = [
    '😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡', '👍', '👎',
    '❤️', '💔', '🔥', '✨', '🎉', '💯', '🚀', '💪', '🙏', '🤝',
    '👋', '🙌', '✌️', '🤙', '💪', '👀', '🌟', '⭐', '💫', '🌈',
    '🎵', '🎶', '🎮', '🎨', '📷', '🎬', '📱', '💻', '🖥️', '🎧',
    '☕', '🍕', '🍔', '🌮', '🍦', '🍰', '🍎', '🍇', '🍓', '🥑',
  ];

  const handleEmojiClick = (emoji) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95"
        aria-label="Add emoji"
      >
        <span className="text-2xl">😊</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 w-72">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Select Emoji</h3>
          <div className="grid grid-cols-8 gap-1.5">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all hover:scale-110 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
