import type { Project } from '..'
import type { PositionType } from '../enums/project'

export interface ProjectCreateRequest {
  title: string
  description: string
  category: Project['category']
  goals: string[]
  techStacks: string[]
  deadline: string
  open: boolean
  leaderPosition: PositionType
  positions: Array<{
    role: string
    total: number
  }>
}

export interface ProjectUpdateRequest {
  title: string
  description: string
  category: Project['category']
  goals: string[]
  techStacks: string[]
  deadline: string
  open: boolean
  positions: Array<{
    role: string
    total: number
  }>
}

export interface ProjectPermissionResponse {
  canEdit: boolean
  isMember: boolean
  pendingApplicationId: number | null
}

export interface ProjectApplicationCreateRequest {
  position: string
  message: string
}

export interface ProjectApplicationCreateResponse {
  applicationId: number
}
