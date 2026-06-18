export interface PortfolioLinkRequest {
  linkType: string
  url: string
}

export interface PortfolioCreateRequest {
  title: string
  introduction?: string
  desiredPosition: string
  portfolioLinks: PortfolioLinkRequest[]
  isPublished: boolean
  techStackIds: number[]
}
