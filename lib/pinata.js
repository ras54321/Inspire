import { config } from './config';
import { APP_CONSTANTS, ERROR_MESSAGES } from './constants';

const PINATA_API_KEY = config.pinataApiKey;
const PINATA_SECRET_API_KEY = config.pinataSecretApiKey;
const PINATA_JWT = config.pinataJwt;
const PINATA_GATEWAY = config.pinataGateway;

export const uploadToPinata = async (file) => {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
    }

    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
    }

    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
};

export const uploadJSONToPinata = async (jsonData) => {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name: `social-dapp-${Date.now()}`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
    }

    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw error;
  }
};

export const getPinataGatewayUrl = (ipfsHash) => {
  return `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
};

export const validateFile = (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > APP_CONSTANTS.MAX_FILE_SIZE) {
    throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
  }

  const isImage = APP_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = APP_CONSTANTS.ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
  }

  return true;
};

export const uploadPostContent = async (content, file = null, poll = null) => {
  try {
    let contentHash;

    if (file) {
      validateFile(file);
      contentHash = await uploadToPinata(file);
    } else {
      contentHash = await uploadJSONToPinata({
        content,
        poll,
        timestamp: Date.now(),
      });
    }

    return contentHash;
  } catch (error) {
    console.error('Error uploading post content:', error);
    throw error;
  }
};

export const uploadUserProfile = async (username, bio, avatarFile = null) => {
  try {
    let avatarHash = '';

    if (avatarFile) {
      validateFile(avatarFile);
      avatarHash = await uploadToPinata(avatarFile);
    }

    const profileData = {
      username,
      bio,
      avatarIpfsHash: avatarHash,
      timestamp: Date.now(),
    };

    return profileData;
  } catch (error) {
    console.error('Error uploading user profile:', error);
    throw error;
  }
};

export const fetchFromIPFS = async (ipfsHash) => {
  try {
    const gatewayUrl = getPinataGatewayUrl(ipfsHash);
    const response = await fetch(gatewayUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from IPFS');
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.startsWith('image/')) {
      return {
        type: 'image',
        ipfsHash,
      };
    } else if (contentType && contentType.startsWith('video/')) {
      return {
        type: 'video',
        ipfsHash,
      };
    } else {
      // Try to parse as JSON first (for text posts)
      try {
        const data = await response.json();
        if (data.content) {
          return {
            type: 'text',
            text: data.content,
          };
        }
        return {
          type: 'text',
          text: JSON.stringify(data),
        };
      } catch (e) {
        // If not JSON, treat as plain text
        const text = await response.text();
        return {
          type: 'text',
          text: text,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    return null;
  }
};
