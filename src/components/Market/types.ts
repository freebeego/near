export interface IMarketTemplateSelector {
  templateId: string
  marketSelector: string
  selectSelector: string
  orderBookSelector: string
  sellContainerSelector: string
  spreadSelector: string
  buyContainerSelector: string
  orderBookRowId: string
  orderBookRowSelector: string
  orderBookTitleRowSelector: string
}

export interface IPair {
  id: number
  label: string
}
