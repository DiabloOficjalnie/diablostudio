'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import Quiz from '@/app/components/Quiz'
import { clientModules } from '@/app/edukacja/content'

type CategoryKey = 'all' | 'journey' | 'preparation' | 'installation' | 'aftercare'

const CATEGORY_LABELS: Record<Exclude<CategoryKey, 'all'>, string> = {
  journey: 'Proces współpracy',
  preparation: 'Przygotowanie',
  installation: 'Realizacja',
  aftercare: 'Po realizacji',
}

export default function ClientEducationPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const supabase = createClientComponentClient()

  // UI state
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [showLessonViewer, setShowLessonViewer] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(true)

  // Progress state (DB-synced) key: `${moduleId}:${lessonId}`
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.replace('/login')
      return
    }
    loadProgressFromDB()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user])

  async function loadProgressFromDB() {
    try {
      setLoadingProgress(true)
      if (!user?.id) return
      const { data, error } = await supabase
        .from('user_guide_progress')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('loadProgressFromDB error:', error)
        setCompletedLessons({})
        return
      }

      const map: Record<string, boolean> = {}
      ;(data || []).forEach((row: any) => {
        const moduleId = String(row.guide_id)
        const step = Number(row.current_step || 0)
        const mod = clientModules.find((m) => m.id === moduleId)
        if (!mod) return
        for (let i = 0; i < Math.min(step, mod.lessons.length); i++) {
          const lesson = mod.lessons[i]
          map[`${moduleId}:${lesson.id}`] = true
        }
      })
      setCompletedLessons(map)
    } catch (e) {
      console.error('loadProgressFromDB error:', e)
      setCompletedLessons({})
    } finally {
      setLoadingProgress(false)
    }
  }

  async function saveProgressToDB(moduleId: string) {
    try {
      if (!user?.id) return
      const mod = clientModules.find((m) => m.id === moduleId)
      if (!mod) return
      const total = mod.lessons.length
      const count = mod.lessons.reduce((acc, l) => acc + (completedLessons[`${moduleId}:${l.id}`] ? 1 : 0), 0)
      const { error } = await supabase
        .from('user_guide_progress')
        .upsert({
          user_id: user.id,
          guide_id: moduleId,
          current_step: Math.min(count, total),
          completed: count >= total,
          quiz_results: {}, // miejsce na wyniki quizów per lekcja
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('saveProgressToDB error:', error)
      }
    } catch (e) {
      console.error('saveProgressToDB error:', e)
    }
  }

  // Navigation helpers
  const openLesson = (moduleId: string, lessonId: string) => {
    setActiveModuleId(moduleId)
    setActiveLessonId(lessonId)
    setShowLessonViewer(true)
  }

  const closeLesson = () => {
    setShowLessonViewer(false)
    setActiveLessonId(null)
    setActiveModuleId(null)
  }

  const markLessonCompleted = (moduleId: string, lessonId: string) => {
    const key = `${moduleId}:${lessonId}`
    setCompletedLessons((prev) => {
      if (prev[key]) return prev
      const next = { ...prev, [key]: true }
      // Persist to DB (async)
      saveProgressToDB(moduleId)
      return next
    })
  }

  const filteredModules = useMemo(() => {
    if (activeCategory === 'all') return clientModules
    return clientModules.filter((m) => m.category === activeCategory)
  }, [activeCategory])

  const getModuleProgress = (moduleId: string) => {
    const mod = clientModules.find((m) => m.id === moduleId)
    if (!mod) return { count: 0, total: 0, percent: 0 }
    const total = mod.lessons.length
    const count = mod.lessons.reduce((acc, l) => acc + (completedLessons[`${moduleId}:${l.id}`] ? 1 : 0), 0)
    const percent = Math.round((count / Math.max(1, total)) * 100)
    return { count, total, percent }
  }

  const totalLessons = clientModules.reduce((acc, m) => acc + m.lessons.length, 0)
  const completedCount = Object.values(completedLessons).filter(Boolean).length
  const overallProgress = Math.round((completedCount / Math.max(1, totalLessons)) * 100)

  // Quiz mapping
  function mapLessonQuestions(lesson: NonNullable<(typeof clientModules)[number]['lessons'][number]>) {
    const questions =
      (lesson.quiz || []).map((q, idx) => ({
        id: idx + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      })) || []
    return questions
  }

  // Guard
  if (!isLoaded) return null
  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white mb-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Edukacja</h1>
              <p className="mt-2 text-indigo-100 max-w-2xl">
                Zrozumiesz proces współpracy, przygotowanie, przebieg realizacji i pielęgnację.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 min-w-[260px]">
              <div className="text-sm text-indigo-100 mb-2">Twój postęp (konto)</div>
              <div className="text-3xl font-bold">{overallProgress}%</div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              {loadingProgress && (
                <div className="mt-2 text-xs text-indigo-100">Ładowanie postępu…</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            Wszystko
          </button>
          {(['journey', 'preparation', 'installation', 'aftercare'] as Array<Exclude<CategoryKey, 'all'>>).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredModules.map((mod) => {
          const progress = getModuleProgress(mod.id)
          return (
            <div
              key={mod.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-indigo-700/70 font-bold mb-1">
                      {CATEGORY_LABELS[mod.category as Exclude<CategoryKey, 'all'>]}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{mod.title}</h3>
                    <p className="text-gray-600 mt-2">{mod.description}</p>
                    <div className="text-xs text-gray-500 mt-1">Czas: {mod.estimatedTime}</div>
                  </div>
                  <div className="text-right min-w-[90px]">
                    <div className="text-sm text-gray-500">Postęp</div>
                    <div className="font-bold text-gray-900">
                      {progress.count}/{progress.total}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Lekcje</div>
                  <div className="space-y-2">
                    {mod.lessons.map((lesson, idx) => {
                      const done = !!completedLessons[`${mod.id}:${lesson.id}`]
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-white border">
                              {done ? '✅' : idx + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{lesson.title}</div>
                              <div className="text-xs text-gray-600">
                                {lesson.readTimeMin ? `~${lesson.readTimeMin} min` : 'krótko'}
                                {lesson.quiz?.length ? ` • quiz ${lesson.quiz.length} pyt.` : ''}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => openLesson(mod.id, lesson.id)}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                              done
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {done ? 'Przeczytano' : 'Czytaj'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Lesson Viewer (Modal) */}
      {showLessonViewer && activeModuleId && activeLessonId && (() => {
        const mod = clientModules.find((m) => m.id === activeModuleId)
        const lesson = mod?.lessons.find((l) => l.id === activeLessonId)
        if (!mod || !lesson) return null

        const onComplete = () => {
          markLessonCompleted(mod.id, lesson.id)
        }
        const onProceed = () => {
          markLessonCompleted(mod.id, lesson.id)
          // Go to next lesson if exists
          const idx = mod.lessons.findIndex((l) => l.id === lesson.id)
          const next = mod.lessons[idx + 1]
          if (next) {
            setActiveLessonId(next.id)
          } else {
            closeLesson()
          }
        }

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl max-h-[90vh] overflow-y-auto relative">
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-indigo-700/70 font-bold mb-1">
                      {CATEGORY_LABELS[mod.category as Exclude<CategoryKey, 'all'>]}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{mod.title}</h3>
                    <p className="text-gray-600">{lesson.title}</p>
                    {lesson.readTimeMin && (
                      <p className="text-xs text-gray-500 mt-1">~{lesson.readTimeMin} min czytania</p>
                    )}
                  </div>
                  <button
                    onClick={closeLesson}
                    aria-label="Zamknij"
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Summary */}
                {lesson.summary && (
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h5 className="text-sm font-semibold text-amber-900 mb-1 flex items-center">
                      <span className="text-lg mr-2">💡</span>
                      W skrócie
                    </h5>
                    <p className="text-sm text-amber-800">{lesson.summary}</p>
                  </div>
                )}

                {/* Body */}
                <div className="prose prose-indigo max-w-none text-gray-800 text-base leading-relaxed">
                  {lesson.body}
                </div>

                {/* Sources */}
                {lesson.sources && lesson.sources.length > 0 && (
                  <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h5 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center">
                      <span className="text-lg mr-2">🔎</span>
                      Źródła i odniesienia
                    </h5>
                    <ul className="list-disc pl-5 text-sm text-blue-900">
                      {lesson.sources.map((src, i) => (
                        <li key={i} className="mb-1">
                          {src.url ? (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                            >
                              {src.label}
                            </a>
                          ) : (
                            <span>{src.label}</span>
                          )}
                          <span className="ml-2 text-indigo-700/70">[{src.source}]</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-indigo-700/70">
                      Parametry krytyczne (czasy, wilgotność, temperatury, środki pielęgnacji)
                      zawsze weryfikujemy w najnowszej karcie technicznej (TDS) producenta.
                    </p>
                  </div>
                )}

                {/* Quiz or Acknowledge */}
                <div className="mt-6">
                  {lesson.quiz && lesson.quiz.length > 0 ? (
                    <div className="border-t pt-6">
                      <h5 className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
                        <span className="text-lg mr-2">🧠</span>
                        Krótki test wiedzy
                      </h5>
                      <Quiz
                        questions={mapLessonQuestions(lesson)}
                        onComplete={onComplete}
                        onProceed={onProceed}
                        proceedLabel="Przejdź dalej"
                      />
                    </div>
                  ) : (
                    <div className="border-t pt-6">
                      <button
                        onClick={onProceed}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
                      >
                        ✅ Rozumiem, następny krok
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeLesson}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition border border-gray-200"
                  >
                    Zamknij
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
