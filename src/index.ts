import './index.styl';

import { Buffer } from 'buffer'

import { connect, Contract, WalletConnection } from "near-api-js"
import { formatNearAmount } from 'near-api-js/lib/utils/format'

import CurrentUserInfo from '@components/CurrentUserInfo'
import Auth from '@components/Auth'
import Market, { IPair } from '@components/Market'

import { IMarket, TRawOrders, TOrders } from './types'
import { CONTRACT_NAME, contractMethodOptions, nearConnectConfig, updateMarketDataInterval } from './config'
import {
  ACCOUNT_INFO_CONTAINER_ID,
  ADDITIONAL_SIGN_ANCHOR_ID,
  BUY_CONTAINER_SELECTOR,
  CONTENT_ID,
  HEADER_ACCOUNT_BALANCE_SELECTOR,
  HEADER_ACCOUNT_INFO_CONTAINER_HIDE_CLASS,
  HEADER_ACCOUNT_NAME_SELECTOR,
  MARKET_SELECTOR,
  MARKET_TEMPLATE_ID,
  ORDER_BOOK_ROW_ID,
  ORDER_BOOK_ROW_SELECTOR,
  ORDER_BOOK_SELECTOR,
  ORDER_BOOK_TITLE_ROW_SELECTOR,
  PAIRS_SELECT_SELECTOR,
  SELL_CONTAINER_SELECTOR,
  SIG_IN_DISCLAIMER_ID,
  SIG_IN_DISCLAIMER_SELECTOR,
  SIGN_BUTTON_ID,
  SIGN_IN_BUTTON_TEXT,
  SIGN_OUT_BUTTON_TEXT,
  SPREAD_SELECTOR,
} from './constants'

window.Buffer = Buffer

const showDisclaimer = () => {
  const contentContainer = document.getElementById(CONTENT_ID)

  Array.from(contentContainer.children).forEach((element) => element.remove())

  const sigInDisclaimer = (document
    .getElementById(SIG_IN_DISCLAIMER_ID) as HTMLTemplateElement)
    .content
    .querySelector(SIG_IN_DISCLAIMER_SELECTOR)
    .cloneNode(true)

  contentContainer.appendChild(sigInDisclaimer)
}

window.onload = async () => {
  const near = await connect(nearConnectConfig)

  const wallet = new WalletConnection(near, null)

  const auth = new Auth(SIGN_BUTTON_ID, [ADDITIONAL_SIGN_ANCHOR_ID])

  if (wallet.isSignedIn()) {
    let intervalId: NodeJS.Timer = null

    const accountName = wallet.account().accountId
    const accountBalance = await wallet.account().getAccountBalance()

    const currentUserInfo = new CurrentUserInfo(
      {
        id: ACCOUNT_INFO_CONTAINER_ID,
        hidingClass: HEADER_ACCOUNT_INFO_CONTAINER_HIDE_CLASS,
      },
      {
        accountName: HEADER_ACCOUNT_NAME_SELECTOR,
        accountBalance: HEADER_ACCOUNT_BALANCE_SELECTOR,
      },
    )

    auth
      .setMainElementText(SIGN_OUT_BUTTON_TEXT)
      .setEventListener(() => {
        clearInterval(intervalId)
        intervalId = null

        currentUserInfo.hide()
        showDisclaimer()

        wallet.signOut()

        auth
          .setMainElementText(SIGN_IN_BUTTON_TEXT)
          .setEventListener(wallet.requestSignIn.bind(wallet))
      })

    currentUserInfo
      .setAccountName(accountName)
      .setAccountBalance(formatNearAmount(accountBalance.available))

    const contract = new Contract(
      wallet.account(),
      CONTRACT_NAME,
      contractMethodOptions,
    )

    // @ts-ignore
    const marketsData = await contract.markets() as IMarket[]

    const market = new Market(
      CONTENT_ID,
      {
        templateId: MARKET_TEMPLATE_ID,
        marketSelector: MARKET_SELECTOR,
        selectSelector: PAIRS_SELECT_SELECTOR,
        orderBookSelector: ORDER_BOOK_SELECTOR,
        sellContainerSelector: SELL_CONTAINER_SELECTOR,
        spreadSelector: SPREAD_SELECTOR,
        buyContainerSelector: BUY_CONTAINER_SELECTOR,
        orderBookRowId: ORDER_BOOK_ROW_ID,
        orderBookRowSelector: ORDER_BOOK_ROW_SELECTOR,
        orderBookTitleRowSelector: ORDER_BOOK_TITLE_ROW_SELECTOR,
      },
    )

    const pairs: IPair[] = marketsData.map(({ id, base, quote }) => ({
      id,
      label: `${base.ticker} / ${quote.ticker}`,
    }))

    market
      .setPairs(pairs)
      .setEventListener(async (event) => {
        market.clear()

        const value = (<HTMLSelectElement>event.target).value

        if (intervalId !== null) {
          clearInterval(intervalId)
        }

        const update = async () => {
          try {
            // @ts-ignore
            const rawOrders = await contract.view_market({ market_id: +value }) as TRawOrders
            const orders: TOrders = {
              askOrders: rawOrders.ask_orders,
              bidOrders: rawOrders.bid_orders,
            }

            market
              .clear()
              .setOrders(orders, marketsData.find(({ id }) => id === +value))
          } catch (e) {
            console.error(e)
          }
        }

        await update()

        intervalId = setInterval(update, updateMarketDataInterval)
      })
      .triggerChange()
      .render()
  } else {
    showDisclaimer()

    auth
      .setMainElementText(SIGN_IN_BUTTON_TEXT)
      .setEventListener(wallet.requestSignIn.bind(wallet))
  }
}
