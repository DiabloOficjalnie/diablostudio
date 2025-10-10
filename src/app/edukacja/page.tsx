'use client'

import { useEffect, useMemo, useState } from 'react'
import MainLayout from '../components/MainLayout'
import Quiz from '../components/Quiz'
import { clientModules } from './content'

type CategoryKey = 'all' | 'journey' | 'preparation' | 'installation' | 'aftercare'

const CATEGORY_LABELS: Record<Exclude<CategoryKey, 'all'>, string> = {
  journey: 'Proces współpracy',
  preparation: 'Przygotowanie',
  installation: 'Realizacja',
  aftercare: 'Po realizacji',
}

export default function EducationPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({})
  const [showLessonViewer, setShowLessonViewer] = useState(false)

  // Persist simple local progress (dla pełnego śledzenia zapraszamy do panelu klienta)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('client_edu_progress')
      if (stored) setCompletedLessons(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('client_edu_progress', JSON.stringify(completedLessons))
    } catch {}
  }, [completedLessons])

  const filteredModules = useMemo(() => {
    if (activeCategory === 'all') return clientModules
    return clientModules.filter((m) => m.category === activeCategory)
  }, [activeCategory])

  const activeModule = useMemo(
    () => clientModules.find((m) => m.id === activeModuleId) || null,
    [activeModuleId]
  )

  const activeLesson = activeModule?.lessons.find((l) => l.id === activeLessonId) || null

  const totalLessons = clientModules.reduce((acc, m) => acc + m.lessons.length, 0)
  const completedCount = Object.values(completedLessons).filter(Boolean).length
  const overallProgress = Math.round((completedCount / Math.max(1, totalLessons)) * 100)

  const isLessonCompleted = (moduleId: string, lessonId: string) =>
    !!completedLessons[`${moduleId}:${lessonId}`]

  const handleLessonComplete = (moduleId: string, lessonId: string) => {
    setCompletedLessons((prev) => ({ ...prev, [`${moduleId}:${lessonId}`]: true }))
  }

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

  const getModuleProgress = (moduleId: string) => {
    const mod = clientModules.find((m) => m.id === moduleId)
    if (!mod) return { count: 0, total: 0, percent: 0 }
    const total = mod.lessons.length
    const count = mod.lessons.reduce(
      (acc, l) => acc + (isLessonCompleted(moduleId, l.id) ? 1 : 0),
      0
    )
    const percent = Math.round((count / Math.max(1, total)) * 100)
    return { count, total, percent }
  }

  const mapLessonQuestions = (lesson: NonNullable<typeof activeLesson>) => {
    const questions =
      (lesson.quiz || []).map((q, idx) => ({
        id: idx + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })) || []
    return questions
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-16">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                  Dział edukacyjny dla Klienta
                </h1>
                <p className="mt-4 text-blue-100 text-lg max-w-2xl">
                  Po ludzku i bez żargonu. Zrozumiesz proces współpracy, przygotowanie, przebieg
                  realizacji i pielęgnację. To nie DIY — to przewodnik, czego się spodziewać i jak się
                  przygotować.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 min-w-[260px]">
                <div className="text-sm text-blue-100 mb-2">Twój postęp (lokalnie)</div>
                <div className="text-3xl font-bold">{overallProgress}%</div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <a
                  href="/login"
                  className="inline-block mt-4 w-full text-center px-4 py-2 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition"
                >
                  Zaloguj się, aby śledzić postęp w panelu
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-6 bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                Wszystko
              </button>
              {(['journey', 'preparation', 'installation', 'aftercare'] as Array<
                Exclude<CategoryKey, 'all'>
              >).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Modules Grid */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                          <div className="text-xs uppercase tracking-wide text-blue-700/70 font-bold mb-1">
                            {CATEGORY_LABELS[mod.category]}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{mod.title}</h3>
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
                            const done = isLessonCompleted(mod.id, lesson.id)
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
                                      {lesson.quiz?.length
                                        ? ` • quiz ${lesson.quiz.length} pyt.`
                                        : ''}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => openLesson(mod.id, lesson.id)}
                                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                    done
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
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

            {/* CTA Row */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="/valuation"
                className="block p-6 rounded-xl border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-red-50 hover:shadow-md transition"
              >
                <div className="text-3xl">📋</div>
                <h4 className="mt-2 text-xl font-bold text-gray-900">Darmowa wycena</h4>
                <p className="text-gray-700 mt-1">
                  Poznaj orientacyjny koszt i zakres. Po kalkulacji zaproponujemy termin rozmowy lub wizyty.
                </p>
              </a>
              <a
                href="/login"
                className="block p-6 rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition"
              >
                <div className="text-3xl">📚</div>
                <h4 className="mt-2 text-xl font-bold text-gray-900">Panel klienta</h4>
                <p className="text-gray-700 mt-1">
                  Zaloguj się, aby śledzić postępy w kursach, zapisać wycenę i umówić konsultację.
                </p>
              </a>
            </div>
          </div>
        </section>

        {/* Lesson Viewer (Modal) */}
        {showLessonViewer && activeModule && activeLesson && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl max-h-[90vh] overflow-y-auto relative">
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-blue-700/70 font-bold mb-1">
                      {CATEGORY_LABELS[activeModule.category]}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{activeModule.title}</h3>
                    <p className="text-gray-600">{activeLesson.title}</p>
                    {activeLesson.readTimeMin && (
                      <p className="text-xs text-gray-500 mt-1">~{activeLesson.readTimeMin} min czytania</p>
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
                {activeLesson.summary && (
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h5 className="text-sm font-semibold text-amber-900 mb-1 flex items-center">
                      <span className="text-lg mr-2">💡</span>
                      W skrócie
                    </h5>
                    <p className="text-sm text-amber-800">{activeLesson.summary}</p>
                  </div>
                )}

                {/* Body */}
                <div className="prose prose-blue max-w-none text-gray-800 text-base leading-relaxed">
                  {activeLesson.body}
                </div>

                {/* Sources */}
                {activeLesson.sources && activeLesson.sources.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                      <span className="text-lg mr-2">🔎</span>
                      Źródła i odniesienia
                    </h5>
                    <ul className="list-disc pl-5 text-sm text-blue-900">
                      {activeLesson.sources.map((src, i) => (
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
                          <span className="ml-2 text-blue-700/70">[{src.source}]</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-blue-700/80">
                      Uwaga: parametry krytyczne (czasy, wilgotność, temperatury, środki pielęgnacji)
                      zawsze weryfikujemy w najnowszej karcie technicznej (TDS) producenta zastosowanego systemu.
                    </p>
                  </div>
                )}

                {/* Quiz or Acknowledge */}
                <div className="mt-6">
                  {activeLesson.quiz && activeLesson.quiz.length > 0 ? (
                    <div className="border-t pt-6">
                      <h5 className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
                        <span className="text-lg mr-2">🧠</span>
                        Krótki test wiedzy
                      </h5>
                      <Quiz
                        questions={mapLessonQuestions(activeLesson)}
                        onComplete={() => {
                          handleLessonComplete(activeModule.id, activeLesson.id)
                        }}
                      />
                    </div>
                  ) : (
                    <div className="border-t pt-6">
                      <button
                        onClick={() => {
                          handleLessonComplete(activeModule.id, activeLesson.id)
                          // Auto-close and advance to next lesson if exists
                          const idx = activeModule.lessons.findIndex((l) => l.id === activeLesson.id)
                          const next = activeModule.lessons[idx + 1]
                          if (next) {
                            setActiveLessonId(next.id)
                          } else {
                            // close if no next
                            closeLesson()
                          }
                        }}
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                      >
                        ✅ Rozumiem, następny krok
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer CTA */}
                <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-600">
                    Szukasz konkretów dotyczących wyceny lub terminu?
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="/valuation"
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold"
                    >
                      📋 Zrób wycenę
                    </a>
                    <a
                      href="/login"
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold"
                    >
                      🔐 Zaloguj się
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
