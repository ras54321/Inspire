import React, { useState } from 'react';
import { createPost } from '../../lib/contract';
import { uploadPostContent } from '../../lib/pinata';
import { APP_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../lib/constants';
import toast from 'react-hot-toast';
import EmojiPicker from '../UI/EmojiPicker';
import MentionPicker from '../UI/MentionPicker';

const CreatePost = ({ signer, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState(24); // hours
  const [schedulePost, setSchedulePost] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      try {
        if (selectedFile.size > APP_CONSTANTS.MAX_FILE_SIZE) {
          toast.error(ERROR_MESSAGES.FILE_TOO_LARGE);
          return;
        }
        setFile(selectedFile);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!signer) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    if (!content.trim() && !file && !showPoll) {
      toast.error('Please add content, upload a file, or create a poll');
      return;
    }

    if (showPoll) {
      if (!pollQuestion.trim()) {
        toast.error('Please enter a poll question');
        return;
      }
      const validOptions = pollOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast.error('Please provide at least 2 poll options');
        return;
      }
    }

    if (schedulePost) {
      if (!scheduledDate || !scheduledTime) {
        toast.error('Please select date and time for scheduling');
        return;
      }
      
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      if (scheduledDateTime <= new Date()) {
        toast.error('Scheduled time must be in the future');
        return;
      }
    }

    setLoading(true);

    try {
      // Prepare post data with poll if exists
      const postData = {
        content,
        file,
        poll: showPoll ? {
          question: pollQuestion,
          options: pollOptions.filter(opt => opt.trim()).map(opt => ({ text: opt, votes: 0 })),
          duration: pollDuration,
          voters: [],
          createdAt: Math.floor(Date.now() / 1000),
          expiresAt: Math.floor(Date.now() / 1000) + (pollDuration * 3600)
        } : null,
        scheduledFor: schedulePost ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString() : null
      };

      if (schedulePost) {
        // Save scheduled post to localStorage
        const scheduledPosts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        scheduledPosts.push({
          ...postData,
          signerAddress: await signer.getAddress(),
          createdAt: Date.now()
        });
        localStorage.setItem('scheduledPosts', JSON.stringify(scheduledPosts));
        
        toast.success('Post scheduled successfully!');
      } else {
        // Upload content to IPFS
        const contentIpfsHash = await uploadPostContent(content, file, postData.poll);
        
        // Create post on blockchain
        await createPost(contentIpfsHash, signer);
        
        toast.success(SUCCESS_MESSAGES.POST_CREATED);
      }
      
      // Reset form
      setContent('');
      setFile(null);
      setShowPoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      setPollDuration(24);
      setSchedulePost(false);
      setScheduledDate('');
      setScheduledTime('');
      
      // Callback to refresh posts
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(ERROR_MESSAGES.CONTRACT_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, '']);
    } else {
      toast.error('Maximum 10 poll options allowed');
    }
  };

  const handleRemovePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    } else {
      toast.error('Minimum 2 poll options required');
    }
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleEmojiSelect = (emoji) => {
    setContent(prev => prev + emoji);
  };

  const handleMentionSelect = (mention) => {
    setContent(prev => prev + mention + ' ');
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <span className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-xl mr-3 flex items-center justify-center shadow-lg">
          <span className="text-white text-lg">✨</span>
        </span>
        Create Post
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="relative mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Type @ to mention users..."
            className="w-full p-4 pr-14 border-2 border-gray-200 dark:border-gray-600 rounded-2xl resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
            rows={4}
            maxLength={APP_CONSTANTS.MAX_POST_LENGTH}
          />
          <div className="absolute top-3 right-3">
            <EmojiPicker onSelect={handleEmojiSelect} />
          </div>
        </div>

        {/* Mention Picker */}
        <div className="mb-4">
          <MentionPicker onMentionSelect={handleMentionSelect} currentAddress={signer?.address} />
        </div>

        {/* Schedule Post Toggle */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setSchedulePost(!schedulePost)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              schedulePost
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span className="text-lg">📅</span>
            <span className="font-medium">{schedulePost ? 'Scheduled Post' : 'Schedule Post'}</span>
          </button>
        </div>

        {/* Scheduling UI */}
        {schedulePost && (
          <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Schedule Post</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Add Media (optional)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400
              hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
              file:transition-colors cursor-pointer"
          />
        </div>

        {/* Poll Section */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowPoll(!showPoll)}
            className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            <span>📊</span>
            <span>{showPoll ? 'Remove Poll' : 'Add Poll'}</span>
          </button>
          
          {showPoll && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Poll Question
                </label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="What do you want to ask?"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Options (min 2, max 10)
                </label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handlePollOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(index)}
                        className="text-red-500 hover:text-red-600 font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 10 && (
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    + Add Option
                  </button>
                )}
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Poll Duration
                </label>
                <select
                  value={pollDuration}
                  onChange={(e) => setPollDuration(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value={1}>1 hour</option>
                  <option value={6}>6 hours</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>1 day</option>
                  <option value={48}>2 days</option>
                  <option value={72}>3 days</option>
                  <option value={168}>1 week</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3.5 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? 'Creating...' : '✨ Create Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
