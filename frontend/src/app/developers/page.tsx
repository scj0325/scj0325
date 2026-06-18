'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import Link from 'next/link'

import { Clock, MapPin, Search, Sparkles } from 'lucide-react'

import { PaginationControls } from '../../components/PaginationControls'
import { SearchField } from '../../components/SearchField'
import { Badge, Button, Card } from '../../components/ui'
import {
  formatPositionLabel,
  leaderPositionOptions,
} from '../../constants/project'
import { fetchPopularTechStacks, fetchPortfolios } from '../../lib/api'
import type { User } from '../../types'

const roleOptions = [
  { value: 'All', label: '전체' },
  ...leaderPositionOptions,
]

export default function TalentListingPage() {
  const [paginatedTalents, setPaginatedTalents] = useState<User[]>([])
  const [featuredTalents, setFeaturedTalents] = useState<User[]>([])
  const [popularTechStacks, setPopularTechStacks] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [contentLoading, setContentLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('All')
  const [selectedTech, setSelectedTech] = useState<string>('All')

  useEffect(() => {
    fetchPopularTechStacks()
      .then(setPopularTechStacks)
      .catch(() => setPopularTechStacks([]))
  }, [])

  useEffect(() => {
    setContentLoading(true)

    fetchPortfolios({
      page,
      size: 9,
      search: searchTerm,
      role: selectedRole,
      tech: selectedTech,
    })
      .then((pageData) => {
        if (pageData && pageData.content) {
          setPaginatedTalents(pageData.content)
          setPageCount(pageData.totalPages)
          setTotalElements(pageData.totalElements)
          setFeaturedTalents(pageData.content.filter((user) => user.featured))
        } else {
          setPaginatedTalents([])
          setPageCount(0)
          setTotalElements(0)
          setFeaturedTalents([])
        }
      })
      .catch(() => {
        setPaginatedTalents([])
        setPageCount(0)
        setTotalElements(0)
        setFeaturedTalents([])
      })
      .finally(() => setContentLoading(false))
  }, [page, searchTerm, selectedRole, selectedTech])

  const changeSearchTerm = (value: string) => {
    setPage(0)
    setSearchTerm(value)
  }

  const changeRole = (value: string) => {
    setPage(0)
    setSelectedRole(value)
  }

  const changeTech = (value: string) => {
    setPage(0)
    setSelectedTech(value)
  }

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <Badge variant="purple" className="mb-4">
          포트폴리오 탐색
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 break-keep">
          함께할 뛰어난 동료를 찾아보세요
        </h1>
        <p className="text-slate-500 text-lg break-keep">
          프로젝트를 성공으로 이끌어줄 개발자, 디자이너, 기획자들의 포트폴리오를
          확인하고 영입을 제안해보세요.
        </p>
      </div>

      {/* Horizontal Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <SearchField
            placeholder="이름 / 키워드 검색..."
            value={searchTerm}
            onChange={changeSearchTerm}
          />

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Role Segmented Control */}
            <div className="segment-control overflow-x-auto">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  onClick={() => changeRole(role.value)}
                  className={`segment-option ${selectedRole === role.value ? 'segment-option-active' : 'segment-option-inactive'}`}
                >
                  {role.label}
                </button>
              ))}
            </div>

            {/* Tech Stack Select */}
            <select
              className="form-field md:w-auto"
              value={selectedTech}
              onChange={(e) => changeTech(e.target.value)}
            >
              <option value="All">전체 기술 스택</option>
              {popularTechStacks.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Featured Talents Section */}
      {featuredTalents.length > 0 && (
        <div className="mb-16">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> 추천 포트폴리오
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTalents.slice(0, 4).map((user) => (
              <Link key={user.id} href={`/u/${user.id}`}>
                <Card className="listing-card group flex text-center hover:border-blue-300 hover:shadow-md">
                  <div className="relative inline-block mx-auto mb-4">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 group-hover:border-blue-200 transition-colors"
                    />

                    <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {user.name}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium mb-3">
                    {formatPositionLabel(user.role)}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
                    {user.bio || '소개글이 없습니다.'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1 mt-auto">
                    {user.techStack?.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" /> 최신 포트폴리오
          </h2>
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-900">
              {totalElements}
            </span>
            명의 프로필
          </p>
        </div>

        {contentLoading ? (
          <div className="text-center py-24 text-slate-400 font-medium">
            조건에 맞는 포트폴리오 로드 중...
          </div>
        ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {paginatedTalents.length > 0 ? (
            paginatedTalents.map((user) => (
              <motion.div key={user.id} variants={itemVariants}>
                <Link href={`/u/${user.id}`}>
                  <Card className="listing-card group flex">
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-14 h-14 rounded-full object-cover border border-slate-100"
                      />

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {user.name}
                          </h3>
                          <Badge
                            variant="success"
                            className="text-[10px] px-2 py-0.5"
                          >
                            참여 가능
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-600 font-medium">
                          {formatPositionLabel(user.role)}
                        </p>
                        {user.location && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {user.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm mb-6 line-clamp-2 flex-1">
                      {user.bio || '아직 소개글을 작성하지 않았어요.'}
                    </p>

                    <div className="space-y-4 mt-auto">
                      <div className="flex flex-wrap gap-1.5">
                        {user.techStack?.slice(0, 5).map((tech) => (
                          <span
                            key={tech}
                            className="tech-pill"
                          >
                            {tech}
                          </span>
                        ))}
                        {user.techStack && user.techStack.length > 5 && (
                          <span className="tech-pill">
                            +{user.techStack.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                프로필을 찾을 수 없어요
              </h3>
              <p className="text-slate-500">
                검색어나 필터 조건을 변경해보세요.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setPage(0)
                  setSearchTerm('')
                  setSelectedRole('All')
                  setSelectedTech('All')
                }}
              >
                필터 초기화
              </Button>
            </div>
          )}
        </motion.div>
        )}
        <PaginationControls
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
