# Premium Token Portfolio Viewer

This React application displays a wallet's ETH and popular ERC‑20 token balances with current USD prices. It also shows recent transactions for any selected token.

## Benefits
- Clean and responsive UI powered by Tailwind CSS
- Real‑time pricing from CoinGecko
- Portfolio value summary
- Quick access to transaction details on Etherscan

## Configuration
1. Copy `.env` and add your QuickNode RPC endpoint:
   ```
   VITE_QUIKNODE_API_KEY=YOUR_ENDPOINT_URL
   ```
2. Adjust `src/config.js` to change which tokens are tracked.

## Usage
Install dependencies and start the development server:
```bash
npm install
npm run dev
```
Open `http://localhost:5173` and enter an Ethereum address to view your portfolio.

This application demonstrates premium features for a streamlined token management experience.
