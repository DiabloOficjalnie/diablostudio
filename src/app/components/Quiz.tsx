'use client'

import { useEffect, useMemo, useState } from 'react'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizProps {
  onComplete?: () => void
  questions?: Question[]
}

type AnswerRecord = {
  selected: number | null // null = pominięto
  correct: boolean
}

export default function Quiz({ onComplete, questions: externalQuestions }: QuizProps) {
  // Domyślny zestaw (fallback, gdy brak pytań wejściowych)
  const defaultQuestions: Question[] = [
    {
      id: 1,
      question: 'Która żywica lepiej nadaje się do zastosowań zewnętrznych?',
      options: [
        'Epoksyd - ze względu na twardość',
        'Poliuretan - ze względu na odporność na UV',
        'Obie nadają się równie dobrze',
        'Żadna nie nadaje się na zewnątrz',
      ],
      correctAnswer: 1,
      explanation:
        'Poliuretan charakteryzuje się lepszą odpornością na promieniowanie UV i warunki atmosferyczne niż epoksyd, dlatego częściej stosuje się go na zewnątrz.',
    },
    {
      id: 2,
      question: 'Jaka jest orientacyjna, maksymalna wilgotność podłoża dla systemów epoksydowych?',
      options: ['≤ 3%', '≤ 4%', '≤ 5%', '≤ 6%'],
      correctAnswer: 1,
      explanation:
        'W praktyce często przyjmuje się ok. 4% dla wielu systemów (zawsze weryfikuj w karcie technicznej TDS danego producenta).',
    },
    {
      id: 3,
      question: 'Który system posadzek żywicznych jest bardziej elastyczny?',
      options: ['Epoksyd', 'Poliuretan', 'Oba są równie elastyczne', 'Żaden nie jest elastyczny'],
      correctAnswer: 1,
      explanation:
        'Poliuretan jest bardziej elastyczny i lepiej znosi odkształcenia oraz drgania podłoża niż epoksyd.',
    },
  ]

  const questions: Question[] =
    externalQuestions && externalQuestions.length > 0 ? externalQuestions : defaultQuestions

  // Stan
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [records, setRecords] = useState<AnswerRecord[]>(
    Array.from({ length: questions.length }, () => ({ selected: null, correct: false })),
  )
  const [showSummary, setShowSummary] = useState(false)

  const current = questions[index]

  // Reset przy zmianie zestawu pytań
  useEffect(() => {
    setRecords(Array.from({ length: questions.length }, () => ({ selected: null, correct: false })))
    setIndex(0)
    setSelected(null)
    setChecked(false)
    setShowSummary(false)
  }, [questions])

  // Metryki
  const answeredCount = useMemo(
    () => records.filter((r) => r && r.selected !== null).length,
    [records],
  )
  const correctCount = useMemo(
    () => records.filter((r) => r && r.selected !== null && r.correct).length,
    [records],
  )
  const progressPercent = Math.round(((index + 1) / Math.max(1, questions.length)) * 100)

  // Obsługa wyboru i nawigacji
  const selectOption = (i: number) => {
    if (checked) return
    setSelected(i)
  }

  const onCheck = () => {
    if (selected === null || checked) return
    const correct = selected === current.correctAnswer
    const next = [...records]
    next[index] = { selected, correct }
    setRecords(next)
    setChecked(true)
  }

  const goNext = () => {
    if (!checked) return
    if (index < questions.length - 1) {
      const nextIdx = index + 1
      setIndex(nextIdx)
      const rec = records[nextIdx]
      setSelected(rec?.selected ?? null)
      setChecked(rec?.selected !== null) // jeśli było już odpow., od razu pokaż wynik
    } else {
      setShowSummary(true)
      onComplete?.()
    }
  }

  const goPrev = () => {
    if (index === 0) return
    const prevIdx = index - 1
    setIndex(prevIdx)
    const rec = records[prevIdx]
    setSelected(rec?.selected ?? null)
    setChecked(rec?.selected !== null)
  }

  const onSkip = () => {
    // Zapisz brak odpowiedzi jako pominięte (selected:null)
    const next = [...records]
    next[index] = { selected: null, correct: false }
    setRecords(next)
    if (index < questions.length - 1) {
      const nextIdx = index + 1
      setIndex(nextIdx)
      const rec = records[nextIdx]
      setSelected(rec?.selected ?? null)
      setChecked(rec?.selected !== null)
    } else {
      setShowSummary(true)
      onComplete?.()
    }
  }

  const restart = () => {
    setRecords(Array.from({ length: questions.length }, () => ({ selected: null, correct: false })))
    setIndex(0)
    setSelected(null)
    setChecked(false)
    setShowSummary(false)
  }

  const jumpTo = (i: number) => {
    setIndex(i)
    const rec = records[i]
    setSelected(rec?.selected ?? null)
    setChecked(rec?.selected !== null)
    setShowSummary(false)
  }

  // Skróty klawiszowe: 1-9 wybór opcji, Enter = Sprawdź / Dalej, N/P/S = next/prev/skip
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (showSummary) return
      if (key >= '1' && key <= '9' && !checked) {
        const i = Number(key) - 1
        if (i < current.options.length) {
          selectOption(i)
        }
      } else if (key === 'enter') {
        if (!checked && selected !== null) onCheck()
        else if (checked) goNext()
      } else if (key === 'n' || e.key === 'ArrowRight') {
        if (checked) goNext()
      } else if (key === 'p' || e.key === 'ArrowLeft') {
        goPrev()
      } else if (key === 's' && !checked) {
        onSkip()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [checked, selected, current, showSummary, records, index])

  // Widok podsumowania
  if (showSummary) {
    const scorePercent = Math.round((correctCount / Math.max(1, questions.length)) * 100)
    return (
      <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Podsumowanie testu</h2>
          <p className="text-gray-600 mt-2">
            Poprawnych odpowiedzi: <span className="font-semibold">{correctCount}</span> z{' '}
            <span className="font-semibold">{questions.length}</span>
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${scorePercent}%` }}
            />
          </div>
          <div className="text-3xl font-bold mt-3 text-gray-900">{scorePercent}%</div>
        </div>

        <div className="space-y-3 mb-8">
          {questions.map((q, i) => {
            const rec = records[i]
            const state =
              rec?.selected === null
                ? 'unanswered'
                : rec.correct
                ? 'correct'
                : 'incorrect'
            const bg =
              state === 'correct'
                ? 'bg-green-50 border-green-200'
                : state === 'incorrect'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            const icon =
              state === 'correct' ? '✅' : state === 'incorrect' ? '❌' : '⏭️'
            return (
              <button
                key={q.id}
                onClick={() => jumpTo(i)}
                className={`w-full text-left p-4 rounded-xl border ${bg} hover:opacity-90 transition`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-xl select-none">{icon}</div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Pytanie {i + 1}: {q.question}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      {rec?.selected === null ? (
                        <span className="italic text-gray-500">Pominięto</span>
                      ) : rec.correct ? (
                        <span className="text-green-700">Twoja odpowiedź była poprawna</span>
                      ) : (
                        <span className="text-red-700">Twoja odpowiedź była niepoprawna</span>
                      )}
                    </div>
                    {rec?.selected !== null && !rec.correct && (
                      <div className="text-sm text-gray-700 mt-1">
                        Poprawna odpowiedź: <strong>{q.options[q.correctAnswer]}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
          <button
            onClick={restart}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Powtórz test
          </button>
          <a
            href="/edukacja"
            className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition text-center"
          >
            Wróć do edukacji
          </a>
        </div>
      </div>
    )
  }

  // Widok pytania
  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Pasek postępu */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">
            Pytanie {index + 1} z {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Odpowiedziano: {answeredCount}/{questions.length} • {progressPercent}%
        </div>
      </div>

      {/* Treść pytania */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{current.question}</h2>

        {/* Opcje odpowiedzi */}
        <div className="space-y-3">
          {current.options.map((option, i) => {
            const isSelected = selected === i
            const isCorrectOption = checked && i === current.correctAnswer
            const isWrongSelected = checked && isSelected && i !== current.correctAnswer

            return (
              <button
                key={i}
                type="button"
                onClick={() => selectOption(i)}
                disabled={checked}
                className={[
                  'w-full text-left p-4 border-2 rounded-lg transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-blue-400',
                  isCorrectOption
                    ? 'border-green-500 bg-green-50'
                    : isWrongSelected
                    ? 'border-red-500 bg-red-50'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300',
                ].join(' ')}
              >
                <div className="flex items-center">
                  <span
                    className={[
                      'mr-3 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                      isCorrectOption
                        ? 'bg-green-600 text-white'
                        : isWrongSelected
                        ? 'bg-red-600 text-white'
                        : isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700',
                    ].join(' ')}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={[
                      'text-base',
                      isCorrectOption
                        ? 'text-green-800 font-semibold'
                        : isWrongSelected
                        ? 'text-red-800'
                        : 'text-gray-800',
                    ].join(' ')}
                  >
                    {option}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Wyjaśnienie */}
        {checked && (
          <div
            className={[
              'mt-6 p-4 rounded-lg border',
              records[index]?.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200',
            ].join(' ')}
          >
            <p className={records[index]?.correct ? 'text-green-800' : 'text-red-800'}>
              {current.explanation}
            </p>
            {!records[index]?.correct && (
              <p className="mt-2 text-sm text-gray-700">
                Poprawna odpowiedź: <strong>{current.options[current.correctAnswer]}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Przyciski akcji */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            disabled={index === 0}
            className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition"
            title="Wstecz (← / P)"
          >
            ← Wstecz
          </button>
          <button
            onClick={onSkip}
            disabled={checked}
            className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition"
            title="Pomiń (S)"
          >
            Pomiń
          </button>
        </div>

        {!checked ? (
          <button
            onClick={onCheck}
            disabled={selected === null}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              selected !== null
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            title="Sprawdź odpowiedź (Enter)"
          >
            Sprawdź odpowiedź
          </button>
        ) : (
          <button
            onClick={goNext}
            className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
            title="Następne pytanie (Enter / → / N)"
          >
            {index < questions.length - 1 ? 'Następne pytanie' : 'Zakończ test'}
          </button>
        )}
      </div>
    </div>
  )
}
