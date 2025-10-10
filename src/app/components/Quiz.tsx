'use client'

import { useState } from 'react'

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

export default function Quiz({ onComplete, questions: externalQuestions }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [quizCompleted, setQuizCompleted] = useState(false)

  const defaultQuestions: Question[] = [
    {
      id: 1,
      question: "Która żywica lepiej nadaje się do zastosowań zewnętrznych?",
      options: [
        "Epoksyd - ze względu na twardość",
        "Poliuretan - ze względu na odporność na UV",
        "Obie nadają się równie dobrze",
        "Żadna nie nadaje się na zewnątrz"
      ],
      correctAnswer: 1,
      explanation: "Poliuretan jest odporny na promieniowanie UV i warunki atmosferyczne, dlatego lepiej sprawdza się na zewnątrz niż epoksyd."
    },
    {
      id: 2,
      question: "Jaka jest maksymalna dopuszczalna wilgotność podłoża dla epoksydu?",
      options: [
        "≤ 3%",
        "≤ 4%",
        "≤ 5%",
        "≤ 6%"
      ],
      correctAnswer: 1,
      explanation: "Dla systemów epoksydowych maksymalna wilgotność podłoża nie powinna przekraczać 4%."
    },
    {
      id: 3,
      question: "Który system posadzek żywicznych jest bardziej elastyczny?",
      options: [
        "Epoksyd",
        "Poliuretan",
        "Oba są równie elastyczne",
        "Żaden nie jest elastyczny"
      ],
      correctAnswer: 1,
      explanation: "Poliuretan jest bardziej elastyczny i odporny na uderzenia niż twardy epoksyd."
    },
    {
      id: 4,
      question: "Jaka powinna być minimalna twardość podłoża betonowego?",
      options: [
        "C15/20",
        "C20/25",
        "C25/30",
        "C30/37"
      ],
      correctAnswer: 1,
      explanation: "Minimalna klasa betonu powinna wynosić C20/25 według norm FeRFA."
    },
    {
      id: 5,
      question: "W jakiej temperaturze powinno się aplikować posadzki żywiczne?",
      options: [
        "+5–20°C",
        "+10–25°C",
        "+15–30°C",
        "+20–35°C"
      ],
      correctAnswer: 1,
      explanation: "Optymalna temperatura aplikacji to +10–25°C przy wilgotności powietrza poniżej 75%."
    }
  ]

  const questions: Question[] = (externalQuestions && externalQuestions.length > 0) ? externalQuestions : defaultQuestions
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const checkAnswer = () => {
    if (selectedAnswer === null) return

    const correct = selectedAnswer === currentQuestion.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      const newAnswers = [...answers]
      newAnswers[currentQuestionIndex] = selectedAnswer
      setAnswers(newAnswers)
    }
  }

  const nextQuestion = () => {
    if (isCorrect) {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setShowResult(false)
        setIsCorrect(false)
      } else {
        setQuizCompleted(true)
        onComplete?.()
      }
    }
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setIsCorrect(false)
    setAnswers([])
    setQuizCompleted(false)
  }

  if (quizCompleted) {
    const correctAnswers = answers.filter((answer, index) =>
      answer === questions[index].correctAnswer
    ).length

    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Quiz ukończony!
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Poprawne odpowiedzi: {correctAnswers} z {questions.length}
          </p>
          <div className="mb-8">
            <div className="text-4xl font-bold mb-2">
              {Math.round((correctAnswers / questions.length) * 100)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(correctAnswers / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <button
            onClick={resetQuiz}
            className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Rozpocznij ponownie
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-600">
            Pytanie {currentQuestionIndex + 1} z {questions.length}
          </span>
          <span className="text-sm font-semibold text-gray-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {currentQuestion.question}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedAnswer === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${
                showResult && index === currentQuestion.correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : ''
              } ${
                showResult && selectedAnswer === index && !isCorrect
                  ? 'border-red-500 bg-red-50'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={index}
                checked={selectedAnswer === index}
                onChange={() => handleAnswerSelect(index)}
                disabled={showResult}
                className="mr-3 w-4 h-4 text-blue-600"
              />
              <span className={`text-lg ${
                showResult && index === currentQuestion.correctAnswer
                  ? 'text-green-800 font-semibold'
                  : showResult && selectedAnswer === index && !isCorrect
                  ? 'text-red-800'
                  : 'text-gray-700'
              }`}>
                {option}
                {showResult && index === currentQuestion.correctAnswer && (
                  <span className="ml-2 text-green-600">✓</span>
                )}
                {showResult && selectedAnswer === index && !isCorrect && (
                  <span className="ml-2 text-red-600">✗</span>
                )}
              </span>
            </label>
          ))}
        </div>

        {/* Explanation */}
        {showResult && (
          <div className={`mt-6 p-4 rounded-lg ${
            isCorrect
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-lg ${
              isCorrect ? 'text-green-800' : 'text-red-800'
            }`}>
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        {!showResult ? (
          <button
            onClick={checkAnswer}
            disabled={selectedAnswer === null}
            className={`px-8 py-3 text-lg font-semibold rounded-lg transition-colors ${
              selectedAnswer !== null
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Sprawdź odpowiedź
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className={`px-8 py-3 text-lg font-semibold rounded-lg transition-colors ${
              isCorrect
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Następne pytanie' : 'Zakończ quiz'}
          </button>
        )}
      </div>
    </div>
  )
}
