# Inspire - Decentralized Social Media Platform

A modern, decentralized social media platform built on Ethereum. Create profiles, share posts, follow users, join groups, and connect with the Web3 community - all powered by smart contracts.

[Inspire](https://inspire-snowy.vercel.app)

## ✨ Features

- **User Profiles** - Blockchain-based identity with customizable avatars
- **Social Feed** - Create, like, and comment on posts
- **Groups** - Join and create community groups
- **Direct Messaging** - Private messages between users
- **Admin Panel** - Contract management and moderation tools
- **Responsive Design** - Works seamlessly on all devices
- **Dark Mode** - Built-in theme support

## 🛠 Tech Stack

- **Frontend**: Next.js 13, React 18, Tailwind CSS
- **Blockchain**: Ethereum (Sepolia Testnet), Ethers.js v5
- **Wallet**: RainbowKit, Wagmi
- **Storage**: IPFS via Pinata
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask wallet
- Pinata account (for IPFS)
- WalletConnect Project ID

### Installation

```bash
# Clone the repository
git clone https://github.com/ras54321/Inspire.git
cd Inspire

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0xAC354667A5CcCE57095B7aB7B230efa1E224C55E
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
```

### Running Locally

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
├── components/     # React components
├── lib/           # Contract & utility functions
├── pages/         # Next.js pages
├── styles/        # Global CSS
└── web3/          # Smart contract files
```

## 🔗 Live Demo

**Deployed on Vercel**: [https://inspire-snowy.vercel.app](https://inspire-snowy.vercel.app)

## 📝 Smart Contract

- **Network**: Sepolia Testnet
- **Contract**: `0xAC354667A5CcCE57095B7aB7B230efa1E224C55E`
- **Solidity**: `^0.8.19`

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Wallet won't connect | Ensure MetaMask is on Sepolia network |
| Posts not loading | Check contract address in `.env.local` |
| IPFS upload fails | Verify Pinata API keys |
| Build errors | Run `npm install` to update dependencies |

## 📄 License

MIT License - feel free to use and modify!

---

Built with ❤️ on Ethereum
