const ethers = require('ethers');

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth_sepolia/0931fdc95c659494b3859dc8e59a8b371def04168f59d9f243ab4e98637f6127');

const abi = [{"inputs":[],"name":"getTotalPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

const contract = new ethers.Contract('0xAC354667A5CcCE57095B7aB7B230efa1E224C55E', abi, provider);

async function test() {
  try {
    const result = await contract.getTotalPosts();
    console.log('Contract works! Total posts:', result.toString());
  } catch (e) {
    console.log('Contract error:', e.message);
    console.log('Code:', e.code);
  }
}

test();
