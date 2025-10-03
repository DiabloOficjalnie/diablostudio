'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'

// Color interfaces
interface RALColor {
  id: string
  code: string
  name: string
  hex: string
  rgb_r: number
  rgb_g: number
  rgb_b: number
  category: string
  created_at: string
}

interface SandColor {
  id: string
  code: string
  name: string
  hex: string
  rgb_r: number
  rgb_g: number
  rgb_b: number
  category: string
  image_path: string
  created_at: string
}

interface ChipsColor {
  id: string
  code: string
  name: string
  hex: string
  rgb_r: number
  rgb_g: number
  rgb_b: number
  category: string
  image_path: string
  created_at: string
}

interface ColorComposition {
  id: string
  name: string
  description: string
  application: string
  resin_type?: string
  system_type?: string
  floor_type?: string
  resin_color: RALColor
  sand_color: SandColor
  chips_color: ChipsColor
  decorative_type: 'sand' | 'chips' | 'none'
  preview_image?: string
  created_at: string
  updated_at: string
  is_active: boolean
  usage_count: number
  tags: string[]
}

interface DetailedQuotation {
  id?: string
  quotation_number: string
  client_name: string
  client_company?: string
  client_email: string
  client_phone?: string
  client_address?: string
  project_name: string
  project_location: string
  project_type: 'private' | 'business'
  inspection_date: string
  completion_deadline: string
  contractor_name: string
  contractor_contact: string

  // Mix type selection
  mix_type?: 'ready_mix' | 'custom_mix'
  selected_ready_mix?: string

  // Color selections
  resin_colors: { color: string, quantity: number }[]
  sand_colors: { color: string, quantity: number }[]
  chips_colors: { color: string, quantity: number }[]

  // Color compositions
  color_compositions: ColorComposition[]

  // Discount
  discount_applicable: boolean
  discount_percentage: number

  // Substrate assessment
  moisture_content: number
  adhesion_test: string
  level_tolerance: string
  substrate_type: string
  defect_repairs: string
  leveling_required: boolean
  grinding_required: boolean
  ventilation_required: boolean
  protective_equipment: string

  // Floor type and finish
  resin_type: 'epoxy_standard' | 'epoxy_premium' | 'pu_standard' | 'pu_premium'
  decorative_effects: string[]
  exact_color: string
  decorative_layer: string
  finish_type: 'matte' | 'gloss' | 'satin'
  technical_params: {
    hardness: string
    chemical_resistance: string
    anti_slip: string
  }

  // Material costs
  material_costs: {
    resin_cost: number
    hardener_cost: number
    flakes_cost: number
    plastbeton_cost: number
    primer_cost: number
    foil_cost: number
    tools_cost: number
    material_excess: number
  }

  // Labor costs
  labor_costs: {
    substrate_prep: { min: number, max: number, sqm: number }
    defect_repair: { min: number, max: number, sqm: number }
    priming: { min: number, max: number, sqm: number }
    resin_application: { min: number, max: number, sqm: number }
    decoration: { min: number, max: number, sqm: number }
    stairs_walls: { min: number, max: number, sqm: number }
  }

  // Additional costs
  additional_costs: {
    transport: number
    waste_disposal: number
    heating_drying: number
    line_painting: number
    other: number
    other_description?: string
  }

  // Work schedule
  work_schedule: {
    stage: string
    duration_days: number
    duration_hours: number
    notes: string
    critical_deadlines: string
    drying_time: number
  }[]

  // Summary
  subtotal_materials: number
  subtotal_labor: number
  subtotal_additional: number
  discount_amount: number
  vat_amount: number
  total_min: number
  total_max: number

  // Risks and notes
  risks_warnings: string
  client_notes: string
  contractor_notes: string
  warranty_conditions: string
  complaint_procedure: string

  // Metadata
  created_at?: string
  updated_at?: string
  created_by?: string
  status: 'draft' | 'sent' | 'approved' | 'rejected'
}

