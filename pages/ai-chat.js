import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: '🤖 Hello! I\'m your AI assistant for Inspire. I can help you with:\n\n• Creating engaging posts\n• Finding trending topics\n• Understanding blockchain features\n• Navigating the platform\n• And much more!\n\nHow can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage) => {
    // Simulated AI responses based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('post') || lowerMessage.includes('create')) {
      return '📝 To create a post:\n\n1. Click on the "Create Post" section at the top\n2. Write your content or add media\n3. Use @ to mention users\n4. Add hashtags with #\n5. You can also add polls, schedule posts, or attach media\n6. Click "Create Post" to publish!\n\nTips for engaging posts:\n• Ask questions to encourage interaction\n• Use trending hashtags\n• Add relevant images or videos\n• Keep it concise and authentic';
    }
    
    if (lowerMessage.includes('group') || lowerMessage.includes('community')) {
      return '👥 Groups in Inspire:\n\n• Create groups around interests\n• Invite members to join\n• Post group-specific content\n• Use group chat for discussions\n\nTo create a group:\n1. Go to Groups page\n2. Click "Create Group"\n3. Add name, description, and image\n4. Set privacy settings\n5. Invite members!\n\nGroups are great for building communities around specific topics.';
    }
    
    if (lowerMessage.includes('message') || lowerMessage.includes('dm') || lowerMessage.includes('chat')) {
      return '💬 Direct Messages:\n\n• Send private messages to other users\n• Share text, images, and voice messages\n• Real-time chat functionality\n\nTo send a DM:\n1. Go to Messages page\n2. Click "New Chat"\n3. Select a user\n4. Start typing!\n\nYou can also record voice messages for more personal communication.';
    }
    
    if (lowerMessage.includes('wallet') || lowerMessage.includes('connect') || lowerMessage.includes('meta')) {
      return '🔗 Wallet Connection:\n\n• Connect with MetaMask or compatible wallet\n• Your wallet address is your identity\n• Sign transactions securely\n\nTo connect:\n1. Click "Connect Wallet" in the header\n2. Approve the connection in your wallet\n3. Your address will be displayed\n\nYour wallet is used for:\n• Creating your profile\n• Posting content\n• Interacting with posts\n• Joining groups';
    }
    
    if (lowerMessage.includes('profile') || lowerMessage.includes('account')) {
      return '👤 Profile Features:\n\n• Custom username and bio\n• Profile picture and banner\n• Verification badge option\n• View your posts and activity\n• Analytics dashboard\n\nTo edit your profile:\n1. Click on your profile picture\n2. Go to "Edit Profile"\n3. Update your information\n4. Save changes\n\nComplete your profile to increase visibility and trust!';
    }
    
    if (lowerMessage.includes('nft') || lowerMessage.includes('token')) {
      return '🎨 NFT & Token Features:\n\n• Create and share NFT content\n• Token-gated communities\n• Blockchain-verified ownership\n\nNFT integration coming soon! Stay tuned for:\n• NFT marketplace\n• Token-gated groups\n• NFT profile pictures\n• Collectible posts';
    }
    
    if (lowerMessage.includes('trend') || lowerMessage.includes('popular')) {
      return '📈 Trending Content:\n\n• Check the "Explore" page for trending posts\n• View trending hashtags in the sidebar\n• Join conversations on popular topics\n\nTo boost engagement:\n• Use trending hashtags\n• Post during peak hours\n• Engage with other users\n• Share valuable content';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return '🆘 I can help you with:\n\n• Creating and managing posts\n• Using groups and communities\n• Sending messages\n• Wallet connection\n• Profile customization\n• Understanding blockchain features\n• Finding trending content\n• And much more!\n\nJust ask me anything about Inspire!';
    }
    
    // Default response
    return `I understand you're asking about "${userMessage}". Here are some things I can help with:\n\n• Creating posts and content\n• Using groups and messages\n• Wallet and profile management\n• Finding trending topics\n• Blockchain features\n\nCould you be more specific about what you'd like to know?`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newMessage = {
      id: messages.length + 1,
      role: 'user',
      content: userMessage
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Generate AI response
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse = await generateAIResponse(userMessage);
      
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: aiResponse
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'How to create a post?', query: 'How to create a post?' },
    { label: 'Join a group', query: 'How do I join a group?' },
    { label: 'Connect wallet', query: 'How do I connect my wallet?' },
    { label: 'Send a message', query: 'How do I send a message?' },
    { label: 'Edit profile', query: 'How do I edit my profile?' },
    { label: 'Trending topics', query: 'What are the trending topics?' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🤖 AI Assistant
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your personal Inspire helper</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Messages Area */}
          <div className="h-[calc(100vh-400px)] min-h-[500px] overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">🤖</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">👤</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInput(action.query)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about Inspire..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 transition-all transform hover:scale-105 disabled:transform-none"
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-blue-200 dark:border-gray-600">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Tips for Better AI Assistance</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Be specific with your questions</li>
                <li>• Use keywords like "post", "group", "wallet", "profile"</li>
                <li>• Ask for step-by-step instructions</li>
                <li>• Request tips and best practices</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIChat;