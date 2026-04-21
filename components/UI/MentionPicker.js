import React, { useState, useEffect, useRef } from 'react';
import { getUser, getAllUsers } from '../../lib/contract';

const MentionPicker = ({ onMentionSelect, currentAddress }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (query.startsWith('@')) {
      const searchQuery = query.substring(1).toLowerCase();
      const filtered = users.filter(user => 
        user.username?.toLowerCase().includes(searchQuery) ||
        user.address?.toLowerCase().includes(searchQuery)
      );
      setFilteredUsers(filtered);
      setShowPicker(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowPicker(false);
    }
  }, [query, users]);

  const loadUsers = async () => {
    try {
      // For now, load from localStorage since we don't have getAllUsers contract function
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (!showPicker) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredUsers.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredUsers[selectedIndex]) {
          selectUser(filteredUsers[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowPicker(false);
        break;
    }
  };

  const selectUser = (user) => {
    const mention = `@${user.username || user.address.substring(0, 6)}`;
    onMentionSelect(mention);
    setQuery('');
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type @ to mention users..."
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />

      {showPicker && (
        <div
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto z-50"
        >
          {filteredUsers.map((user, index) => (
            <div
              key={user.address}
              onClick={() => selectUser(user)}
              className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.username ? user.username[0].toUpperCase() : user.address[2].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user.username || 'Unknown User'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.address.substring(0, 6)}...{user.address.substring(38)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionPicker;
