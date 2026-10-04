import { ethers } from 'ethers';
import { TOKEN_ADDRESS, qualifies } from '../shared/gate.mjs';
let token: ethers.Contract;
export async function checkBalance(wallet: string): Promise<boolean> {
  if (!token) {
    const provider=new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org',8453);
    token=new ethers.Contract(TOKEN_ADDRESS,['function balanceOf(address) view returns (uint256)'],provider);
  }
  // RPC failures propagate: unavailable is not insufficient holdings.
  return qualifies(await token.balanceOf(wallet));
}
