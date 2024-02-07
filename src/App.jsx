import { useState } from 'react';
import { ethers, JsonRpcProvider, isAddress } from 'ethers';
import './App.css';


function App() {

  const [tokens, setTokens] = useState([]);
  const [address, setAddress] = useState("");
  const [eth, setEth] = useState("");
  const [history, setHistory] = useState([]);
  const [analyzedToken, setAnalyzedToken] = useState([]);
    const provider = new ethers.JsonRpcProvider(
        import.meta.env.VITE_QUIKNODE_API_KEY,
    );


  const handleSubmit = async (e) => {
            e.preventDefault();
            const validAddress = isAddress(address);

            if (!validAddress) {
                alert("Please enter a valid Ethereum address.");
                return;
            }

            try {
                const heads = await fetchTokens();
                await fetchEth();
                setTokens(heads.result);

            } catch (error) {
                setTokens([]);
                console.error("Error fetching tokens:", error);
            }
        };

        const fetchTokens = async () => {

            const heads = await provider.send("qn_getWalletTokenBalance", [{
                wallet: address,
                contracts: [
                    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
                    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    "0x514910771AF9Ca656af840dff83E8264EcF986CA",
                    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                    "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
                    "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
                    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
                    "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
                    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                    "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                    "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
                    "0x4d224452801ACEd8B2F0aebE155379bb5D594381",
                    "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
                    "0x912CE59144191C1204E64559FE8253a0e49E6548",
                    "0x3845badAde8e6dFF049820680d1F14bD3903a5d0",
                    "0x5a98fcbea516cf06857215779fd812ca3bef1b32"
                ]
            }]);
            console.log(heads.result)
            return heads;
        };

        const fetchEth = async () => {
            const eth = await provider.send("eth_getBalance", [address, "latest"]);
            setEth(eth)

        }

        const tokenHistory = async (token , name, decimals) => {
            const walletTransaction = await provider.send("qn_getWalletTokenTransactions", [{
                address: address,
                contract: token,
                page: 1,
                perPage: 20
            }]);
            setHistory(walletTransaction.paginatedItems)
            setAnalyzedToken(name, decimals)
        }


  return (
      <div className="container p-4">
          <header className="bg-gray-800 text-white py-4 px-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Token Balances and Transactions</h1>
          </header>
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Token Balances</h2>
              <form onSubmit={handleSubmit} className="flex items-center">
                  <input
                      type="text"
                      name="address"
                      placeholder="Enter address"
                      onChange={(e) => setAddress(e.target.value)}
                      className="border border-gray-300 rounded-md px-16 py-4 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                      Submit
                  </button>
              </form>
          </div>

          {eth.length > 0 && (
              <div className="relative mt-10 text-gray-900">
                  ETH Balance: <strong>{ethers.formatEther(eth)}</strong>
              </div>
          )}


          {tokens.length > 0 && (
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
                              <p className="text-sm text-gray-900">{parseFloat(token.totalBalance) / 10 ** parseInt(token.decimals)}</p>
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
          )}


          {history.length > 0 && (
              <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
                  <h2 className="text-2xl font-semibold mb-4">Transactions for {analyzedToken}</h2>
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

