export interface ProposalProject {
  id: number
  title: string
}

export interface ProjectProposalCreateRequest {
  projectId: number
  message: string
}

export interface SentProjectProposal {
  proposalId: number
  projectId: number
  projectTitle: string
}
