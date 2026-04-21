// Verification badge management functions using localStorage

export const verifyUser = (userAddress, verifiedBy) => {
  try {
    const verifiedUsers = JSON.parse(localStorage.getItem('verifiedUsers') || '{}');
    
    verifiedUsers[userAddress] = {
      verified: true,
      verifiedAt: Date.now(),
      verifiedBy, // Admin/mod address who verified
    };
    
    localStorage.setItem('verifiedUsers', JSON.stringify(verifiedUsers));
    
    return true;
  } catch (error) {
    console.error('Error verifying user:', error);
    return false;
  }
};

export const unverifyUser = (userAddress) => {
  try {
    const verifiedUsers = JSON.parse(localStorage.getItem('verifiedUsers') || '{}');
    
    delete verifiedUsers[userAddress];
    localStorage.setItem('verifiedUsers', JSON.stringify(verifiedUsers));
    
    return true;
  } catch (error) {
    console.error('Error unverifying user:', error);
    return false;
  }
};

export const isUserVerified = (userAddress) => {
  try {
    const verifiedUsers = JSON.parse(localStorage.getItem('verifiedUsers') || '{}');
    return !!verifiedUsers[userAddress]?.verified;
  } catch (error) {
    console.error('Error checking verification status:', error);
    return false;
  }
};

export const getVerifiedUsers = () => {
  try {
    const verifiedUsers = JSON.parse(localStorage.getItem('verifiedUsers') || '{}');
    return Object.keys(verifiedUsers);
  } catch (error) {
    console.error('Error getting verified users:', error);
    return [];
  }
};

export const getVerificationInfo = (userAddress) => {
  try {
    const verifiedUsers = JSON.parse(localStorage.getItem('verifiedUsers') || '{}');
    return verifiedUsers[userAddress] || null;
  } catch (error) {
    console.error('Error getting verification info:', error);
    return null;
  }
};
