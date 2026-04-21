// Thread management functions using localStorage

export const createThread = (postId, parentPostId) => {
  try {
    const threads = JSON.parse(localStorage.getItem('threads') || '{}');
    
    if (!threads[postId]) {
      threads[postId] = {
        parentPostId,
        replies: [],
        createdAt: Date.now(),
      };
    }
    
    localStorage.setItem('threads', JSON.stringify(threads));
    return true;
  } catch (error) {
    console.error('Error creating thread:', error);
    return false;
  }
};

export const addReplyToThread = (parentPostId, replyPostId) => {
  try {
    const threads = JSON.parse(localStorage.getItem('threads') || '{}');
    
    // Find or create thread for this parent post
    if (!threads[parentPostId]) {
      threads[parentPostId] = {
        parentPostId,
        replies: [],
        createdAt: Date.now(),
      };
    }
    
    // Add reply if not already there
    if (!threads[parentPostId].replies.includes(replyPostId)) {
      threads[parentPostId].replies.push(replyPostId);
    }
    
    localStorage.setItem('threads', JSON.stringify(threads));
    return true;
  } catch (error) {
    console.error('Error adding reply to thread:', error);
    return false;
  }
};

export const getThreadReplies = (parentPostId) => {
  try {
    const threads = JSON.parse(localStorage.getItem('threads') || '{}');
    return threads[parentPostId]?.replies || [];
  } catch (error) {
    console.error('Error getting thread replies:', error);
    return [];
  }
};

export const getParentPostId = (postId) => {
  try {
    const threads = JSON.parse(localStorage.getItem('threads') || '{}');
    return threads[postId]?.parentPostId || null;
  } catch (error) {
    console.error('Error getting parent post ID:', error);
    return null;
  }
};

export const isPartOfThread = (postId) => {
  try {
    const threads = JSON.parse(localStorage.getItem('threads') || '{}');
    return !!threads[postId];
  } catch (error) {
    console.error('Error checking if post is part of thread:', error);
    return false;
  }
};

export const getThreadHierarchy = (postId) => {
  try {
    const threads = JSON.parse(localStorage.getItem('threads') || '{}');
    const hierarchy = [];
    let currentPostId = postId;
    
    while (currentPostId && threads[currentPostId]) {
      hierarchy.unshift(currentPostId);
      currentPostId = threads[currentPostId].parentPostId;
    }
    
    return hierarchy;
  } catch (error) {
    console.error('Error getting thread hierarchy:', error);
    return [];
  }
};