export default function DetailedQuotationsPage() {
  const [quotations, setQuotations] = useState<DetailedQuotation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState<DetailedQuotation | null>(null)
  const [activeTab, setActiveTab] = useState('basic')

  const [pricing, setPricing] = useState<any>(null)
  const [projectArea, setProjectArea] = useState<number>(0)
  const [transportDistance, setTransportDistance] = useState<number>(0)
  const [numberOfWorkers, setNumberOfWorkers] = useState<number>(1)
  const [projectPhotos, setProjectPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [quotationStats, setQuotationStats] = useState({
    total: 0,
    thisMonth: 0,
    averageValue: 0,
    totalValue: 0,
    byStatus: {
      draft: 0,
      sent: 0,
      approved: 0,
      rejected: 0
    }
  })

  // Stan dla wyboru kompozycji
  const [colorCompositions, setColorCompositions] = useState<ColorComposition[]>([])

  // Dostępne kolory
  const [ralColors, setRalColors] = useState<RALColor[]>([])
  const [sandColors, setSandColors] = useState<SandColor[]>([])
  const [chipsColors, setChipsColors] = useState<ChipsColor[]>([])

  // Stan dla kreatora kompozycji
  const [showCompositionCreator, setShowCompositionCreator] = useState(false)
  const [editingComposition, setEditingComposition] = useState<ColorComposition | null>(null)
  const [selectedResinColor, setSelectedResinColor] = useState<RALColor | null>(null)
  const [selectedSandColor, setSelectedSandColor] = useState<SandColor | null>(null)
  const [selectedChipsColor, setSelectedChipsColor] = useState<ChipsColor | null>(null)

  const [formData, setFormData] = useState<DetailedQuotation>({
    quotation_number: '',
    client_name: '',
    client_company: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    project_name: '',
    project_location: '',
    project_type: 'private',
    inspection_date: '',
    completion_deadline: '',
    contractor_name: '',
    contractor_contact: '',
    mix_type: undefined,
    selected_ready_mix: undefined,
    resin_colors: [],
    sand_colors: [],
    chips_colors: [],
    // Nowa funkcjonalność - kreator kompozycji
    color_compositions: [],
    discount_applicable: false,
    discount_percentage: 0,
    moisture_content: 0,
    adhesion_test: '',
    level_tolerance: '',
    substrate_type: '',
    defect_repairs: '',
    leveling_required: false,
    grinding_required: false,
    ventilation_required: false,
    protective_equipment: '',
    resin_type: 'epoxy_standard',
    decorative_effects: [],
    exact_color: '',
    decorative_layer: '',
    finish_type: 'matte',
    technical_params: {
      hardness: '',
      chemical_resistance: '',
      anti_slip: ''
    },
    material_costs: {
      resin_cost: 0,
      hardener_cost: 0,
      flakes_cost: 0,
      plastbeton_cost: 0,
      primer_cost: 0,
      foil_cost: 0,
      tools_cost: 0,
      material_excess: 0
    },
    labor_costs: {
      substrate_prep: { min: 0, max: 0, sqm: 0 },
      defect_repair: { min: 0, max: 0, sqm: 0 },
      priming: { min: 0, max: 0, sqm: 0 },
      resin_application: { min: 0, max: 0, sqm: 0 },
      decoration: { min: 0, max: 0, sqm: 0 },
      stairs_walls: { min: 0, max: 0, sqm: 0 }
    },
    additional_costs: {
      transport: 0,
      waste_disposal: 0,
      heating_drying: 0,
      line_painting: 0,
      other: 0,
      other_description: ''
    },
    work_schedule: [],
    subtotal_materials: 0,
    subtotal_labor: 0,
    subtotal_additional: 0,
    discount_amount: 0,
    vat_amount: 0,
    total_min: 0,
    total_max: 0,
    risks_warnings: '',
    client_notes: '',
    contractor_notes: '',
    warranty_conditions: '',
    complaint_procedure: '',
    status: 'draft'
  })

  useEffect(() => {
    loadQuotations()
    loadColors()
    loadColorCompositions()
  }, [])

  const loadColors = async () => {
    try {
      // Load colors from demo data (in production this would be from database)
      const ralResponse = await fetch('/demo-data/colors-ral.json')
      const sandResponse = await fetch('/demo-data/colors-sands.json')
      const chipsResponse = await fetch('/demo-data/colors-chips.json')

      if (ralResponse.ok) {
        const ralData = await ralResponse.json()
        setRalColors(ralData)
      }

      if (sandResponse.ok) {
        const sandData = await sandResponse.json()
        setSandColors(sandData)
      }

      if (chipsResponse.ok) {
        const chipsData = await chipsResponse.json()
        setChipsColors(chipsData)
      }
    } catch (error) {
      console.error('Error loading colors:', error)
    }
  }

  const loadColorCompositions = async () => {
    try {
      // Load compositions from the compositions management system
      const response = await fetch('/api/color-compositions')
      if (response.ok) {
        const compositions = await response.json()
        setColorCompositions(compositions)
        console.log('Loaded color compositions from database:', compositions.length)
      } else {
        console.error('Failed to load color compositions from database')
        // Fallback to localStorage if API fails
        const savedCompositions = localStorage.getItem('colorCompositions')
        if (savedCompositions) {
          setColorCompositions(JSON.parse(savedCompositions))
          console.log('Loaded color compositions from localStorage:', JSON.parse(savedCompositions).length)
        } else {
          setColorCompositions([])
        }
      }
    } catch (error) {
      console.error('Error loading color compositions:', error)
      // Fallback to localStorage
      try {
        const savedCompositions = localStorage.getItem('colorCompositions')
        if (savedCompositions) {
          setColorCompositions(JSON.parse(savedCompositions))
        } else {
          setColorCompositions([])
        }
      } catch (fallbackError) {
        console.error('Error loading from localStorage:', fallbackError)
        setColorCompositions([])
      }
    }
  }

  const saveColorComposition = async (composition: ColorComposition) => {
    try {
      // In production, this would save to database
      console.log('Saving color composition:', composition)

      // For now, just update local state
      if (editingComposition) {
        setColorCompositions(prev => prev.map(c => c.id === composition.id ? composition : c))
      } else {
        setColorCompositions(prev => [...prev, composition])
      }

      return true
    } catch (error) {
      console.error('Error saving color composition:', error)
      return false
    }
  }

  const deleteColorComposition = async (compositionId: string) => {
    try {
      // In production, this would delete from database
      console.log('Deleting color composition:', compositionId)

      // For now, just update local state
      setColorCompositions(prev => prev.filter(c => c.id !== compositionId))
      return true
    } catch (error) {
      console.error('Error deleting color composition:', error)
      return false
    }
  }

  const loadQuotations = async () => {
    try {
      setLoading(true)
      // For now, use mock data - in production this would be an API call
      setQuotations([])
    } catch (error) {
      console.error('Error loading quotations:', error)
    }
    setLoading(false)
  }

  const calculateTotals = () => {
    const materialsTotal = Object.values(formData.material_costs).reduce((sum, cost) => {
      const numCost = Number(cost) || 0
      return sum + numCost
    }, 0)

    const laborTotalMin = Object.values(formData.labor_costs).reduce((sum, cost) => {
      const numMin = Number(cost.min) || 0
      return sum + numMin
    }, 0)

    const laborTotalMax = Object.values(formData.labor_costs).reduce((sum, cost) => {
      const numMax = Number(cost.max) || 0
      return sum + numMax
    }, 0)

    const additionalTotal = Object.values(formData.additional_costs).reduce((sum, cost) => {
      const numCost = Number(cost) || 0
      return sum + numCost
    }, 0)

    const subtotalMin = materialsTotal + laborTotalMin + additionalTotal
    const subtotalMax = materialsTotal + laborTotalMax + additionalTotal

    const discountAmount = formData.discount_applicable
      ? (subtotalMin + subtotalMax) / 2 * (formData.discount_percentage / 100)
      : 0

    const afterDiscountMin = subtotalMin - discountAmount
    const afterDiscountMax = subtotalMax - discountAmount

    const vatAmount = (afterDiscountMin + afterDiscountMax) / 2 * 0.23

    const totalMin = afterDiscountMin + vatAmount
    const totalMax = afterDiscountMax + vatAmount

    setFormData(prev => ({
      ...prev,
      subtotal_materials: materialsTotal,
      subtotal_labor: (laborTotalMin + laborTotalMax) / 2,
      subtotal_additional: additionalTotal,
      discount_amount: discountAmount,
      vat_amount: vatAmount,
      total_min: totalMin,
      total_max: totalMax
    }))
  }

  useEffect(() => {
    calculateTotals()
  }, [formData.material_costs, formData.labor_costs, formData.additional_costs, formData.discount_applicable, formData.discount_percentage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.client_name || !formData.project_name || !formData.client_email) {
      alert('Wypełnij wymagane pola!')
      return
    }

    try {
      const quotationData = {
        ...formData,
        id: editingQuotation?.id || Date.now().toString(),
        quotation_number: formData.quotation_number || `W-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // In production, this would save to database
      console.log('Saving quotation:', quotationData)

      // Reset form and reload
      setFormData({
        quotation_number: '',
        client_name: '',
        client_company: '',
        client_email: '',
        client_phone: '',
        client_address: '',
        project_name: '',
        project_location: '',
        project_type: 'private',
        inspection_date: '',
        completion_deadline: '',
        contractor_name: '',
        contractor_contact: '',
        mix_type: undefined,
        selected_ready_mix: undefined,
        resin_colors: [],
        sand_colors: [],
        chips_colors: [],
        color_compositions: [],
        discount_applicable: false,
        discount_percentage: 0,
        moisture_content: 0,
        adhesion_test: '',
        level_tolerance: '',
        substrate_type: '',
        defect_repairs: '',
        leveling_required: false,
        grinding_required: false,
        ventilation_required: false,
        protective_equipment: '',
        resin_type: 'epoxy_standard',
        decorative_effects: [],
        exact_color: '',
        decorative_layer: '',
        finish_type: 'matte',
        technical_params: {
          hardness: '',
          chemical_resistance: '',
          anti_slip: ''
        },
        material_costs: {
          resin_cost: 0,
          hardener_cost: 0,
          flakes_cost: 0,
          plastbeton_cost: 0,
          primer_cost: 0,
          foil_cost: 0,
          tools_cost: 0,
          material_excess: 0
        },
        labor_costs: {
          substrate_prep: { min: 0, max: 0, sqm: 0 },
          defect_repair: { min: 0, max: 0, sqm: 0 },
          priming: { min: 0, max: 0, sqm: 0 },
          resin_application: { min: 0, max: 0, sqm: 0 },
          decoration: { min: 0, max: 0, sqm: 0 },
          stairs_walls: { min: 0, max: 0, sqm: 0 }
        },
        additional_costs: {
          transport: 0,
          waste_disposal: 0,
          heating_drying: 0,
          line_painting: 0,
          other: 0,
          other_description: ''
        },
        work_schedule: [],
        subtotal_materials: 0,
        subtotal_labor: 0,
        subtotal_additional: 0,
        discount_amount: 0,
        vat_amount: 0,
        total_min: 0,
        total_max: 0,
        risks_warnings: '',
        client_notes: '',
        contractor_notes: '',
        warranty_conditions: '',
        complaint_procedure: '',
        status: 'draft'
      })

      setShowForm(false)
      setEditingQuotation(null)
      loadQuotations()

      alert('Wycena została zapisana!')
    } catch (error) {
      console.error('Error saving quotation:', error)
      alert('Błąd podczas zapisywania wyceny!')
    }
  }

  const decorativeEffectsOptions = [
    'Gładkie',
    'Z płatkami',
    'Efekt marmuru',
    'Strukturalne',
    'Transparentne',
    'Antystatyczne'
  ]

  const resinTypes = [
    { id: 'epoxy_standard', name: 'Żywica epoksydowa standard' },
    { id: 'epoxy_premium', name: 'Żywica epoksydowa premium' },
    { id: 'pu_standard', name: 'Żywica poliuretanowa standard' },
    { id: 'pu_premium', name: 'Żywica poliuretanowa premium' }
  ]

  const finishTypes = [
    { id: 'matte', name: 'Mat' },
    { id: 'gloss', name: 'Połysk' },
    { id: 'satin', name: 'Satyna' }
  ]

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie wycen szczegółowych...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wyceny szczegółowe</h1>
            <p className="text-gray-600 mt-1">Kompleksowe wyceny dla wykonawców</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <span className="mr-2">➕</span>
              Nowa wycena
            </button>
            <button
              onClick={() => setShowCompositionCreator(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <span className="mr-2">🎨</span>
              Nowy kreator kolorów
            </button>
            <button
              onClick={loadQuotations}
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <span className="mr-2">🔄</span>
              Odśwież
            </button>
          </div>
        </div>

        {/* Composition Creator Modal */}
        {showCompositionCreator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingComposition ? 'Edytuj kompozycję' : 'Nowa kompozycja kolorów'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCompositionCreator(false)
                      setEditingComposition(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Nazwa kompozycji *
                    </label>
                    <input
                      type="text"
                      value={editingComposition?.name || ''}
                      onChange={(e) => setEditingComposition(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                      placeholder="np. Beton industrialny"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Status
                    </label>
                            <select
                              value={formData.project_type}
                              onChange={(e) => setFormData({...formData, project_type: e.target.value as 'private' | 'business'})}
                              className="w-full px-5 py-4 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-600 bg-white text-slate-900 font-medium text-lg shadow-sm hover:border-slate-400 transition-all duration-200"
                            >
                              <option value="private">🏠 Prywatny</option>
                              <option value="business">🏢 Firma</option>
                            </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Opis kompozycji
                  </label>
                  <textarea
                    value={editingComposition?.description || ''}
                    onChange={(e) => setEditingComposition(prev => prev ? {...prev, description: e.target.value} : null)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                    rows={3}
                    placeholder="Opisz charakterystykę tej kompozycji kolorów..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Zastosowanie
                  </label>
                  <input
                    type="text"
                    value={editingComposition?.application || ''}
                    onChange={(e) => setEditingComposition(prev => prev ? {...prev, application: e.target.value} : null)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                    placeholder="np. Garaże, warsztaty, przestrzenie komercyjne"
                  />
                </div>

                {/* Color Selection */}
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-gray-900">Wybierz kolory</h4>

                  {/* Resin Color Selection */}
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h5 className="text-md font-bold text-blue-900 mb-4">Kolor żywicy</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {ralColors.slice(0, 12).map((color) => (
                        <div
                          key={color.code}
                          onClick={() => setSelectedResinColor(color)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedResinColor?.code === color.code
                              ? 'border-blue-500 bg-white shadow-lg'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div
                            className="w-full h-8 rounded mb-2"
                            style={{ backgroundColor: color.hex }}
                          ></div>
                          <div className="text-xs font-medium text-gray-900 bg-white px-2 py-1 rounded shadow-sm">{color.code}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sand Color Selection */}
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h5 className="text-md font-bold text-green-900 mb-4">Kolor piasku</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {sandColors.slice(0, 12).map((color) => (
                        <div
                          key={color.code}
                          onClick={() => setSelectedSandColor(color)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedSandColor?.code === color.code
                              ? 'border-green-500 bg-white shadow-lg'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div
                            className="w-full h-8 rounded mb-2"
                            style={{ backgroundColor: color.hex }}
                          ></div>
                          <div className="text-xs font-medium text-gray-900">{color.code}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chips Color Selection */}
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h5 className="text-md font-bold text-purple-900 mb-4">Kolor chips</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {chipsColors.slice(0, 12).map((color) => (
                        <div
                          key={color.code}
                          onClick={() => setSelectedChipsColor(color)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedChipsColor?.code === color.code
                              ? 'border-purple-500 bg-white shadow-lg'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div
                            className="w-full h-8 rounded mb-2"
                            style={{ backgroundColor: color.hex }}
                          ></div>
                          <div className="text-xs font-medium text-gray-900">{color.code}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected Colors Summary */}
                {selectedResinColor && selectedSandColor && selectedChipsColor && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                    <h5 className="text-lg font-bold text-gray-900 mb-4">Wybrane kolory:</h5>
                    <div className="flex items-center justify-center space-x-8">
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-full mx-auto mb-2 shadow-lg"
                          style={{ backgroundColor: selectedResinColor?.hex || '#ccc' }}
                        ></div>
                        <div className="font-bold text-sm text-gray-900">Żywica</div>
                        <div className="text-xs text-gray-600">{selectedResinColor?.name || 'Nie wybrano'}</div>
                      </div>
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-full mx-auto mb-2 shadow-lg"
                          style={{ backgroundColor: selectedSandColor?.hex || '#ccc' }}
                        ></div>
                        <div className="font-bold text-sm text-gray-900">Piasek</div>
                        <div className="text-xs text-gray-600">{selectedSandColor?.name || 'Nie wybrano'}</div>
                      </div>
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-full mx-auto mb-2 shadow-lg"
                          style={{ backgroundColor: selectedChipsColor?.hex || '#ccc' }}
                        ></div>
                        <div className="font-bold text-sm text-gray-900">Chips</div>
                        <div className="text-xs text-gray-600">{selectedChipsColor?.name || 'Nie wybrano'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      if (selectedResinColor && selectedSandColor && selectedChipsColor && editingComposition?.name) {
                        const newComposition: ColorComposition = {
                          id: editingComposition.id || Date.now().toString(),
                          name: editingComposition.name,
                          description: editingComposition.description || '',
                          application: editingComposition.application || '',
                          resin_color: selectedResinColor,
                          sand_color: selectedSandColor,
                          chips_color: selectedChipsColor,
                          created_at: editingComposition?.created_at || new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          is_active: editingComposition?.is_active || true,
                          usage_count: editingComposition?.usage_count || 0,
                          tags: editingComposition?.tags || []
                        }

                        if (editingComposition) {
                          setColorCompositions(prev => prev.map(c => c.id === editingComposition.id ? newComposition : c))
                        } else {
                          setColorCompositions(prev => [...prev, newComposition])
                        }

                        // Reset form
                        setEditingComposition(null)
                        setSelectedResinColor(null)
                        setSelectedSandColor(null)
                        setSelectedChipsColor(null)
                        setShowCompositionCreator(false)

                        alert(editingComposition ? 'Kompozycja została zaktualizowana!' : 'Kompozycja została dodana!')
                      } else {
                        alert('Wypełnij wszystkie wymagane pola!')
                      }
                    }}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    {editingComposition ? 'Aktualizuj kompozycję' : 'Zapisz kompozycję'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCompositionCreator(false)
                      setEditingComposition(null)
                      setSelectedResinColor(null)
                      setSelectedSandColor(null)
                      setSelectedChipsColor(null)
                    }}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingQuotation ? 'Edytuj wycenę' : 'Nowa wycena szczegółowa'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditingQuotation(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Tabs */}
                  <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
                    {[
                      { id: 'basic', name: 'Dane podstawowe', icon: '📋' },
                      { id: 'substrate', name: 'Ocena podłoża', icon: '🏗️' },
                      { id: 'colors', name: 'Kolory', icon: '🎨' },
                      { id: 'compositions', name: 'Wybór kompozycji', icon: '🎯' },
                      { id: 'flooring', name: 'Posadzka', icon: '🏢' },
                      { id: 'materials', name: 'Materiały', icon: '📦' },
                      { id: 'labor', name: 'Robocizna', icon: '👷' },
                      { id: 'additional', name: 'Dodatkowe', icon: '➕' },
                      { id: 'schedule', name: 'Harmonogram', icon: '📅' },
                      { id: 'summary', name: 'Podsumowanie', icon: '💰' },
                      { id: 'notes', name: 'Uwagi', icon: '📝' }
                    ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {/* Basic Data Tab */}
                  {activeTab === 'basic' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Dane klienta</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Imię i nazwisko *
                            </label>
                            <input
                              type="text"
                              value={formData.client_name}
                              onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                              className="w-full px-6 py-5 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-600 bg-white text-slate-900 font-semibold text-xl shadow-lg hover:border-slate-400 transition-all duration-200 placeholder:text-slate-500"
                              placeholder="Wprowadź imię i nazwisko klienta"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Firma
                            </label>
                            <input
                              type="text"
                              value={formData.client_company}
                              onChange={(e) => setFormData({...formData, client_company: e.target.value})}
                              className="w-full px-6 py-5 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-600 bg-white text-slate-900 font-semibold text-xl shadow-lg hover:border-slate-400 transition-all duration-200 placeholder:text-slate-500"
                              placeholder="Nazwa firmy (opcjonalne)"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email *
                            </label>
                            <input
                              type="email"
                              value={formData.client_email}
                              onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                              className="w-full px-6 py-5 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-600 bg-white text-slate-900 font-semibold text-xl shadow-lg hover:border-slate-400 transition-all duration-200 placeholder:text-slate-500"
                              placeholder="adres@email.com"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Telefon
                            </label>
                            <input
                              type="tel"
                              value={formData.client_phone}
                              onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Dane inwestycji</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nazwa projektu *
                            </label>
                            <input
                              type="text"
                              value={formData.project_name}
                              onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Adres inwestycji
                            </label>
                            <input
                              type="text"
                              value={formData.project_location}
                              onChange={(e) => setFormData({...formData, project_location: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Rodzaj obiektu
                            </label>
                            <select
                              value={formData.project_type}
                              onChange={(e) => setFormData({...formData, project_type: e.target.value as 'private' | 'business'})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="private">Prywatny</option>
                              <option value="business">Firma</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Data oględzin
                            </label>
                            <input
                              type="date"
                              value={formData.inspection_date}
                              onChange={(e) => setFormData({...formData, inspection_date: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Termin wykonania
                            </label>
                            <input
                              type="date"
                              value={formData.completion_deadline}
                              onChange={(e) => setFormData({...formData, completion_deadline: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Dane wykonawcy</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Osoba wyceny
                            </label>
                            <input
                              type="text"
                              value={formData.contractor_name}
                              onChange={(e) => setFormData({...formData, contractor_name: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kontakt do wykonawcy
                            </label>
                            <input
                              type="text"
                              value={formData.contractor_contact}
                              onChange={(e) => setFormData({...formData, contractor_contact: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Numer oferty
                            </label>
                            <input
                              type="text"
                              value={formData.quotation_number}
                              onChange={(e) => setFormData({...formData, quotation_number: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="W-2024-001"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Rabat</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="discount_applicable"
                              checked={formData.discount_applicable}
                              onChange={(e) => setFormData({...formData, discount_applicable: e.target.checked})}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="discount_applicable" className="ml-2 block text-sm text-gray-900">
                              Udziel rabat
                            </label>
                          </div>
                          {formData.discount_applicable && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Wysokość rabatu (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="50"
                                step="0.1"
                                value={formData.discount_percentage}
                                onChange={(e) => setFormData({...formData, discount_percentage: parseFloat(e.target.value) || 0})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Substrate Assessment Tab */}
                  {activeTab === 'substrate' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Parametry podłoża</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Wilgotność (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={formData.moisture_content}
                              onChange={(e) => setFormData({...formData, moisture_content: parseFloat(e.target.value) || 0})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Test przyczepności
                            </label>
                            <select
                              value={formData.adhesion_test}
                              onChange={(e) => setFormData({...formData, adhesion_test: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Wybierz...</option>
                              <option value="excellent">Doskonała</option>
                              <option value="good">Dobra</option>
                              <option value="satisfactory">Zadowalająca</option>
                              <option value="poor">Słaba</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tolerancja poziomu (mm/m)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={formData.level_tolerance}
                              onChange={(e) => setFormData({...formData, level_tolerance: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="2.0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Rodzaj podłoża
                            </label>
                            <select
                              value={formData.substrate_type}
                              onChange={(e) => setFormData({...formData, substrate_type: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Wybierz...</option>
                              <option value="concrete">Beton</option>
                              <option value="tiles">Płytki</option>
                              <option value="old_resin">Stara żywica</option>
                              <option value="wood">Drewno</option>
                              <option value="metal">Metal</option>
                              <option value="other">Inne</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Naprawy i przygotowanie</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Naprawy ubytków
                            </label>
                            <select
                              value={formData.defect_repairs}
                              onChange={(e) => setFormData({...formData, defect_repairs: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Wybierz...</option>
                              <option value="plastbeton">Plastobeton</option>
                              <option value="mastic">Mastic</option>
                              <option value="none">Brak napraw</option>
                            </select>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="leveling_required"
                                checked={formData.leveling_required}
                                onChange={(e) => setFormData({...formData, leveling_required: e.target.checked})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="leveling_required" className="ml-2 block text-sm text-gray-900">
                                Wyrównanie podłoża
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="grinding_required"
                                checked={formData.grinding_required}
                                onChange={(e) => setFormData({...formData, grinding_required: e.target.checked})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="grinding_required" className="ml-2 block text-sm text-gray-900">
                                Szlifowanie
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="ventilation_required"
                                checked={formData.ventilation_required}
                                onChange={(e) => setFormData({...formData, ventilation_required: e.target.checked})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="ventilation_required" className="ml-2 block text-sm text-gray-900">
                                Zabezpieczenie środowiska pracy
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Odzież ochronna
                            </label>
                            <input
                              type="text"
                              value={formData.protective_equipment}
                              onChange={(e) => setFormData({...formData, protective_equipment: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Maski, rękawice, kombinezony..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Color Compositions Selection Tab */}
                  {activeTab === 'compositions' && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Wybór kompozycji kolorów</h3>
                        <button
                          onClick={() => window.open('/admin/color-compositions', '_blank')}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold transition-all transform hover:scale-105 shadow-lg"
                        >
                          🎨 Zarządzaj kompozycjami
                        </button>
                      </div>

                      {/* Available Compositions */}
                      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border-2 border-gray-200 shadow-sm">
                        <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Dostępne kompozycje kolorów</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {colorCompositions.length > 0 ? (
                            colorCompositions.map((composition) => (
                              <div key={composition.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden">
                                {/* Preview Section */}
                                <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200">
                                  <div className="flex items-center justify-center space-x-4">
                                    <div className="text-center">
                                      <div
                                        className="w-12 h-12 rounded-full mx-auto mb-2 shadow-sm"
                                        style={{ backgroundColor: composition.resin_color?.hex || '#ccc' }}
                                      ></div>
                                      <div className="text-xs font-medium text-gray-700">{composition.resin_color?.name}</div>
                                    </div>
                                    <div className="text-center">
                                      <div
                                        className="w-12 h-12 rounded-full mx-auto mb-2 shadow-sm"
                                        style={{ backgroundColor: composition.sand_color?.hex || '#ccc' }}
                                      ></div>
                                      <div className="text-xs font-medium text-gray-700">{composition.sand_color?.name}</div>
                                    </div>
                                    <div className="text-center">
                                      <div
                                        className="w-12 h-12 rounded-full mx-auto mb-2 shadow-sm"
                                        style={{ backgroundColor: composition.chips_color?.hex || '#ccc' }}
                                      ></div>
                                      <div className="text-xs font-medium text-gray-700">{composition.chips_color?.name}</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6">
                                  <div className="flex items-start justify-between mb-3">
                                    <h5 className="text-lg font-bold text-gray-900">{composition.name}</h5>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      composition.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {composition.is_active ? 'Aktywna' : 'Nieaktywna'}
                                    </span>
                                  </div>

                                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{composition.description}</p>

                                  <div className="mb-4">
                                    <div className="text-xs font-medium text-gray-500 mb-1">Zastosowanie:</div>
                                    <div className="text-sm text-gray-700">{composition.application}</div>
                                  </div>

                                  <div className="mb-4">
                                    <div className="text-xs font-medium text-gray-500 mb-2">Tagi:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {composition.tags.map((tag, index) => (
                                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span>Użyć: {composition.usage_count}</span>
                                    <span>{new Date(composition.created_at).toLocaleDateString('pl-PL')}</span>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        // Use this composition in the quotation
                                        setFormData({
                                          ...formData,
                                          color_compositions: [composition],
                                          resin_colors: [{ color: composition.resin_color.name, quantity: 1 }],
                                          sand_colors: [{ color: composition.sand_color.name, quantity: 1 }],
                                          chips_colors: [{ color: composition.chips_color.name, quantity: 1 }]
                                        })
                                        alert('Kompozycja została zastosowana w wycenie!')
                                      }}
                                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                      Użyj tej kompozycji
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingComposition(composition)
                                        setSelectedResinColor(composition.resin_color)
                                        setSelectedSandColor(composition.sand_color)
                                        setSelectedChipsColor(composition.chips_color)
                                        setShowCompositionCreator(true)
                                      }}
                                      className="px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                      title="Edytuj kompozycję"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm('Czy na pewno chcesz usunąć tę kompozycję?')) {
                                          setColorCompositions(prev => prev.filter(c => c.id !== composition.id))
                                          alert('Kompozycja została usunięta!')
                                        }
                                      }}
                                      className="px-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                      title="Usuń kompozycję"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center py-20">
                              <div className="text-6xl mb-6">🎨</div>
                              <h5 className="text-2xl font-bold text-gray-900 mb-4">Brak dostępnych kompozycji</h5>
                              <p className="text-gray-600 max-w-md mx-auto mb-8">
                                Utwórz kompozycje kolorów w module zarządzania kompozycjami, aby były dostępne w wycenach szczegółowych.
                              </p>
                              <button
                                onClick={() => window.open('/admin/color-compositions', '_blank')}
                                className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                              >
                                <span className="mr-2">🎨</span>
                                Przejdź do zarządzania kompozycjami
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Current Quotation Colors Summary */}
                      {formData.color_compositions.length > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 shadow-sm">
                          <h4 className="text-xl font-bold text-green-900 mb-6 text-center">Aktualnie wybrana kompozycja w wycenie</h4>
                          <div className="max-w-md mx-auto">
                            <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
                              {/* Preview Section */}
                              <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200">
                                <div className="flex items-center justify-center space-x-4">
                                  <div className="text-center">
                                    <div
                                      className="w-12 h-12 rounded-full mx-auto mb-2 shadow-sm"
                                      style={{ backgroundColor: formData.color_compositions[0].resin_color?.hex || '#ccc' }}
                                    ></div>
                                    <div className="text-xs font-medium text-gray-700">{formData.color_compositions[0]?.resin_color?.name}</div>
                                  </div>
                                  <div className="text-center">
                                    <div
                                      className="w-12 h-12 rounded-full mx-auto mb-2 shadow-sm"
                                      style={{ backgroundColor: formData.color_compositions[0].sand_color?.hex || '#ccc' }}
                                    ></div>
                                    <div className="text-xs font-medium text-gray-700">{formData.color_compositions[0]?.sand_color?.name}</div>
                                  </div>
                                  <div className="text-center">
                                    <div
                                      className="w-12 h-12 rounded-full mx-auto mb-2 shadow-sm"
                                      style={{ backgroundColor: formData.color_compositions[0].chips_color?.hex || '#ccc' }}
                                    ></div>
                                    <div className="text-xs font-medium text-gray-700">{formData.color_compositions[0]?.chips_color?.name}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Content Section */}
                              <div className="p-6">
                                <div className="text-center">
                                  <h5 className="text-lg font-bold text-gray-900 mb-2">{formData.color_compositions[0].name}</h5>
                                  <p className="text-sm text-gray-600 mb-3">{formData.color_compositions[0].description}</p>
                                  <button
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        color_compositions: [],
                                        resin_colors: [],
                                        sand_colors: [],
                                        chips_colors: []
                                      })
                                    }}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                  >
                                    Usuń kompozycję
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Colors Tab */}
                  {activeTab === 'colors' && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Konfiguracja kolorów</h3>
                        <button
                          onClick={() => window.open('/admin/color-compositions', '_blank')}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold transition-all transform hover:scale-105 shadow-lg"
                        >
                          🎨 Zarządzaj kompozycjami
                        </button>
                      </div>

                      {/* Mix Type Selection */}
                      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border-2 border-gray-200 shadow-sm">
                        <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Wybierz typ mieszanki</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="relative">
                            <input
                              type="radio"
                              id="ready_mix"
                              name="mix_type"
                              value="ready_mix"
                              checked={formData.mix_type === 'ready_mix'}
                              onChange={(e) => setFormData({...formData, mix_type: e.target.value as any})}
                              className="sr-only"
                            />
                            <label
                              htmlFor="ready_mix"
                              className={`flex items-center justify-center p-8 rounded-2xl border-3 cursor-pointer transition-all transform hover:scale-105 ${
                                formData.mix_type === 'ready_mix'
                                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 shadow-lg ring-2 ring-blue-200'
                                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-4xl mb-4">🎨</div>
                                <div className="font-bold text-lg mb-2">Gotowe kompozycje</div>
                                <div className="text-sm text-gray-600">Wybierz z gotowych kombinacji kolorów</div>
                                <div className="mt-3 text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                  6 profesjonalnych mieszanek
                                </div>
                              </div>
                            </label>
                          </div>

                          <div className="relative">
                            <input
                              type="radio"
                              id="custom_mix"
                              name="mix_type"
                              value="custom_mix"
                              checked={formData.mix_type === 'custom_mix'}
                              onChange={(e) => setFormData({...formData, mix_type: e.target.value as any})}
                              className="sr-only"
                            />
                            <label
                              htmlFor="custom_mix"
                              className={`flex items-center justify-center p-8 rounded-2xl border-3 cursor-pointer transition-all transform hover:scale-105 ${
                                formData.mix_type === 'custom_mix'
                                  ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 text-green-900 shadow-lg ring-2 ring-green-200'
                                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50 hover:shadow-md'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-4xl mb-4">⚙️</div>
                                <div className="font-bold text-lg mb-2">Własna mieszanka</div>
                                <div className="text-sm text-gray-600">Stwórz indywidualną kombinację kolorów</div>
                                <div className="mt-3 text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                  Pełna kontrola nad kolorami
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Ready Mix Selection */}
                      {formData.mix_type === 'ready_mix' && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-sm">
                          <h4 className="text-xl font-bold text-blue-900 mb-6 text-center">Gotowe kompozycje kolorów</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                              {
                                name: 'Beton industrialny',
                                resin: 'Szary RAL 7035',
                                sand: 'Piasek kwarcowy biały',
                                chips: 'Czarne chipsy',
                                preview: 'industrial'
                              },
                              {
                                name: 'Elegancki marmur',
                                resin: 'Biały RAL 9010',
                                sand: 'Piasek marmurowy',
                                chips: 'Szare chipsy',
                                preview: 'marble'
                              },
                              {
                                name: 'Ciepły beż',
                                resin: 'Beż RAL 1001',
                                sand: 'Piasek pustynny',
                                chips: 'Brązowe chipsy',
                                preview: 'beige'
                              },
                              {
                                name: 'Nowoczesny antracyt',
                                resin: 'Antracyt RAL 7016',
                                sand: 'Piasek bazaltowy',
                                chips: 'Srebrne chipsy',
                                preview: 'anthracite'
                              },
                              {
                                name: 'Naturalny brąz',
                                resin: 'Brąz RAL 8017',
                                sand: 'Piasek rzeczny',
                                chips: 'Miedziane chipsy',
                                preview: 'brown'
                              },
                              {
                                name: 'Śródziemnomorski',
                                resin: 'Niebieski RAL 5014',
                                sand: 'Piasek morski',
                                chips: 'Błękitne chipsy',
                                preview: 'mediterranean'
                              }
                            ].map((mix, index) => (
                              <div
                                key={index}
                                onClick={() => setFormData({
                                  ...formData,
                                  selected_ready_mix: mix.name,
                                  resin_colors: [{ color: mix.resin, quantity: 1 }],
                                  sand_colors: [{ color: mix.sand, quantity: 1 }],
                                  chips_colors: [{ color: mix.chips, quantity: 1 }]
                                })}
                                className={`p-6 rounded-2xl border-3 cursor-pointer transition-all transform hover:scale-105 ${
                                  formData.selected_ready_mix === mix.name
                                    ? 'border-blue-500 bg-white text-blue-900 shadow-xl ring-2 ring-blue-200'
                                    : 'border-gray-300 hover:border-blue-400 hover:bg-white hover:shadow-lg'
                                }`}
                              >
                                <div className="text-center">
                                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                                    <span className="text-2xl">🎨</span>
                                  </div>
                                  <div className="font-bold text-gray-900 mb-3 text-lg">{mix.name}</div>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-blue-700">Żywica:</span>
                                      <span className="text-gray-700">{mix.resin}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-green-700">Piasek:</span>
                                      <span className="text-gray-700">{mix.sand}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-purple-700">Chips:</span>
                                      <span className="text-gray-700">{mix.chips}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Custom Mix Selection */}
                      {formData.mix_type === 'custom_mix' && (
                        <div className="space-y-8">
                          {/* Resin Colors */}
                          <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl border border-blue-200 shadow-sm">
                            <h4 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
                              <span className="mr-3">🟦</span>
                              Kolory żywicy
                            </h4>
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Wybierz z palety RAL
                                  </label>
                                  <select
                                    className="w-full px-5 py-4 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-600 bg-white text-slate-900 font-medium text-lg shadow-sm hover:border-slate-400 transition-all duration-200"
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        const newColor = { color: e.target.value, quantity: 1 }
                                        setFormData({
                                          ...formData,
                                          resin_colors: [...formData.resin_colors, newColor]
                                        })
                                        e.target.value = ''
                                      }
                                    }}
                                  >
                                    <option value="">Wybierz kolor RAL...</option>
                                    <option value="RAL 1000">RAL 1000 - Zielony beż</option>
                                    <option value="RAL 1001">RAL 1001 - Beż</option>
                                    <option value="RAL 1002">RAL 1002 - Piaskowy żółty</option>
                                    <option value="RAL 1003">RAL 1003 - Sygnałowy żółty</option>
                                    <option value="RAL 2000">RAL 2000 - Żółto-pomarańczowy</option>
                                    <option value="RAL 3000">RAL 3000 - Czerwony ognisty</option>
                                    <option value="RAL 4000">RAL 4000 - Fioletowy</option>
                                    <option value="RAL 5000">RAL 5000 - Niebieski fioletowy</option>
                                    <option value="RAL 6000">RAL 6000 - Zielony patyna</option>
                                    <option value="RAL 7000">RAL 7000 - Szary wiewiórka</option>
                                    <option value="RAL 7016">RAL 7016 - Antracytowy</option>
                                    <option value="RAL 7035">RAL 7035 - Szary jasny</option>
                                    <option value="RAL 8017">RAL 8017 - Brąz czekoladowy</option>
                                    <option value="RAL 9005">RAL 9005 - Czarny głęboki</option>
                                    <option value="RAL 9010">RAL 9010 - Biały czysty</option>
                                  </select>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Wpisz kolor ręcznie
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Nazwa koloru..."
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && e.currentTarget.value) {
                                        const newColor = { color: e.currentTarget.value, quantity: 1 }
                                        setFormData({
                                          ...formData,
                                          resin_colors: [...formData.resin_colors, newColor]
                                        })
                                        e.currentTarget.value = ''
                                      }
                                    }}
                                  />
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Ilość (kg)
                                  </label>
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    placeholder="1.0"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                  />
                                </div>
                              </div>

                              {/* Selected Resin Colors */}
                              {formData.resin_colors.length > 0 && (
                                <div className="mt-6">
                                  <h5 className="text-lg font-bold text-blue-900 mb-4">Wybrane kolory żywicy:</h5>
                                  <div className="flex flex-wrap gap-3">
                                    {formData.resin_colors.map((resinColor, index) => (
                                      <div key={index} className="flex items-center bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 px-4 py-2 rounded-full border border-blue-300 shadow-sm">
                                        <span className="text-sm font-medium">{resinColor.color} ({resinColor.quantity}kg)</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newColors = formData.resin_colors.filter((_, i) => i !== index)
                                            setFormData({...formData, resin_colors: newColors})
                                          }}
                                          className="ml-3 text-blue-600 hover:text-blue-800 text-lg font-bold"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Sand Colors */}
                          <div className="bg-gradient-to-br from-white to-green-50 p-8 rounded-2xl border border-green-200 shadow-sm">
                            <h4 className="text-xl font-bold text-green-900 mb-6 flex items-center">
                              <span className="mr-3">🟩</span>
                              Kolory piasku
                            </h4>
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Wybierz z palety
                                  </label>
                                  <select
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium"
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        const newColor = { color: e.target.value, quantity: 1 }
                                        setFormData({
                                          ...formData,
                                          sand_colors: [...formData.sand_colors, newColor]
                                        })
                                        e.target.value = ''
                                      }
                                    }}
                                  >
                                    <option value="">Wybierz kolor piasku...</option>
                                    <option value="Piasek kwarcowy biały">Piasek kwarcowy biały</option>
                                    <option value="Piasek kwarcowy szary">Piasek kwarcowy szary</option>
                                    <option value="Piasek marmurowy">Piasek marmurowy</option>
                                    <option value="Piasek pustynny">Piasek pustynny</option>
                                    <option value="Piasek bazaltowy">Piasek bazaltowy</option>
                                    <option value="Piasek rzeczny">Piasek rzeczny</option>
                                    <option value="Piasek morski">Piasek morski</option>
                                    <option value="Piasek wulkaniczny">Piasek wulkaniczny</option>
                                  </select>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Wpisz kolor ręcznie
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Nazwa koloru piasku..."
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && e.currentTarget.value) {
                                        const newColor = { color: e.currentTarget.value, quantity: 1 }
                                        setFormData({
                                          ...formData,
                                          sand_colors: [...formData.sand_colors, newColor]
                                        })
                                        e.currentTarget.value = ''
                                      }
                                    }}
                                  />
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Ilość (kg)
                                  </label>
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    placeholder="1.0"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium"
                                  />
                                </div>
                              </div>

                              {/* Selected Sand Colors */}
                              {formData.sand_colors.length > 0 && (
                                <div className="mt-6">
                                  <h5 className="text-lg font-bold text-green-900 mb-4">Wybrane kolory piasku:</h5>
                                  <div className="flex flex-wrap gap-3">
                                    {formData.sand_colors.map((sandColor, index) => (
                                      <div key={index} className="flex items-center bg-gradient-to-r from-green-100 to-green-200 text-green-900 px-4 py-2 rounded-full border border-green-300 shadow-sm">
                                        <span className="text-sm font-medium">{sandColor.color} ({sandColor.quantity}kg)</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newColors = formData.sand_colors.filter((_, i) => i !== index)
                                            setFormData({...formData, sand_colors: newColors})
                                          }}
                                          className="ml-3 text-green-600 hover:text-green-800 text-lg font-bold"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Chips Colors */}
                          <div className="bg-gradient-to-br from-white to-purple-50 p-8 rounded-2xl border border-purple-200 shadow-sm">
                            <h4 className="text-xl font-bold text-purple-900 mb-6 flex items-center">
                              <span className="mr-3">🟣</span>
                              Kolory chips
                            </h4>
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Wybierz z palety
                                  </label>
                                  <select
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        const newColor = { color: e.target.value, quantity: 1 }
                                        setFormData({
                                          ...formData,
                                          chips_colors: [...formData.chips_colors, newColor]
                                        })
                                        e.target.value = ''
                                      }
                                    }}
                                  >
                                    <option value="">Wybierz kolor chips...</option>
                                    <option value="Czarne chipsy">Czarne chipsy</option>
                                    <option value="Szare chipsy">Szare chipsy</option>
                                    <option value="Brązowe chipsy">Brązowe chipsy</option>
                                    <option value="Srebrne chipsy">Srebrne chipsy</option>
                                    <option value="Miedziane chipsy">Miedziane chipsy</option>
                                    <option value="Błękitne chipsy">Błękitne chipsy</option>
                                    <option value="Złote chipsy">Złote chipsy</option>
                                    <option value="Perłowe chipsy">Perłowe chipsy</option>
                                  </select>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Wpisz kolor ręcznie
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Nazwa koloru chips..."
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && e.currentTarget.value) {
                                        const newColor = { color: e.currentTarget.value, quantity: 1 }
                                        setFormData({
                                          ...formData,
                                          chips_colors: [...formData.chips_colors, newColor]
                                        })
                                        e.currentTarget.value = ''
                                      }
                                    }}
                                  />
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Ilość (kg)
                                  </label>
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    placeholder="1.0"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                                  />
                                </div>
                              </div>

                              {/* Selected Chips Colors */}
                              {formData.chips_colors.length > 0 && (
                                <div className="mt-6">
                                  <h5 className="text-lg font-bold text-purple-900 mb-4">Wybrane kolory chips:</h5>
                                  <div className="flex flex-wrap gap-3">
                                    {formData.chips_colors.map((chipsColor, index) => (
                                      <div key={index} className="flex items-center bg-gradient-to-r from-purple-100 to-purple-200 text-purple-900 px-4 py-2 rounded-full border border-purple-300 shadow-sm">
                                        <span className="text-sm font-medium">{chipsColor.color} ({chipsColor.quantity}kg)</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newColors = formData.chips_colors.filter((_, i) => i !== index)
                                            setFormData({...formData, chips_colors: newColors})
                                          }}
                                          className="ml-3 text-purple-600 hover:text-purple-800 text-lg font-bold"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Flooring Tab */}
                  {activeTab === 'flooring' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Rodzaj żywicy</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Typ żywicy
                            </label>
                            <select
                              value={formData.resin_type}
                              onChange={(e) => setFormData({...formData, resin_type: e.target.value as any})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                              {resinTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Efekty dekoracyjne
                            </label>
                            <div className="space-y-2">
                              {decorativeEffectsOptions.map((effect) => (
                                <div key={effect} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`effect_${effect}`}
                                    checked={formData.decorative_effects.includes(effect)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFormData({
                                          ...formData,
                                          decorative_effects: [...formData.decorative_effects, effect]
                                        })
                                      } else {
                                        setFormData({
                                          ...formData,
                                          decorative_effects: formData.decorative_effects.filter(ef => ef !== effect)
                                        })
                                      }
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label htmlFor={`effect_${effect}`} className="ml-2 block text-sm text-gray-900">
                                    {effect}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Wykończenie</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Rodzaj wykończenia
                            </label>
                            <select
                              value={formData.finish_type}
                              onChange={(e) => setFormData({...formData, finish_type: e.target.value as any})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                              {finishTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Warstwa dekoracyjna
                            </label>
                            <input
                              type="text"
                              value={formData.decorative_layer}
                              onChange={(e) => setFormData({...formData, decorative_layer: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                              placeholder="Flakes, pigmenty, metallic..."
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Twardość
                              </label>
                              <select
                                value={formData.technical_params.hardness}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  technical_params: {...formData.technical_params, hardness: e.target.value}
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                              >
                                <option value="">Wybierz...</option>
                                <option value="soft">Miękka</option>
                                <option value="medium">Średnia</option>
                                <option value="hard">Twarda</option>
                                <option value="very_hard">Bardzo twarda</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Odporność chemiczna
                              </label>
                              <select
                                value={formData.technical_params.chemical_resistance}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  technical_params: {...formData.technical_params, chemical_resistance: e.target.value}
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                              >
                                <option value="">Wybierz...</option>
                                <option value="low">Niska</option>
                                <option value="medium">Średnia</option>
                                <option value="high">Wysoka</option>
                                <option value="very_high">Bardzo wysoka</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Antypoślizgowość
                              </label>
                              <select
                                value={formData.technical_params.anti_slip}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  technical_params: {...formData.technical_params, anti_slip: e.target.value}
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                              >
                                <option value="">Wybierz...</option>
                                <option value="none">Brak</option>
                                <option value="low">Niska</option>
                                <option value="medium">Średnia</option>
                                <option value="high">Wysoka</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Materials Tab */}
                  {activeTab === 'materials' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900">Koszty materiałów</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Żywica (zł)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.material_costs.resin_cost}
                            onChange={(e) => setFormData({
                              ...formData,
                              material_costs: {...formData.material_costs, resin_cost: parseFloat(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Utwardzacz (zł)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.material_costs.hardener_cost}
                            onChange={(e) => setFormData({
                              ...formData,
                              material_costs: {...formData.material_costs, hardener_cost: parseFloat(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Płatki (zł)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.material_costs.flakes_cost}
                            onChange={(e) => setFormData({
                              ...formData,
                              material_costs: {...formData.material_costs, flakes_cost: parseFloat(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Plastobeton/Mastic (zł)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.material_costs.plastbeton_cost}
                            onChange={(e) => setFormData({
                              ...formData,
                              material_costs: {...formData.material_costs, plastbeton_cost: parseFloat(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gruntowanie (zł)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.material_costs.primer_cost}
                            onChange={(e) => setFormData({
                              ...formData,
                              material_costs: {...formData.material_costs, primer_cost: parseFloat(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Folia (zł)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.material_costs.foil_cost}
                            onChange={(e) => setFormData({
                              ...formData,
                              material_costs: {...formData.material_costs, foil_cost: parseFloat(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Narzędzia jednorazowe (zł)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.material_costs.tools_cost}
                            onChange={(e) => setFormData({
                              ...formData,
                              material_costs: {...formData.material_costs, tools_cost: parseFloat(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Odliczenie nadmiaru (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.material_costs.material_excess}
                            onChange={(e) => setFormData({
                              ...formData,
                              material_costs: {...formData.material_costs, material_excess: parseFloat(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-lg font-bold text-blue-900 mb-2">Suma materiałów</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formData.subtotal_materials.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Labor Tab */}
                  {activeTab === 'labor' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900">Koszty robocizny</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'substrate_prep', name: 'Przygotowanie podłoża', unit: 'm²' },
                          { key: 'defect_repair', name: 'Naprawa ubytków', unit: 'm²' },
                          { key: 'priming', name: 'Gruntowanie', unit: 'm²' },
                          { key: 'resin_application', name: 'Aplikacja żywicy', unit: 'm²' },
                          { key: 'decoration', name: 'Dekoracje', unit: 'm²' },
                          { key: 'stairs_walls', name: 'Schody/ściany/cokoły', unit: 'm²' }
                        ].map((item) => (
                          <div key={item.key} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Min (zł)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.labor_costs[item.key as keyof typeof formData.labor_costs].min}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  labor_costs: {
                                    ...formData.labor_costs,
                                    [item.key]: {
                                      ...formData.labor_costs[item.key as keyof typeof formData.labor_costs],
                                      min: parseFloat(e.target.value) || 0
                                    }
                                  }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Max (zł)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.labor_costs[item.key as keyof typeof formData.labor_costs].max}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  labor_costs: {
                                    ...formData.labor_costs,
                                    [item.key]: {
                                      ...formData.labor_costs[item.key as keyof typeof formData.labor_costs],
                                      max: parseFloat(e.target.value) || 0
                                    }
                                  }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">{item.unit}</label>
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={formData.labor_costs[item.key as keyof typeof formData.labor_costs].sqm}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  labor_costs: {
                                    ...formData.labor_costs,
                                    [item.key]: {
                                      ...formData.labor_costs[item.key as keyof typeof formData.labor_costs],
                                      sqm: parseFloat(e.target.value) || 0
                                    }
                                  }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-lg font-bold text-green-900 mb-2">Suma robocizny</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formData.subtotal_labor.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Costs Tab */}
                  {activeTab === 'additional' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900">Koszty dodatkowe</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Transport (zł)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.additional_costs.transport}
                            onChange={(e) => setFormData({
                              ...formData,
                              additional_costs: {...formData.additional_costs, transport: parseFloat(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Wywóz odpadów (zł)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.additional_costs.waste_disposal}
                            onChange={(e) => setFormData({
                              ...formData,
                              additional_costs: {...formData.additional_costs, waste_disposal: parseFloat(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nagrzewnice/osuszanie (zł)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.additional_costs.heating_drying}
                            onChange={(e) => setFormData({
                              ...formData,
                              additional_costs: {...formData.additional_costs, heating_drying: parseFloat(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Malowanie linii (zł)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.additional_costs.line_painting}
                            onChange={(e) => setFormData({
                              ...formData,
                              additional_costs: {...formData.additional_costs, line_painting: parseFloat(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Inne (zł)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.additional_costs.other}
                            onChange={(e) => setFormData({
                              ...formData,
                              additional_costs: {...formData.additional_costs, other: parseFloat(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Opis innych kosztów
                          </label>
                          <textarea
                            value={formData.additional_costs.other_description}
                            onChange={(e) => setFormData({
                              ...formData,
                              additional_costs: {...formData.additional_costs, other_description: e.target.value}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Opisz dodatkowe koszty..."
                          />
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-lg font-bold text-purple-900 mb-2">Suma dodatkowych</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formData.subtotal_additional.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Schedule Tab */}
                  {activeTab === 'schedule' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900">Harmonogram prac</h3>
                      <div className="space-y-4">
                        <button
                          type="button"
                          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                        >
                          ➕ Dodaj etap prac
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Summary Tab */}
                  {activeTab === 'summary' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900">Podsumowanie wyceny</h3>
                      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Materiały:</span>
                          <span className="font-bold text-gray-900">
                            {formData.subtotal_materials.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Robocizna:</span>
                          <span className="font-bold text-gray-900">
                            {formData.subtotal_labor.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Dodatkowe:</span>
                          <span className="font-bold text-gray-900">
                            {formData.subtotal_additional.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                          </span>
                        </div>
                        {formData.discount_applicable && (
                          <div className="flex justify-between text-green-600">
                            <span className="font-medium">Rabat ({formData.discount_percentage}%):</span>
                            <span className="font-bold">
                              -{formData.discount_amount.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">VAT (23%):</span>
                          <span className="font-bold text-gray-900">
                            {formData.vat_amount.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                          </span>
                        </div>
                        <hr className="border-gray-300" />
                        <div className="flex justify-between text-xl font-bold text-gray-900">
                          <span>Łącznie (min-max):</span>
                          <span>
                            {formData.total_min.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })} -
                            {formData.total_max.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes Tab */}
                  {activeTab === 'notes' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ryzyka i uwagi
                        </label>
                        <textarea
                          value={formData.risks_warnings}
                          onChange={(e) => setFormData({...formData, risks_warnings: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Nierówności, pęknięcia, trudny dostęp, warunki atmosferyczne, ryzyka chemiczne..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Uwagi dla klienta
                        </label>
                        <textarea
                          value={formData.client_notes}
                          onChange={(e) => setFormData({...formData, client_notes: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Warunki gwarancji, procedura reklamacji..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Uwagi dla wykonawcy
                        </label>
                        <textarea
                          value={formData.contractor_notes}
                          onChange={(e) => setFormData({...formData, contractor_notes: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Szczególne wymagania wykonawcy..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 mt-8">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    {editingQuotation ? 'Aktualizuj wycenę' : 'Zapisz wycenę'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingQuotation(null)
                    }}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quotations List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {quotations.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Brak wycen szczegółowych</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Zacznij tworzyć szczegółowe wyceny dla wykonawców używając formularza powyżej.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span className="mr-2">➕</span>
                Utwórz pierwszą wycenę
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numer oferty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projekt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wartość
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotations.map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {quotation.quotation_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{quotation.client_name}</div>
                        <div className="text-sm text-gray-500">{quotation.client_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{quotation.project_name}</div>
                        <div className="text-sm text-gray-500">{quotation.project_location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">
                          {quotation.total_min.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })} -
                          {quotation.total_max.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          quotation.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          quotation.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          quotation.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {quotation.status === 'draft' ? 'Szkic' :
                           quotation.status === 'sent' ? 'Wysłana' :
                           quotation.status === 'approved' ? 'Zatwierdzona' :
                           'Odrzucona'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quotation.created_at ? new Date(quotation.created_at).toLocaleDateString('pl-PL') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingQuotation(quotation)
                              setFormData(quotation)
                              setShowForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                            title="Edytuj"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Generate PDF
                              console.log('Generate PDF for quotation:', quotation.id)
                            }}
                            className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition-colors"
                            title="Generuj PDF"
                          >
                            📄
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Delete quotation
                              console.log('Delete quotation:', quotation.id)
                            }}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Usuń"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
