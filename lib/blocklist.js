// Blocklist management functions using localStorage

export const blockUser = (blockerAddress, blockedAddress) => {
  try {
    const blocklists = JSON.parse(localStorage.getItem('blocklists') || '{}');
    
    if (!blocklists[blockerAddress]) {
      blocklists[blockerAddress] = [];
    }
    
    if (!blocklists[blockerAddress].includes(blockedAddress)) {
      blocklists[blockerAddress].push(blockedAddress);
      localStorage.setItem('blocklists', JSON.stringify(blocklists));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error blocking user:', error);
    return false;
  }
};

export const unblockUser = (blockerAddress, blockedAddress) => {
  try {
    const blocklists = JSON.parse(localStorage.getItem('blocklists') || '{}');
    
    if (blocklists[blockerAddress]) {
      blocklists[blockerAddress] = blocklists[blockerAddress].filter(
        address => address !== blockedAddress
      );
      localStorage.setItem('blocklists', JSON.stringify(blocklists));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error unblocking user:', error);
    return false;
  }
};

export const isUserBlocked = (blockerAddress, blockedAddress) => {
  try {
    const blocklists = JSON.parse(localStorage.getItem('blocklists') || '{}');
    
    if (blocklists[blockerAddress]) {
      return blocklists[blockerAddress].includes(blockedAddress);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking block status:', error);
    return false;
  }
};

export const getBlockedUsers = (blockerAddress) => {
  try {
    const blocklists = JSON.parse(localStorage.getItem('blocklists') || '{}');
    return blocklists[blockerAddress] || [];
  } catch (error) {
    console.error('Error getting blocked users:', error);
    return [];
  }
};

export const shouldHideContent = (viewerAddress, contentAuthorAddress) => {
  try {
    const blocklists = JSON.parse(localStorage.getItem('blocklists') || '{}');
    
    // Hide if viewer blocked the author
    if (blocklists[viewerAddress]?.includes(contentAuthorAddress)) {
      return true;
    }
    
    // Hide if author blocked the viewer
    if (blocklists[contentAuthorAddress]?.includes(viewerAddress)) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking content visibility:', error);
    return false;
  }
};
