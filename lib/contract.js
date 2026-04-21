import { ethers } from 'ethers';
import { CONTRACT_ABI } from './contractABI';

// Hardcoded working contract address deployed on Sepolia
const CONTRACT_ADDRESS = '0xAC354667A5CcCE57095B7aB7B230efa1E224C55E';

console.log('Using contract address:', CONTRACT_ADDRESS);

export const getContract = async (signerOrProvider) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }
  
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signerOrProvider
    );
    return contract;
  } catch (error) {
    console.error('Error creating contract instance:', error);
    throw error;
  }
};

// Reliable Sepolia RPC endpoints
const SEPOLIA_RPC_URLS = [
  'https://rpc.ankr.com/eth_sepolia',
  'https://sepolia.drpc.org',
  'https://ethereum-sepolia.publicnode.com',
  'https://sepolia.infura.io/v3/84842078b09946638c03157f83405213'
];

export const getReadOnlyContract = async () => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }
  
  // Try multiple RPC endpoints
  for (const rpcUrl of SEPOLIA_RPC_URLS) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );
      // Test the connection
      await provider.getBlockNumber();
      return contract;
    } catch (error) {
      console.warn(`Failed to connect to ${rpcUrl}, trying next...`);
      continue;
    }
  }
  
  throw new Error('Failed to connect to any Sepolia RPC endpoint');
};

// User Functions
export const createUser = async (username, bio, avatarIpfsHash, signer) => {
  try {
    const contract = await getContract(signer);
    
    console.log('Creating user with params:', { username, bio, avatarIpfsHash });
    const tx = await contract.createUser(username, bio, avatarIpfsHash);
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    return tx;
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle CALL_EXCEPTION - usually means wrong contract address
    if (error.code === 'CALL_EXCEPTION') {
      throw new Error('Smart contract not found at configured address. Please verify the contract is deployed on Sepolia testnet and the address is correct in environment variables.');
    }
    
    // Extract readable error message
    let errorMessage = 'Contract error occurred';
    if (error.reason) {
      errorMessage = error.reason;
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Check for specific revert reasons
    if (errorMessage.includes('User already exists')) {
      errorMessage = 'User already exists. Please use a different wallet or check your existing profile.';
    } else if (errorMessage.includes('Username cannot be empty')) {
      errorMessage = 'Username cannot be empty.';
    }
    
    throw new Error(errorMessage);
  }
};

export const updateUserProfile = async (username, bio, avatarIpfsHash, signer) => {
  try {
    const contract = await getContract(signer);
    const tx = await contract.updateUserProfile(username, bio, avatarIpfsHash);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getUser = async (userAddress) => {
  try {
    const contract = await getReadOnlyContract();
    const user = await contract.getUser(userAddress);
    return user;
  } catch (error) {
    // Check if error is "User does not exist" which is expected for new users
    if (error.reason && error.reason.includes('User does not exist')) {
      return { exists: false };
    }
    // Check for CALL_EXCEPTION which also means user doesn't exist
    if (error.code === 'CALL_EXCEPTION') {
      return { exists: false };
    }
    console.error('Error getting user:', error);
    throw error;
  }
};

// Post Functions
export const createPost = async (contentIpfsHash, signer) => {
  try {
    const contract = await getContract(signer);
    const tx = await contract.createPost(contentIpfsHash);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const deletePost = async (postId, signer) => {
  try {
    const contract = await getContract(signer);
    const tx = await contract.deletePost(postId);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export const getPost = async (postId) => {
  try {
    const contract = await getReadOnlyContract();
    const post = await contract.getPost(postId);
    return post;
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

export const getUserPosts = async (userAddress) => {
  try {
    const contract = await getReadOnlyContract();
    const posts = await contract.getUserPosts(userAddress);
    return posts;
  } catch (error) {
    console.error('Error getting user posts:', error);
    throw error;
  }
};

export const getTotalPosts = async () => {
  try {
    const contract = await getReadOnlyContract();
    const total = await contract.getTotalPosts();
    return total;
  } catch (error) {
    // Return 0 if contract call fails
    if (error.code === 'CALL_EXCEPTION') {
      console.warn('Contract call failed, returning 0 posts');
      return 0;
    }
    console.error('Error getting total posts:', error);
    return 0;
  }
};

// Like Functions
export const likePost = async (postId, signer) => {
  try {
    const contract = await getContract(signer);
    const tx = await contract.likePost(postId);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const unlikePost = async (postId, signer) => {
  try {
    const contract = await getContract(signer);
    const tx = await contract.unlikePost(postId);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

export const hasUserLikedPost = async (postId, userAddress) => {
  try {
    const contract = await getReadOnlyContract();
    const hasLiked = await contract.hasUserLikedPost(postId, userAddress);
    return hasLiked;
  } catch (error) {
    console.error('Error checking if user liked post:', error);
    throw error;
  }
};

// Comment Functions
export const addComment = async (postId, contentIpfsHash, signer) => {
  try {
    const contract = await getContract(signer);
    const tx = await contract.addComment(postId, contentIpfsHash);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getComment = async (commentId) => {
  try {
    const contract = await getReadOnlyContract();
    const comment = await contract.getComment(commentId);
    return comment;
  } catch (error) {
    console.error('Error getting comment:', error);
    throw error;
  }
};

export const getPostComments = async (postId) => {
  try {
    const contract = await getReadOnlyContract();
    const comments = await contract.getPostComments(postId);
    return comments;
  } catch (error) {
    console.error('Error getting post comments:', error);
    throw error;
  }
};

export const getTotalComments = async () => {
  try {
    const contract = await getReadOnlyContract();
    const total = await contract.getTotalComments();
    return total;
  } catch (error) {
    console.error('Error getting total comments:', error);
    throw error;
  }
};

// Follow Functions
export const followUser = async (userToFollow, signer) => {
  try {
    const contract = await getContract(signer);
    const tx = await contract.followUser(userToFollow);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (userToUnfollow, signer) => {
  try {
    const contract = await getContract(signer);
    const tx = await contract.unfollowUser(userToUnfollow);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const isFollowing = async (follower, followed) => {
  try {
    const contract = await getReadOnlyContract();
    const following = await contract.isFollowing(follower, followed);
    return following;
  } catch (error) {
    console.error('Error checking if following:', error);
    throw error;
  }
};

export const getFollowers = async (userAddress) => {
  try {
    const contract = await getReadOnlyContract();
    const followers = await contract.getFollowers(userAddress);
    return followers;
  } catch (error) {
    console.error('Error getting followers:', error);
    throw error;
  }
};

export const getFollowing = async (userAddress) => {
  try {
    const contract = await getReadOnlyContract();
    const following = await contract.getFollowing(userAddress);
    return following;
  } catch (error) {
    console.error('Error getting following:', error);
    throw error;
  }
};

// Helper function to check if user exists
export const userExists = async (userAddress) => {
  try {
    const user = await getUser(userAddress);
    return user.exists;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
};
