export const APP_CONSTANTS = {
  // App Info
  APP_NAME: 'SocialDApp',
  APP_DESCRIPTION: 'Decentralized Social Media Platform',
  
  // Post Types
  POST_TYPE_TEXT: 'text',
  POST_TYPE_IMAGE: 'image',
  POST_TYPE_VIDEO: 'video',
  
  // File Upload Limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  
  // Pagination
  POSTS_PER_PAGE: 10,
  USERS_PER_PAGE: 20,
  
  // UI
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 500,
  
  // Social
  MAX_BIO_LENGTH: 500,
  MAX_USERNAME_LENGTH: 50,
  MIN_USERNAME_LENGTH: 3,
  MAX_POST_LENGTH: 5000,
};

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  USER_NOT_EXISTS: 'User profile does not exist',
  POST_NOT_EXISTS: 'Post does not exist',
  ALREADY_LIKED: 'You have already liked this post',
  NOT_LIKED: 'You have not liked this post',
  ALREADY_FOLLOWING: 'You are already following this user',
  NOT_FOLLOWING: 'You are not following this user',
  UPLOAD_FAILED: 'Failed to upload file',
  CONTRACT_ERROR: 'Contract error occurred',
  NETWORK_ERROR: 'Network error occurred',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size exceeds limit',
};

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'Profile created successfully',
  USER_UPDATED: 'Profile updated successfully',
  POST_CREATED: 'Post created successfully',
  POST_DELETED: 'Post deleted successfully',
  POST_UPDATED: 'Post updated successfully',
  POST_LIKED: 'Post liked successfully',
  POST_UNLIKED: 'Post unliked successfully',
  COMMENT_ADDED: 'Comment added successfully',
  REPLY_ADDED: 'Reply added successfully',
  USER_FOLLOWED: 'User followed successfully',
  USER_UNFOLLOWED: 'User unfollowed successfully',
  FILE_UPLOADED: 'File uploaded successfully',
};
