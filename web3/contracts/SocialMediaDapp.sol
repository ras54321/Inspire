// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SocialMediaDapp is ReentrancyGuard, Ownable, Pausable {
    
    // Structs
    struct User {
        string username;
        string bio;
        string avatarIpfsHash;
        uint256 followerCount;
        uint256 followingCount;
        uint256 postCount;
        bool exists;
        uint256 createdAt;
    }

    struct Post {
        uint256 id;
        address author;
        string contentIpfsHash;
        uint256 likeCount;
        uint256 commentCount;
        uint256 createdAt;
        bool exists;
    }

    struct Comment {
        uint256 id;
        uint256 postId;
        address author;
        string contentIpfsHash;
        uint256 createdAt;
        bool exists;
    }

    // State variables
    uint256 private postCounter;
    uint256 private commentCounter;
    
    mapping(address => User) public users;
    mapping(address => address[]) public followingList;
    mapping(address => address[]) public followersList;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => Comment) public comments;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    mapping(address => uint256[]) public userPosts;
    mapping(uint256 => uint256[]) public postComments;

    // Events
    event UserCreated(address indexed userAddress, string username, uint256 timestamp);
    event UserUpdated(address indexed userAddress, string username, string bio, string avatarIpfsHash);
    event PostCreated(uint256 indexed postId, address indexed author, string contentIpfsHash, uint256 timestamp);
    event PostDeleted(uint256 indexed postId, address indexed author);
    event PostLiked(uint256 indexed postId, address indexed liker, uint256 timestamp);
    event PostUnliked(uint256 indexed postId, address indexed unliker);
    event CommentAdded(uint256 indexed commentId, uint256 indexed postId, address indexed author, string contentIpfsHash, uint256 timestamp);
    event UserFollowed(address indexed follower, address indexed followed, uint256 timestamp);
    event UserUnfollowed(address indexed follower, address indexed unfollowed);

    // Modifiers
    modifier userExists(address _user) {
        require(users[_user].exists, "User does not exist");
        _;
    }

    modifier postExists(uint256 _postId) {
        require(posts[_postId].exists, "Post does not exist");
        _;
    }

    // User Functions
    function createUser(string memory _username, string memory _bio, string memory _avatarIpfsHash) 
        external 
        whenNotPaused 
    {
        require(!users[msg.sender].exists, "User already exists");
        require(bytes(_username).length > 0, "Username cannot be empty");

        users[msg.sender] = User({
            username: _username,
            bio: _bio,
            avatarIpfsHash: _avatarIpfsHash,
            followerCount: 0,
            followingCount: 0,
            postCount: 0,
            exists: true,
            createdAt: block.timestamp
        });

        emit UserCreated(msg.sender, _username, block.timestamp);
    }

    function updateUserProfile(string memory _username, string memory _bio, string memory _avatarIpfsHash) 
        external 
        userExists(msg.sender) 
        whenNotPaused 
    {
        require(bytes(_username).length > 0, "Username cannot be empty");

        users[msg.sender].username = _username;
        users[msg.sender].bio = _bio;
        users[msg.sender].avatarIpfsHash = _avatarIpfsHash;

        emit UserUpdated(msg.sender, _username, _bio, _avatarIpfsHash);
    }

    // Post Functions
    function createPost(string memory _contentIpfsHash) 
        external 
        userExists(msg.sender) 
        whenNotPaused 
    {
        require(bytes(_contentIpfsHash).length > 0, "Content cannot be empty");

        postCounter++;
        posts[postCounter] = Post({
            id: postCounter,
            author: msg.sender,
            contentIpfsHash: _contentIpfsHash,
            likeCount: 0,
            commentCount: 0,
            createdAt: block.timestamp,
            exists: true
        });

        userPosts[msg.sender].push(postCounter);
        users[msg.sender].postCount++;

        emit PostCreated(postCounter, msg.sender, _contentIpfsHash, block.timestamp);
    }

    function deletePost(uint256 _postId) 
        external 
        postExists(_postId) 
        whenNotPaused 
    {
        require(posts[_postId].author == msg.sender, "Not the post author");

        posts[_postId].exists = false;
        users[msg.sender].postCount--;

        emit PostDeleted(_postId, msg.sender);
    }

    function likePost(uint256 _postId) 
        external 
        postExists(_postId) 
        userExists(msg.sender) 
        whenNotPaused 
    {
        require(!hasLiked[_postId][msg.sender], "Already liked this post");
        require(posts[_postId].author != msg.sender, "Cannot like your own post");

        hasLiked[_postId][msg.sender] = true;
        posts[_postId].likeCount++;

        emit PostLiked(_postId, msg.sender, block.timestamp);
    }

    function unlikePost(uint256 _postId) 
        external 
        postExists(_postId) 
        userExists(msg.sender) 
        whenNotPaused 
    {
        require(hasLiked[_postId][msg.sender], "Have not liked this post");

        hasLiked[_postId][msg.sender] = false;
        posts[_postId].likeCount--;

        emit PostUnliked(_postId, msg.sender);
    }

    // Comment Functions
    function addComment(uint256 _postId, string memory _contentIpfsHash) 
        external 
        postExists(_postId) 
        userExists(msg.sender) 
        whenNotPaused 
    {
        require(bytes(_contentIpfsHash).length > 0, "Comment cannot be empty");

        commentCounter++;
        comments[commentCounter] = Comment({
            id: commentCounter,
            postId: _postId,
            author: msg.sender,
            contentIpfsHash: _contentIpfsHash,
            createdAt: block.timestamp,
            exists: true
        });

        postComments[_postId].push(commentCounter);
        posts[_postId].commentCount++;

        emit CommentAdded(commentCounter, _postId, msg.sender, _contentIpfsHash, block.timestamp);
    }

    // Follow Functions
    function followUser(address _userToFollow) 
        external 
        userExists(msg.sender) 
        userExists(_userToFollow) 
        whenNotPaused 
    {
        require(msg.sender != _userToFollow, "Cannot follow yourself");
        require(!isFollowing(msg.sender, _userToFollow), "Already following this user");

        followingList[msg.sender].push(_userToFollow);
        followersList[_userToFollow].push(msg.sender);

        users[msg.sender].followingCount++;
        users[_userToFollow].followerCount++;

        emit UserFollowed(msg.sender, _userToFollow, block.timestamp);
    }

    function unfollowUser(address _userToUnfollow) 
        external 
        userExists(msg.sender) 
        userExists(_userToUnfollow) 
        whenNotPaused 
    {
        require(isFollowing(msg.sender, _userToUnfollow), "Not following this user");

        // Remove from following list
        for (uint256 i = 0; i < followingList[msg.sender].length; i++) {
            if (followingList[msg.sender][i] == _userToUnfollow) {
                followingList[msg.sender][i] = followingList[msg.sender][followingList[msg.sender].length - 1];
                followingList[msg.sender].pop();
                break;
            }
        }

        // Remove from followers list
        for (uint256 i = 0; i < followersList[_userToUnfollow].length; i++) {
            if (followersList[_userToUnfollow][i] == msg.sender) {
                followersList[_userToUnfollow][i] = followersList[_userToUnfollow][followersList[_userToUnfollow].length - 1];
                followersList[_userToUnfollow].pop();
                break;
            }
        }

        users[msg.sender].followingCount--;
        users[_userToUnfollow].followerCount--;

        emit UserUnfollowed(msg.sender, _userToUnfollow);
    }

    // View Functions
    function getUser(address _userAddress) 
        external 
        view 
        userExists(_userAddress) 
        returns (User memory) 
    {
        return users[_userAddress];
    }

    function getPost(uint256 _postId) 
        external 
        view 
        postExists(_postId) 
        returns (Post memory) 
    {
        return posts[_postId];
    }

    function getComment(uint256 _commentId) 
        external 
        view 
        returns (Comment memory) 
    {
        require(comments[_commentId].exists, "Comment does not exist");
        return comments[_commentId];
    }

    function getUserPosts(address _userAddress) 
        external 
        view 
        userExists(_userAddress) 
        returns (uint256[] memory) 
    {
        return userPosts[_userAddress];
    }

    function getPostComments(uint256 _postId) 
        external 
        view 
        postExists(_postId) 
        returns (uint256[] memory) 
    {
        return postComments[_postId];
    }

    function getFollowers(address _userAddress) 
        external 
        view 
        userExists(_userAddress) 
        returns (address[] memory) 
    {
        return followersList[_userAddress];
    }

    function getFollowing(address _userAddress) 
        external 
        view 
        userExists(_userAddress) 
        returns (address[] memory) 
    {
        return followingList[_userAddress];
    }

    function isFollowing(address _follower, address _followed) 
        public 
        view 
        returns (bool) 
    {
        for (uint256 i = 0; i < followingList[_follower].length; i++) {
            if (followingList[_follower][i] == _followed) {
                return true;
            }
        }
        return false;
    }

    function hasUserLikedPost(uint256 _postId, address _user) 
        external 
        view 
        returns (bool) 
    {
        return hasLiked[_postId][_user];
    }

    function getTotalPosts() external view returns (uint256) {
        return postCounter;
    }

    function getTotalComments() external view returns (uint256) {
        return commentCounter;
    }

    // Admin Functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}

