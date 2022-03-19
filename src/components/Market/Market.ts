import { IMarketTemplateSelector, IPair } from './types'
import { IItem, IMarket, IOrder, TOrders } from '@/types'
import { evaluate, format, round } from 'mathjs'


export default class Market {
  private readonly containerElement: HTMLElement
  private readonly marketElement: HTMLElement
  private readonly selectElement: HTMLElement
  private readonly orderBookElement: HTMLElement
  private readonly sellContainerElement: HTMLElement
  private readonly spreadElement: HTMLElement
  private readonly buyContainerElement: HTMLElement
  private readonly orderBookRowElement: HTMLElement
  private readonly orderBookTitleRowElement: HTMLElement


  constructor(
    containerId: string,
    {
      templateId,
      marketSelector,
      selectSelector,
      orderBookSelector,
      sellContainerSelector,
      spreadSelector,
      buyContainerSelector,
      orderBookRowId,
      orderBookRowSelector,
      orderBookTitleRowSelector,
    }: IMarketTemplateSelector,
  ) {
    this.containerElement = document.getElementById(containerId)

    const marketTemplate = document.getElementById(templateId) as HTMLTemplateElement

    this.marketElement = marketTemplate.content.querySelector(marketSelector).cloneNode(true) as HTMLElement

    this.selectElement = this.marketElement.querySelector(selectSelector)
    this.orderBookElement = this.marketElement.querySelector(orderBookSelector)
    this.sellContainerElement = this.orderBookElement.querySelector(sellContainerSelector)
    this.spreadElement = this.orderBookElement.querySelector(spreadSelector)
    this.buyContainerElement = this.orderBookElement.querySelector(buyContainerSelector)
    this.orderBookTitleRowElement = this.orderBookElement.querySelector(orderBookTitleRowSelector)

    const orderBookRowTemplate = document.getElementById(orderBookRowId) as HTMLTemplateElement
    this.orderBookRowElement =
      orderBookRowTemplate.content.querySelector(orderBookRowSelector).cloneNode(true) as HTMLElement
  }

  setPairs(pairs: IPair[]) {
    const options = pairs.map(({ id, label }) => {
      const option = document.createElement('option')

      option.value = id.toString()
      option.textContent = label

      return option
    })

    options.forEach((option) => this.selectElement.appendChild(option))

    return this
  }

  private createSpanElement(textContent: string) {
    const spanElement = document.createElement('span')
    spanElement.textContent = textContent

    return spanElement
  }

  private formatValue(value: string, number: number) {
    const [integer, decimals] = value.split('.')
    const formattedInteger =
      integer
        .split('')
        .reverse()
        .reduce(
          (acc, digit, index) =>
            (index + 1) % 3 === 0 && index + 1 !== integer.length ? [',', digit, ...acc] : [digit, ...acc],
          [],
        )
        .join('')
    const formattedDecimals = decimals ? decimals.padEnd(number, '0') : '0'.repeat(number)

    return `${formattedInteger}.${formattedDecimals}`
  }

  private addRows(orders: IOrder[], { base, quote }: IMarket, reverse: boolean = false, firstColumnColor: 'red' | 'green' | 'black' = 'black') {
    return (reverse ? orders.reverse() : orders).map(({ price, quantity }) => {
      const row = this.orderBookRowElement.cloneNode(true) as HTMLElement

      const priceCell = row.children.item(0) as HTMLElement
      const priceValue = round(
        evaluate(`${price} / 10 ^ ${quote.decimal}`),
        4,
      )
      priceCell.textContent = this.formatValue(priceValue.toString(), 4)
      priceCell.style.color = firstColumnColor

      const sizeCell = row.children.item(1) as HTMLElement
      const sizeValue = round(
        evaluate(`${quantity} / 10 ^ ${base.decimal}`),
        4,
      )
      sizeCell.textContent = this.formatValue(sizeValue.toString(), 4)

      const totalCell = row.children.item(2) as HTMLElement
      const totalValue = format(
        round(
          evaluate(`${priceValue} * ${sizeValue}`),
          2
        ),
        { notation: 'fixed' }
      )
      totalCell.textContent = this.formatValue(totalValue.toString(), 2)

      row.appendChild(priceCell)
      row.appendChild(sizeCell)
      row.appendChild(totalCell)

      return row
    })
  }

  private setTitle({ base, quote }: IMarket) {
    const priceTitle = this.createSpanElement(`Price (${quote.ticker})`)
    priceTitle.style.width = '33%'
    priceTitle.style.display = 'flex'
    priceTitle.style.justifyContent = 'flex-start'
    priceTitle.style.paddingRight = '14px'
    const sizeTitle = this.createSpanElement(`Size (${base.ticker})`)
    sizeTitle.style.width = '34%'
    sizeTitle.style.display = 'flex'
    sizeTitle.style.justifyContent = 'flex-end'
    sizeTitle.style.paddingRight = '24px'
    const totalTitle = this.createSpanElement('Total')
    totalTitle.style.width = '33%'
    totalTitle.style.display = 'flex'
    totalTitle.style.justifyContent = 'flex-end'

    this.orderBookTitleRowElement.appendChild(priceTitle)
    this.orderBookTitleRowElement.appendChild(sizeTitle)
    this.orderBookTitleRowElement.appendChild(totalTitle)
  }

  private setSpread({ askOrders, bidOrders }: TOrders, { decimal }: IItem) {
    const top = round(
      evaluate(`${bidOrders[0].price} / 10 ^ ${decimal}`),
      4,
    )

    const bottom = round(
      evaluate(`${askOrders[askOrders.length - 1].price} / 10 ^ ${decimal}`),
      4,
    )

    const absoluteSpread = format(evaluate(`${bottom} - ${top}`), { precision: 4 })
    const percentSpread = format(evaluate(`${absoluteSpread} / ${top}`), { precision: 14 })

    this.spreadElement.children[0].textContent = absoluteSpread.toString()
    this.spreadElement.children[1].textContent = 'Spread'
    this.spreadElement.children[2].textContent = `${round(+percentSpread, 2)}%`
  }

  setOrders(orders: TOrders, market: IMarket) {
    this.setTitle(market)

    const sell = this.addRows(orders.askOrders, market, true, 'red')
    sell.forEach((row) => this.sellContainerElement.appendChild(row))

    const buy = this.addRows(orders.bidOrders, market, false, 'green')
    buy.forEach((row) => this.buyContainerElement.appendChild(row))

    this.setSpread(orders, market.quote)

    return this
  }

  setEventListener(callback: (event: Event) => void) {
    this.selectElement.addEventListener('change', callback)

    return this
  }

  render() {
    this.containerElement.appendChild(this.marketElement)

    return this
  }

  clear() {
    Array.from(this.orderBookTitleRowElement.children).forEach((cell) => cell.remove())

    Array.from(this.sellContainerElement.children).forEach((cell) => cell.remove())

    this.spreadElement.children[0].textContent = ''
    this.spreadElement.children[1].textContent = ''
    this.spreadElement.children[2].textContent = ''

    Array.from(this.buyContainerElement.children).forEach((cell) => cell.remove())

    return this
  }

  triggerChange() {
    this.selectElement.dispatchEvent(new Event('change'))

    return this
  }
}
