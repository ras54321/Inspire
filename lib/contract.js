import { ethers } from 'ethers';
import { CONTRACT_ABI } from './contractABI';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

if (typeof window !== 'undefined' && !CONTRACT_ADDRESS) {
  console.error('NEXT_PUBLIC_CONTRACT_ADDRESS is not defined in environment variables');
}

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

export const getReadOnlyContract = async () => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }
  
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );
    return contract;
  } catch (error) {
    console.error('Error creating read-only contract instance:', error);
    throw error;
  }
};

// User Functions
export const createUser = async (username, bio, avatarIpfsHash, signer) => {
  try {
    const contract = await getContract(signer);
    
    // Check if contract is paused
    const isPaused = await contract.paused();
    if (isPaused) {
      throw new Error('Contract is currently paused. Please try again later.');
    }
    
    console.log('Creating user with params:', { username, bio, avatarIpfsHash });
    const tx = await contract.createUser(username, bio, avatarIpfsHash);
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    return tx;
  } catch (error) {
    console.error('Error creating user:', error);
    
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
    console.error('Error getting total posts:', error);
    throw error;
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
