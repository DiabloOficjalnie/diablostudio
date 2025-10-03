'use client'

import { useEffect, useRef } from 'react'

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    borderWidth?: number
  }>
}

interface ChartsProps {
  data: {
    daily: Array<{ date: string, revenue: number, orders: number }>
    monthly: Array<{ month: string, revenue: number, orders: number }>
  }
}

export function RevenueChart({ data }: { data: ChartData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Simple chart drawing with Canvas API
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    // Draw chart background
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, width, height)

    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= data.labels.length; i++) {
      const x = (width / data.labels.length) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Draw data line
    if (data.datasets[0]?.data.length > 0) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 3
      ctx.beginPath()

      data.datasets[0].data.forEach((value, index) => {
        const x = (width / data.labels.length) * index + (width / data.labels.length) / 2
        const y = height - (value / Math.max(...data.datasets[0].data)) * height * 0.8

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Draw data points
      ctx.fillStyle = '#3b82f6'
      data.datasets[0].data.forEach((value, index) => {
        const x = (width / data.labels.length) * index + (width / data.labels.length) / 2
        const y = height - (value / Math.max(...data.datasets[0].data)) * height * 0.8

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
      })
    }

  }, [data])

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Przychody dzienne</h3>
      <canvas
        ref={canvasRef}
        className="w-full h-64"
        style={{ maxWidth: '100%' }}
      />
    </div>
  )
}

export function OrdersChart({ data }: { data: ChartData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear and setup canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    // Draw bars
    if (data.datasets[0]?.data.length > 0) {
      const barWidth = width / data.labels.length * 0.6
      const maxValue = Math.max(...data.datasets[0].data)

      data.datasets[0].data.forEach((value, index) => {
        const x = (width / data.labels.length) * index + (width / data.labels.length) * 0.2
        const barHeight = (value / maxValue) * height * 0.8
        const y = height - barHeight

        // Draw bar
        ctx.fillStyle = '#10b981'
        ctx.fillRect(x, y, barWidth, barHeight)

        // Draw border
        ctx.strokeStyle = '#059669'
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, barWidth, barHeight)

        // Draw value on top
        ctx.fillStyle = '#374151'
        ctx.font = '12px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(
          value.toString(),
          x + barWidth / 2,
          y - 8
        )
      })
    }

  }, [data])

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Zamówienia miesięczne</h3>
      <canvas
        ref={canvasRef}
        className="w-full h-64"
        style={{ maxWidth: '100%' }}
      />
    </div>
  )
}

export function TrafficChart({ data }: { data: ChartData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear and setup canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    // Draw pie chart
    if (data.datasets[0]?.data.length > 0) {
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 3

      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

      let currentAngle = 0
      const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0)

      data.datasets[0].data.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI

        // Draw slice
        ctx.fillStyle = colors[index % colors.length]
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
        ctx.closePath()
        ctx.fill()

        // Draw border
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw label
        const labelAngle = currentAngle + sliceAngle / 2
        const labelX = centerX + Math.cos(labelAngle) * (radius + 20)
        const labelY = centerY + Math.sin(labelAngle) * (radius + 20)

        ctx.fillStyle = '#374151'
        ctx.font = '12px Inter, sans-serif'
        ctx.textAlign = labelX > centerX ? 'left' : 'right'
        ctx.fillText(
          data.labels[index] || `Segment ${index + 1}`,
          labelX,
          labelY
        )

        currentAngle += sliceAngle
      })
    }

  }, [data])

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Źródła ruchu</h3>
      <canvas
        ref={canvasRef}
        className="w-full h-64"
        style={{ maxWidth: '100%' }}
      />
    </div>
  )
}

export function ConversionFunnel({ data }: { data: any }) {
  const steps = [
    { name: 'Odwiedziny', value: 10000, color: '#3b82f6' },
    { name: 'Wyświetl. kolorów', value: 3500, color: '#8b5cf6' },
    { name: 'Konsultacje', value: 890, color: '#10b981' },
    { name: 'Zamówienia', value: 234, color: '#f59e0b' },
    { name: 'Finalizacja', value: 198, color: '#ef4444' }
  ]

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Lejek konwersji</h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const percentage = (step.value / steps[0].value) * 100
          const prevValue = index > 0 ? steps[index - 1].value : step.value
          const conversionRate = (step.value / prevValue) * 100

          return (
            <div key={step.name} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{step.name}</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{step.value.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{percentage.toFixed(1)}% od startu</div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: step.color
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white mix-blend-difference">
                    {conversionRate.toFixed(1)}% konwersji
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function KPICards({ data }: { data: any }) {
  const kpis = [
    {
      title: 'Średnia wartość zamówienia',
      value: '1,247 PLN',
      change: '+8.2%',
      trend: 'up',
      icon: '💰',
      color: 'green'
    },
    {
      title: 'Customer Lifetime Value',
      value: '8,450 PLN',
      change: '+12.5%',
      trend: 'up',
      icon: '👑',
      color: 'blue'
    },
    {
      title: 'Churn Rate',
      value: '3.2%',
      change: '-0.8%',
      trend: 'down',
      icon: '📉',
      color: 'red'
    },
    {
      title: 'Customer Satisfaction',
      value: '4.7/5',
      change: '+0.3',
      trend: 'up',
      icon: '⭐',
      color: 'yellow'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
              <p className={`text-sm mt-2 ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.change} vs poprzedni miesiąc
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
              kpi.color === 'green' ? 'bg-green-100' :
              kpi.color === 'blue' ? 'bg-blue-100' :
              kpi.color === 'red' ? 'bg-red-100' :
              'bg-yellow-100'
            }`}>
              {kpi.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
