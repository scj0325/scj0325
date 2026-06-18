import type { CreateReportRequest, CreateReviewRequest, Portfolio, PortfolioUpdateRequest, Project, ProjectProposal, ReportResponse, ReportStatus, ReportTargetType, ReviewResponse, RsData, User } from '../types';
import type { PortfolioCreateRequest } from '../types/dto/portfolio';
import type { ProjectApplicationCreateRequest, ProjectApplicationCreateResponse, ProjectCreateRequest, ProjectPermissionResponse, ProjectUpdateRequest } from '../types/dto/project';
import type { ProjectProposalCreateRequest, ProposalProject, SentProjectProposal } from '../types/dto/proposal';
import type { TechStackItem } from '../types/tech-stack';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

async function fetchRsDataJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })

  const rsData = (await response.json().catch(() => null)) as RsData<T> | null

  if (!response.ok) {
    throw new Error(rsData?.message ?? `API request failed: ${response.status}`)
  }

  if (!rsData) {
    throw new Error('API response was empty.')
  }

  return rsData.data
}

// 스프링의 Page 공통 규격을 받아줄 인터페이스 정의
interface SpringPage<T> {
  content: T[]          // 실제 데이터 리스트 (6개)
  totalPages: number    // 전체 페이지 개수
  totalElements: number // 전체 데이터 개수
  number: number        // 현재 페이지 번호 (0부터 시작)
  size: number          // 한 페이지당 데이터 개수
}

export interface ProjectFilterParams {
  page?: number
  size?: number
  search?: string
  category?: string
  tech?: string
  status?: string
  sort?: string
}

export interface PortfolioFilterParams {
  page?: number
  size?: number
  search?: string
  role?: string
  tech?: string
}

export function fetchProjects(params: ProjectFilterParams = {}) {
  const { page = 0, size = 6, search, category, tech, status, sort } = params

  const query = new URLSearchParams()
  query.append('page', page.toString())
  query.append('size', size.toString())

  if (search) query.append('search', search)
  if (category && category !== 'All') query.append('category', category)
  if (tech && tech !== 'All') query.append('tech', tech)
  if (status && status !== 'All') query.append('status', status)
  if (sort) query.append('sort', sort)
  
  return fetchRsDataJson<SpringPage<Project>>(`/projects?${query.toString()}`)
}

export function fetchProject(id: string) {
  return fetchRsDataJson<Project>(`/projects/${id}`)
}

export function createProject(payload: ProjectCreateRequest) {
  return fetchRsDataJson<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchProjectPermissions(id: string) {
  return fetchRsDataJson<ProjectPermissionResponse>(
    `/projects/${id}/permissions`,
  )
}

export function cancelProjectApplication(applicationId: number) {
  return fetchRsDataJson<void>(
    `/mypage/projects/applications/${applicationId}/cancel`,
    {
      method: 'PATCH',
      credentials: 'include',
    },
  )
}

export function applyProject(
  projectId: string,
  payload: ProjectApplicationCreateRequest,
) {
  return fetchRsDataJson<ProjectApplicationCreateResponse>(
    `/projects/${projectId}/applications`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export function updateProject(id: string, payload: ProjectUpdateRequest) {
  return fetchRsDataJson<Project>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function fetchMembers() {
  return fetchRsDataJson<User[]>('/members')
}

export function fetchPortfolios(params: PortfolioFilterParams = {}) {
  const { page = 0, size = 9, search, role, tech } = params

  const query = new URLSearchParams()
  query.append('page', page.toString())
  query.append('size', size.toString())

  if (search) query.append('search', search)
  if (role && role !== 'All') query.append('role', role)
  if (tech && tech !== 'All') query.append('tech', tech)

  return fetchRsDataJson<SpringPage<User>>(`/portfolios?${query.toString()}`)
}

export function fetchMember(id: string) {
  return fetchRsDataJson<User>(`/members/${id}`)
}

export function fetchPopularTechStacks() {
  return fetchRsDataJson<string[]>('/tech-stacks')
}

export function fetchAllTechStacks() {
  return fetchRsDataJson<TechStackItem[]>('/tech-stacks/all')
}

export function createPortfolio(data: PortfolioCreateRequest) {
  return fetchRsDataJson<void>('/portfolios', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function fetchMyPortfolio() {
  return fetchRsDataJson<Portfolio>('/portfolios/me')
}

export function updateMyPortfolio(payload: PortfolioUpdateRequest) {
  return fetchRsDataJson<Portfolio>('/portfolios/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function fetchMyProjectProposals() {
  return fetchRsDataJson<ProjectProposal[]>('/portfolios/me/proposals')
}

export function fetchProposalProjects() {
  return fetchRsDataJson<ProposalProject[]>('/portfolios/proposal-projects')
}

export function createProjectProposal(
  memberId: string,
  payload: ProjectProposalCreateRequest,
) {
  return fetchRsDataJson<void>(`/portfolios/${memberId}/proposals`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchPendingSentProjectProposals(memberId: string) {
  return fetchRsDataJson<SentProjectProposal[]>(
    `/portfolios/${memberId}/proposals/sent`,
  )
}

export function cancelProjectProposal(proposalId: number) {
  return fetchRsDataJson<void>(`/portfolios/proposals/${proposalId}`, {
    method: 'DELETE',
  })
}

export function fetchUserReports(
  status: ReportStatus = 'PENDING',
  keyword?: string,
) {
  const query = keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''
  return fetchRsDataJson<ReportResponse[]>(
    `/admin/reports?targetType=PORTFOLIO&status=${status}${query}`,
  )
}

export function fetchProjectReports(
  status: ReportStatus = 'PENDING',
  keyword?: string,
) {
  const query = keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''
  return fetchRsDataJson<ReportResponse[]>(
    `/admin/reports?targetType=PROJECT&status=${status}${query}`,
  )
}

export function fetchHiddenProjects() {
  return fetchRsDataJson<Project[]>('/admin/projects/hidden')
}

export function unhideProject(projectId: string) {
  return fetchRsDataJson<void>(`/admin/projects/${projectId}/unhide`, {
    method: 'PATCH',
  })
}

export function createReport(payload: CreateReportRequest) {
  return fetchRsDataJson<{ reportId: number }>('/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function checkAlreadyReported(
  targetType: ReportTargetType,
  targetId: number,
) {
  return fetchRsDataJson<boolean>(
    `/reports/check?targetType=${targetType}&targetId=${targetId}`,
  )
}

export function resolveReport(reportId: number) {
  return fetchRsDataJson<void>(`/admin/reports/${reportId}/resolve`, {
    method: 'PATCH',
  })
}

export function rejectReport(reportId: number) {
  return fetchRsDataJson<void>(`/admin/reports/${reportId}/reject`, {
    method: 'PATCH',
  })
}

export async function withdrawMember(): Promise<void> {
  const res = await fetch(`${API_BASE}/members/me`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('회원 탈퇴에 실패했습니다.')
}

export function createReview(request: CreateReviewRequest) {
  return fetchRsDataJson<number>('/reviews', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function fetchReviews(userId: string) {
  return fetchRsDataJson<ReviewResponse[]>(`/reviews/users/${userId}`)
}
