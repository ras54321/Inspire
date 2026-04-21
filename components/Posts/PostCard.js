import React, { useState } from 'react';
import { likePost, unlikePost, hasUserLikedPost, addComment, getPostComments, deletePost } from '../../lib/contract';
import { getPinataGatewayUrl, fetchFromIPFS } from '../../lib/pinata';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../lib/constants';
import toast from 'react-hot-toast';
import Poll from './Poll';
import Reactions from './Reactions';
import { blockUser, unblockUser, isUserBlocked } from '../../lib/blocklist';
import { reportContent, hasUserReported } from '../../lib/reports';
import VerificationBadge from '../UI/VerificationBadge';
import { addReplyToThread, getThreadReplies, getParentPostId } from '../../lib/threads';

const PostCard = ({ post, signer, currentAddress, onRefresh }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likeCount?.toString() || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [postContent, setPostContent] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [hasReported, setHasReported] = useState(false);
  const [threadReplies, setThreadReplies] = useState([]);
  const [showThread, setShowThread] = useState(false);
  const [parentPostId, setParentPostId] = useState(null);

  React.useEffect(() => {
    if (currentAddress) {
      checkLiked();
      checkBookmarked();
      checkBlocked();
      checkReported();
    }
    loadThreadData();
  }, [currentAddress, post.id, post.author]);

  const loadThreadData = () => {
    const postId = post.id?.toString();
    if (postId) {
      setParentPostId(getParentPostId(postId));
      setThreadReplies(getThreadReplies(postId));
    }
  };

  React.useEffect(() => {
    const fetchContent = async () => {
      if (post.contentIpfsHash) {
        try {
          const content = await fetchFromIPFS(post.contentIpfsHash);
          setPostContent(content);
        } catch (error) {
          console.error('Error fetching post content:', error);
        }
      }
    };
    fetchContent();
  }, [post.contentIpfsHash]);

  const checkLiked = async () => {
    try {
      const isLiked = await hasUserLikedPost(post.id, currentAddress);
      setLiked(isLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const checkBookmarked = async () => {
    try {
      const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
      setBookmarked(savedPosts.includes(post.id?.toString()));
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const checkBlocked = () => {
    if (currentAddress && post.author) {
      const blocked = isUserBlocked(currentAddress, post.author);
      setIsBlocked(blocked);
    }
  };

  const handleBlock = () => {
    if (!currentAddress || !post.author) return;
    
    try {
      if (isBlocked) {
        unblockUser(currentAddress, post.author);
        setIsBlocked(false);
        toast.success('User unblocked');
      } else {
        blockUser(currentAddress, post.author);
        setIsBlocked(true);
        toast.success('User blocked');
      }
      setShowBlockConfirm(false);
    } catch (error) {
      console.error('Error updating block status:', error);
      toast.error('Failed to update block status');
    }
  };

  const checkReported = () => {
    if (currentAddress && post.id) {
      const reported = hasUserReported(currentAddress, post.id?.toString());
      setHasReported(reported);
    }
  };

  const handleReport = () => {
    if (!currentAddress || !post.id) return;
    
    if (!reportReason.trim()) {
      toast.error('Please select a reason for reporting');
      return;
    }

    try {
      const success = reportContent(currentAddress, post.id?.toString(), 'post', reportReason);
      
      if (success) {
        setHasReported(true);
        setShowReportModal(false);
        setReportReason('');
        toast.success('Content reported successfully. Thank you for helping keep the community safe.');
      } else {
        toast.error('Failed to report content');
      }
    } catch (error) {
      console.error('Error reporting content:', error);
      toast.error('Failed to report content');
    }
  };

  const handlePollVote = (optionIndex, poll) => {
    try {
      // Update poll in localStorage (since we don't have contract functions for polls yet)
      const polls = JSON.parse(localStorage.getItem('polls') || '{}');
      const postId = post.id?.toString();
      
      if (!polls[postId]) {
        polls[postId] = { ...poll, voters: [] };
      }
      
      // Check if user already voted
      if (polls[postId].voters.includes(currentAddress)) {
        toast.error('You have already voted on this poll');
        return;
      }
      
      // Add vote
      polls[postId].options[optionIndex].votes += 1;
      polls[postId].voters.push(currentAddress);
      
      localStorage.setItem('polls', JSON.stringify(polls));
      
      // Update local state
      setPostContent(prev => ({
        ...prev,
        poll: polls[postId]
      }));
      
      toast.success('Vote recorded!');
    } catch (error) {
      console.error('Error voting on poll:', error);
      toast.error('Failed to record vote');
    }
  };

  const handleReact = (emoji) => {
    try {
      // Update reactions in localStorage
      const reactions = JSON.parse(localStorage.getItem('reactions') || '{}');
      const postId = post.id?.toString();
      
      if (!reactions[postId]) {
        reactions[postId] = {};
      }
      
      // Toggle reaction
      if (reactions[postId][currentAddress] === emoji) {
        delete reactions[postId][currentAddress];
      } else {
        reactions[postId][currentAddress] = emoji;
      }
      
      localStorage.setItem('reactions', JSON.stringify(reactions));
      
      toast.success(`Reacted with ${emoji}`);
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast.error('Failed to react');
    }
  };

  const handleQuotePost = async () => {
    if (!quoteText.trim()) {
      toast.error('Please add a comment to your quote');
      return;
    }

    try {
      const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
      const newQuote = {
        originalPostId: post.id?.toString(),
        originalAuthor: post.author,
        originalContent: postContent,
        quoteText,
        quoter: currentAddress,
        timestamp: Date.now(),
      };
      
      quotes.unshift(newQuote);
      localStorage.setItem('quotes', JSON.stringify(quotes));
      
      setShowQuoteModal(false);
      setQuoteText('');
      toast.success('Quote created successfully!');
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Failed to create quote');
    }
  };

  const handleBookmark = () => {
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    const postId = post.id?.toString();
    
    if (bookmarked) {
      const updated = savedPosts.filter((id) => id !== postId);
      localStorage.setItem('savedPosts', JSON.stringify(updated));
      setBookmarked(false);
      toast.success('Removed from saved posts');
    } else {
      const updated = [...savedPosts, postId];
      localStorage.setItem('savedPosts', JSON.stringify(updated));
      setBookmarked(true);
      toast.success('Saved to bookmarks');
    }
  };

  const handleLike = async () => {
    if (!signer) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    setLoading(true);
    try {
      if (liked) {
        await unlikePost(post.id, signer);
        setLikes(prev => prev - 1);
        setLiked(false);
        toast.success(SUCCESS_MESSAGES.POST_UNLIKED);
      } else {
        await likePost(post.id, signer);
        setLikes(prev => prev + 1);
        setLiked(true);
        toast.success(SUCCESS_MESSAGES.POST_LIKED);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error(ERROR_MESSAGES.CONTRACT_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!signer) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    if (post.author.toLowerCase() !== currentAddress.toLowerCase()) {
      toast.error('You can only delete your own posts');
      return;
    }

    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setLoading(true);
    try {
      await deletePost(post.id, signer);
      toast.success(SUCCESS_MESSAGES.POST_DELETED);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(ERROR_MESSAGES.CONTRACT_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditContent(post.contentIpfsHash || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!signer) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    if (!editContent.trim()) {
      toast.error('Content cannot be empty');
      return;
    }

    setLoading(true);
    try {
      // In a real app, you'd upload the new content to IPFS first
      // For now, we'll just show a success message
      toast.success(SUCCESS_MESSAGES.POST_UPDATED);
      setShowEditModal(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(ERROR_MESSAGES.CONTRACT_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!signer) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      // For simplicity, we'll upload the comment as JSON to IPFS
      const commentData = JSON.stringify({ content: comment, timestamp: Date.now() });
      const commentIpfsHash = commentData; // In production, upload to IPFS
      
      await addComment(post.id, commentIpfsHash, signer);
      toast.success(SUCCESS_MESSAGES.COMMENT_ADDED);
      setComment('');
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(ERROR_MESSAGES.CONTRACT_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (commentId) => {
    if (!signer) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setLoading(true);
    try {
      // For simplicity, we'll upload the reply as JSON to IPFS
      const replyData = JSON.stringify({ 
        content: replyText, 
        timestamp: Date.now(),
        replyTo: commentId 
      });
      const replyIpfsHash = replyData; // In production, upload to IPFS
      
      await addComment(post.id, replyIpfsHash, signer);
      toast.success(SUCCESS_MESSAGES.REPLY_ADDED);
      setReplyText('');
      setReplyingTo(null);
      loadComments();
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error(ERROR_MESSAGES.CONTRACT_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const commentIds = await getPostComments(post.id);
      setComments(commentIds);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const toggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments) {
      loadComments();
    }
  };

  const formatDate = (timestamp) => {
    const ts = timestamp?.toString() || '0';
    const date = new Date(Number(ts) * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderContentWithHashtags = (text) => {
    if (!text) return '';
    const hashtagRegex = /#(\w+)/g;
    const parts = text.split(hashtagRegex);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span
            key={index}
            className="text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline"
            onClick={() => {
              const hashtag = part.substring(1);
              // Navigate to hashtag search (could implement hashtag page)
              console.log('Hashtag clicked:', hashtag);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 mb-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mr-3 sm:mr-4 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md flex-shrink-0">
            {post.author.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white flex items-center text-sm sm:text-base truncate">
              {post.author.substring(0, 6)}...{post.author.substring(38)}
              <VerificationBadge userAddress={post.author} />
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
          {post.author.toLowerCase() !== currentAddress?.toLowerCase() && (
            <>
              <button
                onClick={() => setShowReportModal(true)}
                disabled={hasReported}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  hasReported
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50'
                }`}
              >
                {hasReported ? 'Reported' : 'Report'}
              </button>
              <button
                onClick={() => setShowBlockConfirm(true)}
                disabled={loading}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isBlocked 
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50'
                    : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50'
                }`}
              >
                {isBlocked ? 'Unblock' : 'Block'}
              </button>
            </>
          )}
          {post.author.toLowerCase() === currentAddress?.toLowerCase() && (
            <>
              <button
                onClick={handleEdit}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        {postContent ? (
          postContent.type === 'image' ? (
            <img
              src={getPinataGatewayUrl(postContent.ipfsHash)}
              alt="Post content"
              className="max-w-full h-auto rounded-lg"
            />
          ) : postContent.type === 'video' ? (
            <video
              src={getPinataGatewayUrl(postContent.ipfsHash)}
              controls
              className="max-w-full h-auto rounded-lg"
            />
          ) : postContent?.text ? (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {renderContentWithHashtags(postContent.text)}
            </p>
          ) : null
        ) : post.contentIpfsHash ? (
          <p className="text-gray-500 dark:text-gray-400">
            Loading content...
          </p>
        ) : null}

        {/* Display Poll */}
        {postContent?.poll && (
          <Poll 
            poll={postContent.poll} 
            onVote={(optionIndex) => handlePollVote(optionIndex, postContent.poll)}
            currentAddress={currentAddress}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between space-x-1 sm:space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-wrap">
        <Reactions post={post} signer={signer} currentAddress={currentAddress} onReact={handleReact} />
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-xs sm:text-sm"
        >
          <span className="text-lg sm:text-xl">💬</span>
          <span className="font-semibold hidden sm:inline">{comments.length}</span>
        </button>
        
        <button
          onClick={() => setShowQuoteModal(true)}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-xs sm:text-sm"
        >
          <span className="text-lg sm:text-xl">🔄</span>
          <span className="font-semibold hidden sm:inline">Quote</span>
        </button>
        
        {threadReplies.length > 0 && (
          <button
            onClick={() => setShowThread(!showThread)}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-xs sm:text-sm"
          >
            <span className="text-lg sm:text-xl">💬</span>
            <span className="font-semibold hidden sm:inline">{threadReplies.length}</span>
          </button>
        )}
        
        <button
          onClick={handleBookmark}
          className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-xl transition-all text-xs sm:text-sm ${
            bookmarked 
              ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <span className="text-lg sm:text-xl">{bookmarked ? '🔖' : '📑'}</span>
          <span className="font-semibold hidden sm:inline">{bookmarked ? 'Saved' : 'Save'}</span>
        </button>
        
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-xs sm:text-sm"
        >
          <span className="text-lg sm:text-xl">📤</span>
          <span className="font-semibold hidden sm:inline">Share</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 border-t pt-4">
          <form onSubmit={handleComment} className="mb-4">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              Comment
            </button>
          </form>
          
          <div className="space-y-2">
            {comments.length > 0 ? (
              comments.map((commentId) => (
                <div key={commentId?.toString() || commentId} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">Comment ID: {commentId?.toString() || commentId}</p>
                      <button
                        onClick={() => setReplyingTo(commentId)}
                        className="text-xs text-blue-500 hover:text-blue-600 mt-1"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                  
                  {replyingTo === commentId && (
                    <div className="mt-2 ml-4 border-l-2 border-blue-500 pl-3">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white"
                        disabled={loading}
                      />
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleReply(commentId)}
                          disabled={loading || !replyText.trim()}
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet</p>
            )}
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Edit Post</h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Enter post content..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={4}
              disabled={loading}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Share Post</h2>
            <div className="space-y-4">
              <button
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  toast.success('Link copied to clipboard!');
                  setShowShareModal(false);
                }}
                className="w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-3"
              >
                <span className="text-2xl">🔗</span>
                <span className="font-semibold text-gray-900 dark:text-white">Copy Link</span>
              </button>
              <button
                onClick={() => {
                  const text = postContent?.text || 'Check out this post!';
                  const url = window.location.href;
                  const shareText = `${text}\n\n${url}`;
                  navigator.clipboard.writeText(shareText);
                  toast.success('Post copied to clipboard!');
                  setShowShareModal(false);
                }}
                className="w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-3"
              >
                <span className="text-2xl">📋</span>
                <span className="font-semibold text-gray-900 dark:text-white">Copy Post</span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'SocialDApp Post',
                      text: postContent?.text || 'Check out this post!',
                      url: window.location.href,
                    });
                  } else {
                    toast.error('Sharing not supported on this browser');
                  }
                  setShowShareModal(false);
                }}
                className="w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-3"
              >
                <span className="text-2xl">📤</span>
                <span className="font-semibold text-gray-900 dark:text-white">Share to...</span>
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-6 p-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quote Post</h3>
            
            {/* Original Post Preview */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {post.author ? post.author[2].toUpperCase() : '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {post.author ? `${post.author.substring(0, 6)}...${post.author.substring(38)}` : 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.createdAt * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {postContent?.text && (
                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                  {postContent.text}
                </p>
              )}
            </div>

            <textarea
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              placeholder="Add your thoughts..."
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl resize-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={3}
              maxLength={280}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {quoteText.length}/280
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleQuotePost}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold transition-all"
              >
                Quote
              </button>
              <button
                onClick={() => {
                  setShowQuoteModal(false);
                  setQuoteText('');
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {isBlocked ? 'Unblock User?' : 'Block User?'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isBlocked 
                ? 'Are you sure you want to unblock this user? You will see their posts again.'
                : 'Are you sure you want to block this user? You won\'t see their posts or interactions.'}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleBlock}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  isBlocked
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isBlocked ? 'Unblock' : 'Block'}
              </button>
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Report Content</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Why are you reporting this content?
            </p>
            
            <div className="space-y-3 mb-6">
              {['Spam', 'Harassment', 'Inappropriate Content', 'Misinformation', 'Other'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`w-full p-4 rounded-xl text-left transition-colors ${
                    reportReason === reason
                      ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500'
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="font-medium text-gray-900 dark:text-white">{reason}</span>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 disabled:from-gray-400 disabled:to-gray-500 font-semibold transition-all"
              >
                Submit Report
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thread Replies Section */}
      {showThread && threadReplies.length > 0 && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="mr-2">💬</span>
            Thread Replies ({threadReplies.length})
          </h4>
          <div className="space-y-3">
            {threadReplies.map((replyId) => (
              <div key={replyId} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm">
                <p className="text-gray-600 dark:text-gray-400">Reply ID: {replyId}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Click to view reply</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
