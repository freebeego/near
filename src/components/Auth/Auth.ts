export default class Auth {
  private readonly mainElement: HTMLElement
  private readonly additionalElementsIds: string[]
  private callback: () => void

  constructor(mainElementId: string, additionalElementsIds: string[] = []) {
    this.mainElement = document.getElementById(mainElementId)
    this.additionalElementsIds = additionalElementsIds
  }

  setEventListener(callback: () => void) {
    const additionalElements = this.additionalElementsIds
      .reduce(
        (acc, id) => {
          const additionalElement = document.getElementById(id)

          return additionalElement ? [...acc, additionalElement] : acc
        },
        [],
      )

    if (this.callback) {
      this.mainElement.removeEventListener('click', this.callback)
      additionalElements.forEach((element) => element.removeEventListener('click', this.callback))
    }

    this.callback = callback

    this.mainElement.addEventListener('click', callback)
    additionalElements.forEach((element) => element.addEventListener('click', callback))

    return this
  }

  setMainElementText(text: string) {
    this.mainElement.textContent = text

    return this
  }
}
