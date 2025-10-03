'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import { createClientComponentClient } from '@/lib/supabase'

interface Valuation {
  id: string
  object_name: string
  object_address: string
  owner_name: string
  measurement_date: string
  humidity: number | null
  temperature: number | null
  dew_point: number | null
  primer_needed: boolean
  scratch_needed: boolean
  topcoat_needed: boolean
  plinths_needed: boolean
  ground_levelling_needed: boolean
  resin_type: string
  resin_effect: string
  resin_colors: number
  tools_cost: number
  discount_percentage: number
  materials_cost: number
  labor_cost: number
  total_cost: number
  final_cost: number
  customers: {
    name: string
    email: string
    phone: string | null
  }
}

export default function ValuationPDFPage() {
  const [valuation, setValuation] = useState<Valuation | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadValuation()
  }, [])

  const loadValuation = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_valuations')
        .select(`
          *,
          customers (
            name,
            email,
            phone
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error
      setValuation(data)
    } catch (error) {
      console.error('Error loading valuation:', error)
      alert('Błąd podczas ładowania wyceny')
      router.push('/admin/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = () => {
    if (!valuation) return

    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.text('DiabloStudio - Wycena Posadzek Żywicznych', 20, 30)

    doc.setFontSize(16)
    doc.text('Szczegółowa Wycena', 20, 50)

    // Object data
    doc.setFontSize(12)
    doc.text('Dane obiektu:', 20, 70)
    doc.text(`Nazwa: ${valuation.object_name}`, 30, 85)
    doc.text(`Adres: ${valuation.object_address}`, 30, 95)
    doc.text(`Właściciel: ${valuation.owner_name}`, 30, 105)
    doc.text(`Data pomiarów: ${new Date(valuation.measurement_date).toLocaleDateString('pl-PL')}`, 30, 115)

    // Technical parameters
    doc.text('Parametry techniczne:', 20, 135)
    if (valuation.humidity) doc.text(`Wilgotność: ${valuation.humidity}%`, 30, 150)
    if (valuation.temperature) doc.text(`Temperatura: ${valuation.temperature}°C`, 30, 160)
    if (valuation.dew_point) doc.text(`Punkt rosy: ${valuation.dew_point}°C`, 30, 170)

    // Scope of work
    doc.text('Zakres prac:', 20, 190)
    let yPos = 205
    const scopeItems = []
    if (valuation.primer_needed) scopeItems.push('Gruntowanie')
    if (valuation.scratch_needed) scopeItems.push('Szpachlowanie')
    if (valuation.topcoat_needed) scopeItems.push('Powloka wierzchnia')
    if (valuation.plinths_needed) scopeItems.push('Cokoły')
    if (valuation.ground_levelling_needed) scopeItems.push('Wyrównanie podłoża')

    scopeItems.forEach(item => {
      doc.text(`• ${item}`, 30, yPos)
      yPos += 10
    })

    // Materials
    yPos += 10
    doc.text('Materiały:', 20, yPos)
    yPos += 15
    const resinTypeText = valuation.resin_type === 'PU_STANDARD' ? 'PU Standard' :
                         valuation.resin_type === 'PU_PREMIUM' ? 'PU Premium' : 'Epoksydowa'
    doc.text(`Typ żywicy: ${resinTypeText}`, 30, yPos)
    yPos += 10
    doc.text(`Efekt: ${valuation.resin_effect === 'SMOOTH' ? 'Gładka' : 'Marmurowa'}`, 30, yPos)
    yPos += 10
    doc.text(`Liczba kolorów: ${valuation.resin_colors}`, 30, yPos)

    // Costs - new page if needed
    if (yPos > 250) {
      doc.addPage()
      yPos = 30
    } else {
      yPos += 20
    }

    doc.text('Kosztorys:', 20, yPos)
    yPos += 15
    doc.text(`Koszt materiałów: ${valuation.materials_cost.toFixed(2)} PLN`, 30, yPos)
    yPos += 10
    doc.text(`Koszt robocizny: ${valuation.labor_cost.toFixed(2)} PLN`, 30, yPos)
    yPos += 10
    doc.text(`Koszt narzędzi: ${valuation.tools_cost.toFixed(2)} PLN`, 30, yPos)
    yPos += 10
    doc.text(`Razem przed rabatem: ${valuation.total_cost.toFixed(2)} PLN`, 30, yPos)
    yPos += 10
    if (valuation.discount_percentage > 0) {
      doc.text(`Rabat: ${valuation.discount_percentage}%`, 30, yPos)
      yPos += 10
    }
    doc.setFontSize(14)
    doc.text(`KWOTA KOŃCOWA: ${valuation.final_cost.toFixed(2)} PLN`, 30, yPos + 10)

    // Footer
    doc.setFontSize(10)
    const pageHeight = doc.internal.pageSize.height
    doc.text('DiabloStudio - Profesjonalne posadzki żywiczne', 20, pageHeight - 30)
    doc.text(`Wygenerowano: ${new Date().toLocaleDateString('pl-PL')}`, 20, pageHeight - 20)

    // Save the PDF
    doc.save(`wycena-${valuation.object_name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generowanie PDF...</p>
        </div>
      </div>
    )
  }

  if (!valuation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nie znaleziono wyceny</p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="mt-4 btn-primary"
          >
            Powrót do dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">DiabloStudio</h1>
              <span className="ml-2 text-sm text-gray-500">Generowanie PDF</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push(`/admin/valuation/${valuation.id}`)}
                className="btn-secondary"
              >
                Powrót do wyceny
              </button>
              <button
                onClick={generatePDF}
                className="btn-primary"
              >
                Pobierz PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Wycena dla: {valuation.object_name}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              PDF zostanie wygenerowane i pobrane automatycznie
            </p>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Podgląd danych</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Dane obiektu</h4>
                  <p className="text-sm text-gray-600">Nazwa: {valuation.object_name}</p>
                  <p className="text-sm text-gray-600">Adres: {valuation.object_address}</p>
                  <p className="text-sm text-gray-600">Właściciel: {valuation.owner_name}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Dane klienta</h4>
                  <p className="text-sm text-gray-600">Imię: {valuation.customers.name}</p>
                  <p className="text-sm text-gray-600">Email: {valuation.customers.email}</p>
                  {valuation.customers.phone && (
                    <p className="text-sm text-gray-600">Telefon: {valuation.customers.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-700 mb-2">Podsumowanie kosztów</h4>
                  <div className="bg-white p-4 rounded border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Materiały: {valuation.materials_cost.toFixed(2)} PLN</p>
                        <p className="text-sm text-gray-600">Robocizna: {valuation.labor_cost.toFixed(2)} PLN</p>
                        <p className="text-sm text-gray-600">Narzędzia: {valuation.tools_cost.toFixed(2)} PLN</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Razem: {valuation.total_cost.toFixed(2)} PLN</p>
                        {valuation.discount_percentage > 0 && (
                          <p className="text-sm text-gray-600">Rabat: {valuation.discount_percentage}%</p>
                        )}
                        <p className="text-lg font-bold text-primary-600">
                          Kwota końcowa: {valuation.final_cost.toFixed(2)} PLN
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={generatePDF}
              className="btn-primary text-lg px-8 py-3"
            >
              Wygeneruj i pobierz PDF
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
