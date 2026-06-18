export type Position = {
  role: string
  filled: number
  total: number
}

export type User = {
  id: string
  name: string
  avatar: string
  role: string
  bio?: string
  techStack?: string[]
  github?: string
  portfolio?: string
  location?: string
  featured?: boolean
}

export type Project = {
  id: string
  title: string
  description: string
  goals: string[]
  techStack: string[]
  positions: Position[]
  recruitmentStatus: 'Open' | 'Closed' | 'Completed' | 'Stopped'
  category: 'Web' | 'Mobile' | 'AI' | 'Game' | 'Other'
  leader: User
  teamMembers: User[]
  deadline: string
  createdAt: string
  featured?: boolean
}

export interface RsData<T> {
  code: string
  message: string
  data: T
}

export interface PortfolioLink {
  linkType: string
  url: string
}

export interface Portfolio {
  id: number
  title: string
  introduction: string
  links: PortfolioLink[]
  desiredPosition: string | null
  isPublished: boolean
  techStacks: string[]
}

export interface PortfolioUpdateRequest {
  title: string
  introduction: string
  portfolioLinks: PortfolioLink[]
  desiredPosition: string | null
  isPublished: boolean
  techStacks: string[]
}

export interface ProjectProposal {
  proposalId: number
  projectId: number
  projectTitle: string
  proposerName: string
  message: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  createdAt: string
}

export interface CreateReviewRequest {
  projectId: number
  revieweeId: number
  content: Record<string, string>
}

export type ReportTargetType = 'PORTFOLIO' | 'PROJECT'
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED'
export type ReportReasonType =
  | 'SPAM'
  | 'ABUSE'
  | 'ADVERTISEMENT'
  | 'INAPPROPRIATE_CONTENT'
  | 'FRAUD'
  | 'ETC'

export interface CreateReportRequest {
  targetType: ReportTargetType
  targetId: number
  reasonType: ReportReasonType
  reasonDetail: string
}

export interface ReportResponse {
  reportId: number
  reporterId: number
  reporterNickname: string
  targetType: ReportTargetType
  targetId: number
  targetTitle: string
  targetMemberNickname: string
  targetMemberProfileImage: string
  reasonType: string
  reasonDetail: string
  status: ReportStatus
  createdAt: string
  reviewedAt: string | null
}

export interface ReviewResponse {
  reviewId: number
  projectTitle: string
  content: Record<string, string>
  createdAt: string
}
