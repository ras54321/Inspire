# Deploy Smart Contract to Sepolia

## Prerequisites
1. Get Sepolia ETH from https://sepoliafaucet.com
2. Wallet address: 0x934DCB5BcCE7Aa051De304f12120a7562d7371B7

## Deployment Steps

```bash
cd web3
npm install
npx hardhat run scripts/deploy.js --network sepolia
```

## After Deployment

1. Copy the contract address from output
2. Update `.env.local` in root directory:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_NEW_CONTRACT_ADDRESS
   ```
3. Commit and push to GitHub
4. Redeploy on Vercel

## Verify Deployment

Check your contract on Sepolia Etherscan:
https://sepolia.etherscan.io/address/0xYOUR_CONTRACT_ADDRESS
