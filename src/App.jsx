import { useState } from 'react';
import { ethers, isAddress } from 'ethers';
import { TOKEN_CONTRACTS } from './config.js';
import './App.css';


function App() {

  const [tokens, setTokens] = useState([]);
  const [address, setAddress] = useState("");
  const [eth, setEth] = useState("");
  const [history, setHistory] = useState([]);
  const [analyzedToken, setAnalyzedToken] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);
    const provider = new ethers.JsonRpcProvider(
        import.meta.env.VITE_QUIKNODE_API_KEY,
    );


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAddress(address)) {
      alert("Please enter a valid Ethereum address.");
      return;
    }

    setLoading(true);

    try {
      const [tokenData, ethBalance] = await Promise.all([
        fetchTokens(),
        fetchEth(),
      ]);
      setTokens(tokenData);
      setEth(ethBalance);
      const value = tokenData.reduce((acc, t) => acc + t.value, 0);
      setTotalValue(value);
    } catch (error) {
      setTokens([]);
      setEth("");
      setTotalValue(0);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

        const fetchTokens = async () => {
            const heads = await provider.send("qn_getWalletTokenBalance", [{
                wallet: address,
                contracts: TOKEN_CONTRACTS,
            }]);
            const tokenList = heads.result;
            const addresses = tokenList.map((t) => t.address).join(",");
            const priceRes = await fetch(
              `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addresses}&vs_currencies=usd`
            );
            const prices = await priceRes.json();
            return tokenList.map((t) => {
              const balance = parseFloat(t.totalBalance) / 10 ** parseInt(t.decimals);
              const price = prices[t.address.toLowerCase()]?.usd || 0;
              return { ...t, balance, price, value: balance * price };
            });
        };

        const fetchEth = async () => {
            const ethBalance = await provider.send("eth_getBalance", [address, "latest"]);
            return ethBalance;

        }

        const tokenHistory = async (token , name, decimals) => {
            const walletTransaction = await provider.send("qn_getWalletTokenTransactions", [{
                address: address,
                contract: token,
                page: 1,
                perPage: 20
            }]);
            setHistory(walletTransaction.paginatedItems)
            setAnalyzedToken({ name, decimals })
        }


  return (
      <div className="container p-4">
          <header className="bg-gray-800 text-white py-4 px-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Token Balances and Transactions</h1>
          </header>
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Token Balances</h2>
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <input
                      type="text"
                      name="address"
                      placeholder="Enter wallet address (0x...)"
                      onChange={(e) => setAddress(e.target.value)}
                      className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                  <button
                      type="submit"
                      disabled={loading}
                      className={`bg-blue-500 text-white px-4 py-2 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                  >
                      Submit
                  </button>
                  {loading && <span className="text-sm ml-2">Loading...</span>}
              </form>
          </div>

          {eth.length > 0 && (
              <div className="relative mt-10 text-gray-900">
                  ETH Balance: <strong>{ethers.formatEther(eth)}</strong>
              </div>
          )}


          {tokens.length > 0 && (
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 mt-4">
                  <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Symbol
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price USD
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value USD
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transactions
                      </th>
                  </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {tokens.map((token, index) => (
                      <tr key={index} className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                  <div className="ml-4">
                                      <p className="text-sm font-medium text-gray-900">{token.name}</p>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm text-gray-900">{token.symbol}</p>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                              <p className="text-sm text-gray-900">{token.balance.toFixed(4)}</p>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                              <p className="text-sm text-gray-900">${'{'}token.price.toFixed(2){'}'}</p>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                              <p className="text-sm text-gray-900">${'{'}token.value.toFixed(2){'}'}</p>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                              <button
                                  onClick={(e) => {
                                      e.preventDefault()
                                      tokenHistory(token.address, token.name, token.decimals)
                                  }}
                              >
                                  {token.name}
                              </button>
                          </td>
                      </tr>
                  ))}
                  </tbody>
              </table>
              </div>
          )}

          {totalValue > 0 && (
              <div className="mt-4 text-gray-900">
                  Portfolio Value: <strong>${'{'}totalValue.toFixed(2){'}'}</strong>
              </div>
          )}


          {history.length > 0 && (
              <div className="w-full lg:w-1/2 mt-4 lg:mt-0 overflow-x-auto">
                  <h2 className="text-2xl font-semibold mb-4">Transactions for {analyzedToken.name}</h2>
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              From
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              To
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hash
                          </th>
                      </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                      {history.map((transaction, index) => (
                          <tr key={index} className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <img
                                      className="flex-shrink-0 h-10 w-10"
                                      src={`https://robohash.org/${transaction.fromAddress}?set=set1`}
                                      alt=""
                                  />
                                  <p className="text-sm text-gray-900">{transaction.fromAddress}</p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <img
                                      className="flex-shrink-0 h-10 w-10"
                                      src={`https://robohash.org/${transaction.toAddress}?set=set1`}
                                      alt=""
                                  />
                                  <p className="text-sm text-gray-900">{transaction.toAddress}</p>
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                  <p className="text-sm text-gray-900">
                                      {ethers.formatUnits(transaction.sentAmount, analyzedToken.decimals)}
                                  </p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <a className="text-sm text-gray-900"
                                     href={`https://etherscan.io/tx/${transaction.transactionHash}`}
                                  >View on etherscan
                                  </a>
                              </td>
                          </tr>
                      ))}
                      </tbody>
                  </table>
              </div>
          )}

      </div>
  )
}

export default App;

