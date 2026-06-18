'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Plus, X } from 'lucide-react'

import { Button, Card, Input } from '../../../../components/ui'
import {
  fetchProject,
  fetchProjectPermissions,
  fetchPopularTechStacks,
  updateProject,
} from '../../../../lib/api'
import { leaderPositionOptions, toPositionValue } from '../../../../constants/project'
import type { ProjectUpdateRequest } from '../../../../types/dto/project'

export default function ProjectEditPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const today = new Date()
  const minimumDeadline = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<ProjectUpdateRequest>({
    title: '',
    description: '',
    category: 'Web',
    goals: [''],
    techStacks: [],
    deadline: '',
    open: true,
    positions: [{ role: '', total: 1 }],
  })
  const [positionMinimums, setPositionMinimums] = useState([0])
  const [popularTechStacks, setPopularTechStacks] = useState<string[]>([])
  const [techInput, setTechInput] = useState('')

  useEffect(() => {
    Promise.all([
      fetchProject(id),
      fetchProjectPermissions(id),
      fetchPopularTechStacks(),
    ])
      .then(([project, permission, techStacks]) => {
        if (!permission.canEdit) {
          toast.error('프로젝트 수정 권한이 없습니다.')
          router.replace(`/projects/${id}`)
          return
        }

        setForm({
          title: project.title,
          description: project.description,
          category: project.category,
          goals: project.goals.length > 0 ? project.goals : [''],
          techStacks: project.techStack,
          deadline: project.deadline,
          open: project.recruitmentStatus === 'Open',
          positions:
            project.positions.length > 0
              ? project.positions.map(({ role, total }) => ({
                  role: toPositionValue(role),
                  total,
                }))
              : [{ role: '', total: 1 }],
        })
        setPositionMinimums(
          project.positions.length > 0
            ? project.positions.map((position) => position.filled)
            : [0],
        )
        setPopularTechStacks(techStacks)
      })
      .catch(() => {
        toast.error('프로젝트 정보를 불러오지 못했습니다.')
        router.replace(`/projects/${id}`)
      })
      .finally(() => setLoading(false))
  }, [id, router])

  const handleGoalChange = (index: number, value: string) => {
    const goals = [...form.goals]
    goals[index] = value
    setForm({ ...form, goals })
  }

  const handleAddGoal = () => {
    setForm({ ...form, goals: [...form.goals, ''] })
  }

  const handleRemoveGoal = (index: number) => {
    setForm({
      ...form,
      goals: form.goals.filter((_, goalIndex) => goalIndex !== index),
    })
  }

  const handlePositionChange = (
    index: number,
    field: 'role' | 'total',
    value: string | number,
  ) => {
    const positions = [...form.positions]
    positions[index] = { ...positions[index], [field]: value }
    setForm({ ...form, positions })
  }

  const handleAddPosition = () => {
    setForm({
      ...form,
      positions: [...form.positions, { role: '', total: 1 }],
    })
    setPositionMinimums([...positionMinimums, 0])
  }

  const handleRemovePosition = (index: number) => {
    setForm({
      ...form,
      positions: form.positions.filter(
        (_, positionIndex) => positionIndex !== index,
      ),
    })
    setPositionMinimums(
      positionMinimums.filter((_, positionIndex) => positionIndex !== index),
    )
  }

  const handleAddTech = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !techInput.trim()) return

    event.preventDefault()
    const tech = techInput.trim()
    if (!form.techStacks.includes(tech)) {
      setForm({ ...form, techStacks: [...form.techStacks, tech] })
    }
    setTechInput('')
  }

  const handleRemoveTech = (tech: string) => {
    setForm({
      ...form,
      techStacks: form.techStacks.filter((item) => item !== tech),
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) return

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.deadline ||
      form.positions.length === 0 ||
      form.positions.some((position) => !position.role.trim())
    ) {
      toast.error('필수 항목을 모두 입력해주세요.')
      return
    }

    const invalidPositionIndex = form.positions.findIndex(
      (position, index) =>
        position.total < Math.max(positionMinimums[index] ?? 0, 1),
    )
    if (invalidPositionIndex >= 0) {
      const minimum = positionMinimums[invalidPositionIndex] ?? 0
      toast.error(
        `${form.positions[invalidPositionIndex].role} 모집 인원은 현재 참여 인원 ${minimum}명보다 적게 설정할 수 없습니다.`,
      )
      return
    }

    if (form.deadline < minimumDeadline) {
      toast.error('모집 마감일은 오늘보다 이전으로 설정할 수 없습니다.')
      return
    }

    setSubmitting(true)
    try {
      await updateProject(id, {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        goals: form.goals.map((goal) => goal.trim()).filter(Boolean),
        techStacks: form.techStacks.map((tech) => tech.trim()).filter(Boolean),
        positions: form.positions.map((position) => ({
          role: position.role.trim(),
          total: position.total,
        })),
      })
      toast.success('프로젝트가 수정되었습니다.')
      router.push(`/projects/${id}`)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '프로젝트 수정에 실패했습니다.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-500">
        프로젝트 정보를 불러오는 중...
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        뒤로 가기
      </button>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          프로젝트 수정
        </h1>
        <p className="text-slate-500">
          변경할 프로젝트 정보를 확인하고 항목별로 수정해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6 md:p-8">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-slate-900">
            <span className="section-step">
              1
            </span>
            기본 정보
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            프로젝트 목록과 상세 화면에 가장 먼저 표시되는 정보입니다.
          </p>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                프로젝트 제목 <span className="text-red-500">*</span>
              </label>
              <p className="mb-2 text-xs text-slate-500">
                프로젝트의 목적을 쉽게 파악할 수 있는 제목을 작성해주세요.
              </p>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="예: 실시간 협업 화이트보드"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                프로젝트 설명 <span className="text-red-500">*</span>
              </label>
              <p className="mb-2 text-xs text-slate-500">
                프로젝트 배경, 해결하려는 문제와 주요 기능을 구체적으로 작성해주세요.
              </p>
              <textarea
                className="form-textarea min-h-40"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="프로젝트의 배경과 진행 방향을 상세히 작성해주세요."
                required
              />
            </div>

          </div>
        </Card>

        <Card className="p-6 md:p-8">
          <div className="mb-2 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <span className="section-step">
                2
              </span>
              모집 포지션 및 기술 스택
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddPosition}
              className="h-8 text-blue-600"
            >
              <Plus className="mr-1 h-4 w-4" />
              포지션 추가
            </Button>
          </div>
          <p className="mb-6 text-sm text-slate-500">
            모집할 역할과 해당 역할의 전체 정원을 설정해주세요. 이미 참여 중인
            팀원 수보다 정원을 적게 줄일 수 없습니다.
          </p>

          <div className="space-y-4">
            {form.positions.map((position, index) => {
              const minimum = positionMinimums[index] ?? 0

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      포지션 {index + 1}
                    </span>
                    {form.positions.length > 1 && minimum === 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePosition(index)}
                        className="p-1 text-slate-400 transition-colors hover:text-red-500"
                        aria-label={`${index + 1}번째 포지션 삭제`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        역할명 <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="form-field disabled:cursor-not-allowed disabled:opacity-60"
                        value={position.role}
                        disabled={minimum > 0}
                        onChange={(event) =>
                          handlePositionChange(
                            index,
                            'role',
                            event.target.value,
                          )
                        }
                        required
                      >
                        <option value="" disabled>
                          모집할 포지션을 선택해주세요
                        </option>
                        {leaderPositionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {minimum > 0 && (
                        <p className="mt-1 text-xs text-slate-500">
                          참여 중인 팀원이 있어 역할명을 변경할 수 없습니다.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        전체 정원 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        min={Math.max(minimum, 1)}
                        value={position.total}
                        onChange={(event) =>
                          handlePositionChange(
                            index,
                            'total',
                            Number(event.target.value),
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    현재 참여 인원: {minimum}명
                    {minimum > 0 &&
                      ` · 최소 ${minimum}명 이상으로 설정해야 합니다.`}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              기술 스택
            </h3>
            <p className="mb-4 text-xs text-slate-500">
              프로젝트에서 사용하는 주요 기술을 추가하거나 삭제해주세요.
            </p>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {form.techStacks.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 rounded-full bg-white py-1 pl-3 pr-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="rounded-full p-0.5 transition-colors hover:bg-slate-100"
                      aria-label={`${tech} 기술 스택 삭제`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {form.techStacks.length === 0 && (
                  <span className="text-sm text-slate-500">
                    등록된 기술 스택이 없습니다.
                  </span>
                )}
              </div>

              <Input
                placeholder="기술 스택 입력 후 Enter (예: React, Node.js)"
                value={techInput}
                onChange={(event) => setTechInput(event.target.value)}
                onKeyDown={handleAddTech}
              />

              <div className="flex flex-wrap gap-2">
                <span className="py-1 text-xs text-slate-500">추천:</span>
                {popularTechStacks.slice(0, 8).map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() =>
                      !form.techStacks.includes(tech) &&
                      setForm({
                        ...form,
                        techStacks: [...form.techStacks, tech],
                      })
                    }
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    + {tech}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-slate-900">
            <span className="section-step">
              3
            </span>
            분류 및 모집 일정
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            프로젝트 분야와 팀원 모집 기간 및 진행 상태를 설정합니다.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <p className="mb-2 text-xs text-slate-500">
                  프로젝트와 가장 가까운 분야를 선택해주세요.
                </p>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target
                        .value as ProjectUpdateRequest['category'],
                    })
                  }
                  className="form-select"
                >
                  <option value="Web">웹</option>
                  <option value="Mobile">모바일</option>
                  <option value="AI">AI / 데이터</option>
                  <option value="Game">게임</option>
                  <option value="Other">기타</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  모집 마감일 <span className="text-red-500">*</span>
                </label>
                <p className="mb-2 text-xs text-slate-500">
                  오늘 이후의 팀원 모집 마감일을 선택해주세요.
                </p>
                <Input
                  type="date"
                  min={minimumDeadline}
                  value={form.deadline}
                  onChange={(event) =>
                    setForm({ ...form, deadline: event.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                모집 상태
              </label>
              <p className="mb-3 text-xs text-slate-500">
                모집을 마감하면 새로운 지원자가 프로젝트에 지원할 수 없습니다.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label
                  className={`cursor-pointer rounded-lg border p-4 ${
                    form.open
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="recruitmentStatus"
                    checked={form.open}
                    onChange={() => setForm({ ...form, open: true })}
                    className="mr-2"
                  />
                  <span className="font-medium text-slate-900">모집 중</span>
                  <span className="mt-1 block pl-6 text-xs text-slate-500">
                    새로운 팀원의 지원을 받습니다.
                  </span>
                </label>
                <label
                  className={`cursor-pointer rounded-lg border p-4 ${
                    !form.open
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="recruitmentStatus"
                    checked={!form.open}
                    onChange={() => setForm({ ...form, open: false })}
                    className="mr-2"
                  />
                  <span className="font-medium text-slate-900">모집 마감</span>
                  <span className="mt-1 block pl-6 text-xs text-slate-500">
                    더 이상 새로운 지원을 받지 않습니다.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8">
          <div className="mb-2 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <span className="section-step">
                4
              </span>
              프로젝트 목표
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddGoal}
              className="h-8 text-blue-600"
            >
              <Plus className="mr-1 h-4 w-4" />
              목표 추가
            </Button>
          </div>
          <p className="mb-6 text-sm text-slate-500">
            팀이 함께 달성하려는 구체적인 결과를 항목별로 작성해주세요.
          </p>

          <div className="space-y-3">
            {form.goals.map((goal, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <div className="flex-1">
                  <Input
                    value={goal}
                    onChange={(event) =>
                      handleGoalChange(index, event.target.value)
                    }
                    placeholder="예: 3개월 안에 MVP를 완성하고 배포하기"
                  />
                </div>
                {form.goals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(index)}
                    className="mt-0.5 p-2 text-slate-400 transition-colors hover:text-red-500"
                    aria-label={`${index + 1}번째 목표 삭제`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="flex items-center justify-end gap-4 border-t border-slate-200 pt-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            취소
          </Button>
          <Button
            type="submit"
            variant="gradient"
            className="px-8"
            disabled={submitting}
          >
            {submitting ? '수정 중...' : '수정 완료'}
          </Button>
        </div>
      </form>
    </div>
  )
}
