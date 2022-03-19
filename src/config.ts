import { ConnectConfig, keyStores } from 'near-api-js'
import { ContractMethods } from 'near-api-js/lib/contract'

export const nearConnectConfig: ConnectConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  headers: {},
}

export const CONTRACT_NAME = 'app_2.spin_swap.testnet'

export const contractMethodOptions: ContractMethods = {
  viewMethods: ['markets', 'view_market'],
  changeMethods: [],
}

export const updateMarketDataInterval = 3000
