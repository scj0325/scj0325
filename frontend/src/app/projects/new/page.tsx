'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { ArrowLeft, CheckCircle2, Plus, X } from 'lucide-react'

import { Badge, Button, Card, Input } from '../../../components/ui'
import { LoginModal } from '../../../components/LoginModal'
import { createProject, fetchPopularTechStacks } from '../../../lib/api'
import { leaderPositionOptions } from '../../../constants/project'
import type { ProjectCreateRequest } from '../../../types/dto/project'
import type { PositionType } from '../../../types/enums/project'
import { useAuth } from '../../providers'


export default function ProjectCreatePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const today = new Date()
  const currentYear = today.getFullYear()
  const minimumDeadline = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
  const [popularTechStacks, setPopularTechStacks] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Web')
  const [deadline, setDeadline] = useState('')
  const [leaderPosition, setLeaderPosition] = useState<PositionType | ''>('')
  const [selectedTechs, setSelectedTechs] = useState<string[]>([])
  const [techInput, setTechInput] = useState('')
  const [positions, setPositions] = useState([
    {
      role: '',
      total: 1,
    },
  ])
  const [goals, setGoals] = useState([''])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchPopularTechStacks()
      .then(setPopularTechStacks)
      .catch(() => setPopularTechStacks([]))
  }, [])

  const handleAddTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault()
      if (!selectedTechs.includes(techInput.trim())) {
        setSelectedTechs([...selectedTechs, techInput.trim()])
      }
      setTechInput('')
    }
  }

  const removeTech = (tech: string) => {
    setSelectedTechs(selectedTechs.filter((t) => t !== tech))
  }

  const handleAddPosition = () => {
    setPositions([
      ...positions,
      {
        role: '',
        total: 1,
      },
    ])
  }

  const handleRemovePosition = (index: number) => {
    setPositions(positions.filter((_, i) => i !== index))
  }

  const handlePositionChange = (
    index: number,
    field: 'role' | 'total',
    value: string | number,
  ) => {
    const newPositions = [...positions]
    newPositions[index] = {
      ...newPositions[index],
      [field]: value,
    }
    setPositions(newPositions)
  }

  const handleAddGoal = () => {
    setGoals([...goals, ''])
  }

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index))
  }

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...goals]
    newGoals[index] = value
    setGoals(newGoals)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    const normalizedPositions = positions
      .map((position) => ({
        role: position.role.trim(),
        total: position.total,
      }))
      .filter((position) => position.role)

    if (
      !title.trim() ||
      !description.trim() ||
      !deadline ||
      !leaderPosition ||
      normalizedPositions.length === 0
    ) {
      toast.error('필수 항목을 모두 입력해주세요.')
      return
    }

    if (deadline < minimumDeadline) {
      toast.error('모집 마감일은 오늘보다 이전으로 설정할 수 없습니다.')
      return
      toast.error(`${currentYear}년 이전 날짜는 선택할 수 없습니다.`)
      return
    }

    const payload: ProjectCreateRequest = {
      title: title.trim(),
      description: description.trim(),
      category: category as ProjectCreateRequest['category'],
      goals: goals.map((goal) => goal.trim()).filter(Boolean),
      deadline,
      open: true,
      leaderPosition,
      techStacks: selectedTechs,
      positions: normalizedPositions,
    }

    setIsSubmitting(true)

    try {
      const createdProject = await createProject(payload)
      toast.success('프로젝트가 성공적으로 등록되었습니다.', {
        icon: <CheckCircle2 className="text-green-500" />,
      })
      router.push(`/projects/${createdProject.id}`)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '프로젝트 등록 중 오류가 발생했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!authLoading && !user) {
    return <LoginModal onClose={() => router.replace('/')} />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 뒤로 가기
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          프로젝트 등록
        </h1>
        <p className="text-slate-500">
          새로운 아이디어를 실현할 팀원들을 찾아보세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. 기본 정보 */}
        <Card className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="section-step">
              1
            </span>
            기본 정보
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                프로젝트 제목 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="예: 실시간 협업 화이트보드 툴"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                프로젝트 설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                className="form-textarea min-h-[150px]"
                placeholder="프로젝트의 배경, 해결하고자 하는 문제, 주요 기능 등을 상세히 적어주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

          </div>
        </Card>

        {/* 2. 분류 및 일정 */}
        <Card className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="section-step">
              2
            </span>
            분류 및 일정
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Web">웹</option>
                <option value="Mobile">모바일</option>
                <option value="AI">AI / 데이터</option>
                <option value="Game">게임</option>
                <option value="Other">기타</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                모집 마감일 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                min={minimumDeadline}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>
        </Card>

        {/* 3. 기술 및 팀 */}
        <Card className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="section-step">
              3
            </span>
            기술 및 팀 구성
          </h2>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                리더 본인 포지션 <span className="text-red-500">*</span>
              </label>
              <select
                className="form-field"
                value={leaderPosition}
                onChange={(e) =>
                  setLeaderPosition(e.target.value as PositionType)
                }
                required
              >
                <option value="" disabled>
                  본인의 프로젝트 포지션을 선택해주세요
                </option>
                {leaderPositionOptions.map((position) => (
                  <option key={position.value} value={position.value}>
                    {position.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                사용 기술 스택
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTechs.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="pl-3 pr-1 py-1 flex items-center gap-1"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="hover:bg-slate-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="기술 스택 입력 후 Enter (예: React, Node.js)"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleAddTech}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-slate-500 py-1">추천:</span>
                {popularTechStacks.slice(0, 6).map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() =>
                      !selectedTechs.includes(tech) &&
                      setSelectedTechs([...selectedTechs, tech])
                    }
                    className="text-xs bg-slate-50 text-slate-600 border border-slate-200 rounded-md px-2 py-1 hover:bg-slate-100 transition-colors"
                  >
                    + {tech}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  모집 포지션 <span className="text-red-500">*</span>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddPosition}
                  className="h-8 text-blue-600"
                >
                  <Plus className="w-4 h-4 mr-1" /> 포지션 추가
                </Button>
              </div>

              <div className="space-y-3">
                {positions.map((pos, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <select
                        className="form-field"
                        value={pos.role}
                        onChange={(e) =>
                          handlePositionChange(index, 'role', e.target.value)
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
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        placeholder="인원"
                        value={pos.total}
                        onChange={(e) =>
                          handlePositionChange(
                            index,
                            'total',
                            parseInt(e.target.value) || 1,
                          )
                        }
                        required
                      />
                    </div>
                    <span className="text-slate-500 text-sm">명</span>
                    {positions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePosition(index)}
                        className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* 4. 목표 */}
        <Card className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
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
              <Plus className="w-4 h-4 mr-1" /> 목표 추가
            </Button>
          </div>

          <div className="space-y-3">
            {goals.map((goal, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></div>
                <div className="flex-1">
                  <Input
                    placeholder="프로젝트를 통해 달성하고자 하는 목표를 적어주세요."
                    value={goal}
                    onChange={(e) => handleGoalChange(index, e.target.value)}
                  />
                </div>
                {goals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(index)}
                    className="text-slate-400 hover:text-red-500 p-2 transition-colors mt-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            취소
          </Button>
          <Button
            type="submit"
            variant="gradient"
            className="px-8"
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '프로젝트 등록하기'}
          </Button>
        </div>
      </form>
    </div>
  )
}
