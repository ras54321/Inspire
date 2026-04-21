import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { getUser } from '../lib/contract';
import { uploadToPinata } from '../lib/pinata';
import VoiceRecorder from '../components/UI/VoiceRecorder';
import toast from 'react-hot-toast';

const Messages = () => {
  const router = useRouter();
  const [currentAccount, setCurrentAccount] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);

  useEffect(() => {
    connectWallet();
    loadConversations();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setCurrentAccount(account);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  const loadConversations = () => {
    const savedConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    setConversations(savedConversations);
  };

  const handleVoiceRecordingComplete = (blob) => {
    setVoiceBlob(blob);
    toast.success('Voice message recorded! Click send to deliver.');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !voiceBlob) || !activeConversation) {
      return;
    }

    let voiceUrl = null;
    
    if (voiceBlob) {
      try {
        voiceUrl = await uploadToPinata(voiceBlob);
      } catch (error) {
        console.error('Error uploading voice message:', error);
        toast.error('Failed to upload voice message');
        return;
      }
    }

    const message = {
      id: Date.now().toString(),
      sender: currentAccount,
      text: newMessage,
      voiceUrl,
      timestamp: Math.floor(Date.now() / 1000),
    };

    setNewMessage('');
    setVoiceBlob(null);

    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: newMessage,
          lastMessageTime: Math.floor(Date.now() / 1000),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    
    // Update active conversation
    setActiveConversation(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      lastMessage: newMessage,
      lastMessageTime: Math.floor(Date.now() / 1000),
    }));

    setNewMessage('');
  };

  const handleStartNewChat = async (e) => {
    e.preventDefault();
    
    if (!recipientAddress.trim()) {
      toast.error('Please enter a recipient address');
      return;
    }

    if (recipientAddress.toLowerCase() === currentAccount?.toLowerCase()) {
      toast.error('You cannot message yourself');
      return;
    }

    setLoading(true);
    try {
      // Check if conversation already exists
      const existingConv = conversations.find(conv => 
        conv.participants.includes(recipientAddress.toLowerCase())
      );

      if (existingConv) {
        setActiveConversation(existingConv);
        setShowNewChatModal(false);
        setRecipientAddress('');
        toast.success('Conversation found');
      } else {
        // Create new conversation
        const newConversation = {
          id: Date.now().toString(),
          participants: [currentAccount, recipientAddress],
          messages: [],
          lastMessage: '',
          lastMessageTime: Math.floor(Date.now() / 1000),
          createdAt: Math.floor(Date.now() / 1000),
        };

        const updatedConversations = [newConversation, ...conversations];
        setConversations(updatedConversations);
        localStorage.setItem('conversations', JSON.stringify(updatedConversations));
        
        setActiveConversation(newConversation);
        setShowNewChatModal(false);
        setRecipientAddress('');
        toast.success('Conversation started');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Messages</h1>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            + New Message
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">Conversations</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No conversations yet</p>
                    <button
                      onClick={() => setShowNewChatModal(true)}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Start your first conversation
                    </button>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const otherParticipant = conv.participants.find(p => p.toLowerCase() !== currentAccount?.toLowerCase());
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConversation(conv)}
                        className={`p-4 cursor-pointer transition-colors ${
                          activeConversation?.id === conv.id
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {otherParticipant?.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {otherParticipant?.substring(0, 6)}...{otherParticipant?.substring(38)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {conv.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {conv.lastMessageTime ? formatTimestamp(conv.lastMessageTime) : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden h-[600px] flex flex-col">
              {!activeConversation ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Select a conversation to start messaging</p>
                    <button
                      onClick={() => setShowNewChatModal(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Start New Conversation
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {activeConversation.participants.find(p => p.toLowerCase() !== currentAccount?.toLowerCase())?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {activeConversation.participants.find(p => p.toLowerCase() !== currentAccount?.toLowerCase())?.substring(0, 6)}...{activeConversation.participants.find(p => p.toLowerCase() !== currentAccount?.toLowerCase())?.substring(38)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activeConversation.messages.length} messages
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeConversation.messages.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      activeConversation.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender.toLowerCase() === currentAccount?.toLowerCase() ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            msg.sender.toLowerCase() === currentAccount?.toLowerCase()
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}>
                            <p className="text-sm">{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.sender.toLowerCase() === currentAccount?.toLowerCase() ? 'text-blue-100' : 'text-gray-500'}`}>
                              {formatTimestamp(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSendMessage} className="space-y-3">
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() && !voiceBlob}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Send
                        </button>
                      </div>
                      
                      {voiceBlob && (
                        <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🎤</span>
                            <span className="text-sm text-purple-700 dark:text-purple-400 font-medium">Voice message ready to send</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setVoiceBlob(null)}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      
                      <VoiceRecorder onRecordingComplete={handleVoiceRecordingComplete} />
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Start New Conversation</h2>
            <form onSubmit={handleStartNewChat}>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Recipient Address</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter wallet address"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Enter the wallet address of the user you want to message
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewChatModal(false);
                    setRecipientAddress('');
                  }}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? 'Starting...' : 'Start Chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
