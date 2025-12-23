import { useState } from 'react';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import {
  InjectedConnector,
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
  WalletConnectConnector,
} from '@web3-react/walletconnect-connector';
import { ethers } from 'ethers';
import Web3 from 'web3';

// 0 sepolia, 1 bsc testnet
let netid = 0;
let provider = null;
let walletconnect, injected, bsc;

//mainnet
// const netlist = [
//   {
//     chaind : 1,
//     rpcurl : "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
//     blockurl : "https://etherscan.io",
//     chainname : "Ethereum Mainnet",
//     chainnetname : "Ethereum Mainnet",
//     chainsymbol : "ETH",
//     chaindecimals : 18
//   },
//   {
//     chaind : 56,
//     rpcurl : "https://bsc-dataseed1.ninicoin.io",
//     blockurl : "https://bscscan.com/",
//     chainname : "Binance Smart Chain Mainnet",
//     chainnetname : "Binance Smart Chain Mainnet",
//     chainsymbol : "BNB",
//     chaindecimals : 18
//   },
// ]

// testnets
const netlist = [
  {
    chaind: 11155111,
    rpcurl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    blockurl: 'https://sepolia.etherscan.io',
    chainname: 'Sepolia Testnet',
    chainnetname: 'Sepolia',
    currencyName: 'Ether',
    chainsymbol: 'ETH',
    chaindecimals: 18,
  },
  {
    chaind: 97,
    rpcurl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    blockurl: 'https://testnet.bscscan.com/',
    chainname: 'BSC testnet',
    chainnetname: 'BSC testnet',
    currencyName: 'BNB',
    chainsymbol: 'BNB',
    chaindecimals: 18,
  },
];

const defaultethereumconflag = {
  testing: false,
  autoGasMultiplier: 1.5,
  defaultConfirmations: 1,
  defaultGas: '6000000',
  defaultGasPrice: '1000000000000',
  nodetimeout: 10000,
};

function web3ProviderFrom(endpoint, config) {
  const ethConfig = Object.assign(defaultethereumconflag, config || {});

  const providerClass = endpoint.includes('wss')
    ? Web3.providers.WebsocketProvider
    : Web3.providers.HttpProvider;

  return new providerClass(endpoint, {
    timeout: ethConfig.nodetimeout,
  });
}

export function getDefaultProvider() {
  if (!provider) {
    provider = new ethers.providers.Web3Provider(
      web3ProviderFrom(netlist[netid].rpcurl),
      netlist[netid].chaind
    );
  }

  return provider;
}

export function setNet(id) {
  netid = id;

  walletconnect = new WalletConnectConnector({
    rpc: { [netlist[netid].chaind]: netlist[netid].rpcurl },
    qrcode: true,
    pollingInterval: 12000,
  });

  injected = new InjectedConnector({
    supportedChainIds: [netlist[netid].chaind],
  });
}

export function useWalletConnector() {
  const { activate, deactivate, connector } = useWeb3React();
  const [provider, setProvider] = useState({});

  const setupNetwork = async () => {
    const injectedProvider = window.ethereum;
    if (injectedProvider?.request) {
      const chainId = `0x${netlist[netid].chaind.toString(16)}`;
      try {
        await injectedProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [
            {
              chainId,
            },
          ],
        });
        setProvider(injectedProvider);
        return true;
      } catch (error) {
        // 4902 = chain not added to wallet
        if (error?.code === 4902) {
          try {
            await injectedProvider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId,
                  chainName: netlist[netid].chainname,
                  rpcUrls: [netlist[netid].rpcurl],
                  nativeCurrency: {
                    name: netlist[netid].currencyName || netlist[netid].chainsymbol,
                    symbol: netlist[netid].chainsymbol,
                    decimals: netlist[netid].chaindecimals,
                  },
                  blockExplorerUrls: [netlist[netid].blockurl],
                },
              ],
            });

            await injectedProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId }],
            });

            setProvider(injectedProvider);
            return true;
          } catch (addError) {
            console.error('Failed to add/switch chain', addError);
            return false;
          }
        }
        return false;
      }
    } else {
      console.error(
        "Can't setup the Default Network network on metamask because window.ethereum is undefined"
      );
      return false;
    }
  };

  const loginMetamask = async () => {
    loginWallet(injected);
  };

  const loginWalletConnect = async () => {
    loginWallet(walletconnect);
  };

  const loginBSC = async () => {
    loginWallet(bsc);
  };

  const loginWallet = (connector) => {
    if (connector) {
      activate(connector, async (error) => {
        if (error instanceof UnsupportedChainIdError) {
          const hasSetup = await setupNetwork();
          if (hasSetup) {
            activate(connector);
          }
        } else {
          if (error instanceof NoEthereumProviderError) {
            console.log('Network Provide Error');
          } else if (
            error instanceof UserRejectedRequestErrorInjected ||
            error instanceof UserRejectedRequestErrorWalletConnect
          ) {
            console.log('Authorization Error! Please authorize to access your account');
          } else {
            console.log(error.name + error.message);
          }
        }
      });
    } else {
      console.log('Unable to find connector! The connector config is wrong');
    }
    setProvider(connector);
  };

  const logoutWalletConnector = () => {
    try {
      // WalletConnect (and some other connectors) keep a persisted session.
      // If we don't close it, the app can end up in a weird half-connected state.
      connector?.close?.();

      // web3-react v6 WalletConnectConnector stores the underlying provider here.
      connector?.walletConnectProvider?.disconnect?.();
      if (connector?.walletConnectProvider) {
        connector.walletConnectProvider = null;
      }
    } catch (e) {
      // best-effort cleanup; we still want to deactivate
    }

    deactivate();
    return true;
  };

  return {
    loginMetamask,
    loginWalletConnect,
    loginBSC,
    logoutWalletConnector,
  };
}
