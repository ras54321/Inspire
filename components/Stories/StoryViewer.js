import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const StoryViewer = ({ stories, onClose, currentAddress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [storyContent, setStoryContent] = useState('');
  const [storyImage, setStoryImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showStoryModal) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 50); // 5 seconds per story
      return () => clearInterval(interval);
    }
  }, [showStoryModal, currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleClose = () => {
    setShowStoryModal(false);
    setCurrentIndex(0);
    setProgress(0);
    onClose();
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    
    if (!storyContent.trim() && !storyImage) {
      toast.error('Please add content or image to your story');
      return;
    }

    setLoading(true);
    try {
      const newStory = {
        id: Date.now().toString(),
        author: currentAddress,
        content: storyContent,
        image: storyImage,
        createdAt: Math.floor(Date.now() / 1000),
        expiresAt: Math.floor(Date.now() / 1000) + 86400, // 24 hours
        viewers: [],
      };

      const savedStories = JSON.parse(localStorage.getItem('stories') || '[]');
      const updatedStories = [newStory, ...savedStories];
      localStorage.setItem('stories', JSON.stringify(updatedStories));

      setStoryContent('');
      setStoryImage(null);
      setShowCreateModal(false);
      toast.success('Story created successfully!');
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error('Failed to create story');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentStory = stories[currentIndex];
  const isMyStory = currentStory?.author?.toLowerCase() === currentAddress?.toLowerCase();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Stories</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            + Add Story
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {/* Add Story Button */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="flex-shrink-0 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 border-2 border-dashed border-gray-400 dark:border-gray-500 flex items-center justify-center hover:border-blue-500 transition-colors">
              <span className="text-3xl">+</span>
            </div>
            <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-2">Add Story</p>
          </div>

          {/* Stories List */}
          {stories.length === 0 ? (
            <div className="flex-shrink-0 w-20">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">No stories yet</p>
            </div>
          ) : (
            stories.map((story, index) => {
              const isExpired = story.expiresAt < Math.floor(Date.now() / 1000);
              if (isExpired) return null;
              
              return (
                <div
                  key={story.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    setShowStoryModal(true);
                  }}
                  className="flex-shrink-0 cursor-pointer"
                >
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 ${
                      story.viewers.includes(currentAddress?.toLowerCase())
                        ? 'border-gray-300 dark:border-gray-600'
                        : 'border-blue-500'
                    } flex items-center justify-center overflow-hidden`}>
                      {story.image ? (
                        <img src={story.image} alt="Story" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">📖</span>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 rounded-full p-1">
                      <p className="text-white text-xs text-center truncate">
                        {story.author ? story.author.substring(0, 4) : 'User'}...
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-2">
                    {formatTimestamp(story.createdAt)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Story Modal */}
      {showStoryModal && currentStory && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="relative w-full max-w-lg h-[80vh] bg-gray-900 rounded-2xl overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 p-2 flex space-x-1">
              {stories.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full ${
                    index < currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                >
                  {index === currentIndex && (
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Story Content */}
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                {currentStory.author ? currentStory.author.substring(0, 2).toUpperCase() : 'U'}
              </div>
              <p className="text-white text-sm mb-6">
                {currentStory.author ? `${currentStory.author.substring(0, 6)}...${currentStory.author.substring(38)}` : 'Unknown User'}
              </p>

              {currentStory.image && (
                <img src={currentStory.image} alt="Story" className="max-w-full max-h-[50vh] rounded-xl mb-4" />
              )}

              {currentStory.content && (
                <p className="text-white text-lg text-center whitespace-pre-wrap">
                  {currentStory.content}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white text-2xl z-10 hover:text-gray-300"
            >
              ✕
            </button>

            {/* Navigation */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl z-10 hover:text-gray-300"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl z-10 hover:text-gray-300"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create Story</h2>
            <form onSubmit={handleCreateStory}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Content (optional)</label>
                <textarea
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  placeholder="What's your story?"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all"
                  rows={3}
                  disabled={loading}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Add Image (optional)</label>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400
                    hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                    file:transition-colors cursor-pointer"
                  disabled={loading}
                />
                {storyImage && (
                  <img src={storyImage} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-xl" />
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setStoryContent('');
                    setStoryImage(null);
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
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
};

export default StoryViewer;
