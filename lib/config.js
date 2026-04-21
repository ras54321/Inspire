export const config = {
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME,
  chainSymbol: process.env.NEXT_PUBLIC_CHAIN_SYMBOL,
  blockExplorer: process.env.NEXT_PUBLIC_BLOCK_EXPLORER,
  platformName: process.env.NEXT_PUBLIC_PLATFORM_NAME,
  
  // Pinata Configuration
  pinataApiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  pinataSecretApiKey: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
  
  // Wallet Connect
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
};

export const validateConfig = () => {
  const requiredFields = [
    'contractAddress',
    'rpcUrl',
    'chainId',
  ];
  
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    console.warn('Missing required environment variables:', missingFields);
  }
  
  return missingFields.length === 0;
};
