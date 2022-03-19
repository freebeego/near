export interface IItem {
  address: string
  decimal: number
  ticker: string
}

export interface IMarket {
  base: IItem
  fee: number
  id: number
  quote: IItem
}

export interface IOrder {
  price: number
  quantity: number
}

export type TRawOrders = Record<'ask_orders' | 'bid_orders', IOrder[]>
export type TOrders = Record<'askOrders' | 'bidOrders', IOrder[]>
