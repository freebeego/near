import './index.styl';

import { connect, keyStores, ConnectConfig, Contract, WalletConnection } from "near-api-js"
import { ContractMethods } from 'near-api-js/lib/contract'

const nearConnectConfig: ConnectConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  headers: {},
}

const CONTRACT_NAME = 'app_2.spin_swap.testnet'

const contractMethodOptions: ContractMethods = {
  viewMethods: ['markets', 'view_market'],
  changeMethods: [],
}

window.onload = async () => {
  const near = await connect(nearConnectConfig)

  const wallet = new WalletConnection(near, 'test')
  const contract = new Contract(
    wallet.account(),
    CONTRACT_NAME,
    contractMethodOptions,
  )

  console.log('asd', contract)

  console.log(wallet.isSignedIn())
  // await wallet.requestSignIn()
}
