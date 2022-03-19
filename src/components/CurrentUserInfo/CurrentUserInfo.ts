import { IAccountInfoContainer, IAccountInfoSelectors } from './types'

export default class CurrentUserInfo {
  private readonly containerElement: HTMLElement
  private readonly accountNameElement: HTMLElement
  private readonly accountBalanceElement: HTMLElement
  private readonly containerHidingClass: string

  constructor({ id, hidingClass }: IAccountInfoContainer, { accountName, accountBalance }: IAccountInfoSelectors, ) {
    this.containerElement = document.getElementById(id)
    this.containerHidingClass = hidingClass

    this.accountNameElement = this.containerElement.querySelector(accountName)
    this.accountBalanceElement = this.containerElement.querySelector(accountBalance)

    this.containerElement.classList.remove(this.containerHidingClass)
  }

  setAccountName(accountName: string) {
    this.accountNameElement.textContent = accountName

    return this
  }

  setAccountBalance(accountBalance: string) {
    this.accountBalanceElement.textContent = accountBalance

    return this
  }

  hide() {
    this.containerElement.classList.add(this.containerHidingClass)

    this.accountNameElement.textContent = ''
    this.accountBalanceElement.textContent = ''

    return this
  }
}
