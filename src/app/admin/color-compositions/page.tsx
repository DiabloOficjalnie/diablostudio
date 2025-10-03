 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'

// Color interfaces
interface RALColor {
  code: string
  name: string
  hex: string
  rgb_r: number
  rgb_g: number
  rgb_b: number
  category: string
}

interface SandColor {
  code: string
  name: string
  hex: string
  rgb_r: number
  rgb_g: number
  rgb_b: number
  category: string
  image_path: string
}

interface ChipsColor {
  code: string
  name: string
  hex: string
  rgb_r: number
  rgb_g: number
  rgb_b: number
  category: string
  image_path: string
}

interface ColorComposition {
  id: string
  name: string
  description: string
  application: string
  resin_colors: RALColor[]
  sand_colors: SandColor[]
  chips_colors: ChipsColor[]
  decorative_type: 'sand' | 'chips' | 'none'
  resin_type?: string
  system_type?: string
  floor_type?: string
  preview_image?: string
  created_at: string
  updated_at: string
  is_active: boolean
  usage_count: number
  tags: string[]
}

export default function ColorCompositionsPage() {
  const router = useRouter()
  const [compositions, setCompositions] = useState<ColorComposition[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingComposition, setEditingComposition] = useState<ColorComposition | null>(null)
  const [previewComposition, setPreviewComposition] = useState<ColorComposition | null>(null)
  const [activeTab, setActiveTab] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCompositions, setFilteredCompositions] = useState<ColorComposition[]>([])

  // Available colors from database
  const [ralColors, setRalColors] = useState<RALColor[]>([])
  const [sandColors, setSandColors] = useState<SandColor[]>([])
  const [chipsColors, setChipsColors] = useState<ChipsColor[]>([])

  const [formData, setFormData] = useState<Partial<ColorComposition>>({
    name: '',
    description: '',
    application: '',
    is_active: true,
    decorative_type: 'sand',
    tags: []
  })

  // Multiple color selections (up to 5 per category)
  const [selectedRalColors, setSelectedRalColors] = useState<RALColor[]>([])
  const [selectedSandColors, setSelectedSandColors] = useState<SandColor[]>([])
  const [selectedChipsColors, setSelectedChipsColors] = useState<ChipsColor[]>([])

  useEffect(() => {
    // Load colors first, then compositions
    loadColors().then(() => {
      loadCompositions()
    })
  }, [])

  const loadColors = async () => {
    try {
      // Load ALL colors from database - same as main colors page
      console.log('Loading all colors from database...')
      const response = await fetch('/api/colors')

      if (response.ok) {
        const allColors = await response.json()
        console.log('Loaded all colors from database:', allColors.length)

        // Filter colors by category - same as main colors page
        const ralColorsData = allColors.filter((color: any) => ['yellow', 'orange', 'red', 'violet', 'blue', 'green', 'grey', 'white', 'black'].includes(color.category))
        const sandColorsData = allColors.filter((color: any) => color.category === 'sand')
        const chipsColorsData = allColors.filter((color: any) => color.category === 'chips')

        console.log('RAL colors:', ralColorsData.length)
        console.log('Sand colors:', sandColorsData.length)
        console.log('Chips colors:', chipsColorsData.length)

        setRalColors(ralColorsData)
        setSandColors(sandColorsData)
        setChipsColors(chipsColorsData)
      } else {
        console.error('Failed to load colors from database, status:', response.status)
        await loadDemoDataAsFallback()
      }
    } catch (error) {
      console.error('Error loading colors from database:', error)
      await loadDemoDataAsFallback()
    }
  }

  const loadDemoDataAsFallback = async () => {
    try {
      const ralResponse = await fetch('/demo-data/colors-ral.json')
      const sandResponse = await fetch('/demo-data/colors-sands.json')
      const chipsResponse = await fetch('/demo-data/colors-chips.json')

      if (ralResponse.ok) {
        const ralData = await ralResponse.json()
        console.log('Loaded RAL colors from demo data:', ralData.length)
        setRalColors(ralData)
      }

      if (sandResponse.ok) {
        const sandData = await sandResponse.json()
        console.log('Loaded sand colors from demo data:', sandData.length)
        setSandColors(sandData)
      }

      if (chipsResponse.ok) {
        const chipsData = await chipsResponse.json()
        console.log('Loaded chips colors from demo data:', chipsData.length)
        setChipsColors(chipsData)
      }
    } catch (fallbackError) {
      console.error('Error loading fallback demo data:', fallbackError)
    }
  }

  const loadCompositions = async () => {
    try {
      setLoading(true)

      // Load compositions from API (which connects to database)
      const response = await fetch('/api/color-compositions')

      if (response.ok) {
        const data = await response.json()
        console.log('Loaded compositions from API:', data.compositions?.length || 0)

        // Transform API data to match our interface
        const compositionsFromAPI: ColorComposition[] = (data.compositions || []).map((comp: any) => ({
          id: comp.id,
          name: comp.name,
          description: comp.description,
          application: comp.application || '',
          resin_colors: comp.composition_colors?.filter((c: any) => ralColors.some(rc => rc.code === c.color_code)).map((c: any) => ralColors.find(rc => rc.code === c.color_code)).filter(Boolean) || [],
          sand_colors: comp.composition_colors?.filter((c: any) => sandColors.some(sc => sc.code === c.color_code)).map((c: any) => sandColors.find(sc => sc.code === c.color_code)).filter(Boolean) || [],
          chips_colors: comp.composition_colors?.filter((c: any) => chipsColors.some(cc => cc.code === c.color_code)).map((c: any) => chipsColors.find(cc => cc.code === c.color_code)).filter(Boolean) || [],
          decorative_type: comp.composition_colors?.some((c: any) => sandColors.some(sc => sc.code === c.color_code)) ? 'sand' : 'chips',
          resin_type: comp.resin_type,
          system_type: comp.system_type,
          floor_type: comp.floor_type,
          preview_image: comp.preview_image,
          created_at: comp.created_at || new Date().toISOString(),
          updated_at: comp.updated_at || new Date().toISOString(),
          is_active: comp.is_active !== undefined ? comp.is_active : true,
          usage_count: comp.usage_count || 0,
          tags: comp.tags || []
        }))

        setCompositions(compositionsFromAPI)
      } else {
        console.error('Failed to load compositions from API, status:', response.status)
        // Fallback to mock data if API fails
        await loadMockCompositions()
      }
    } catch (error) {
      console.error('Error loading compositions from API:', error)
      // Fallback to mock data if API fails
      await loadMockCompositions()
    }
    setLoading(false)
  }

  const loadMockCompositions = async () => {
    // Wait for colors to load first
    await new Promise(resolve => setTimeout(resolve, 100))

    const mockCompositions: ColorComposition[] = [
      {
        id: '1',
        name: 'Beton industrialny',
        description: 'Klasyczna szara kolorystyka w stylu industrialnym',
        application: 'Garaże, warsztaty, przestrzenie komercyjne',
        resin_colors: ralColors.filter(c => ['RAL 7035', 'RAL 7040'].includes(c.code)),
        sand_colors: [sandColors.find(c => c.code === 'Piasek kwarcowy M01')].filter(Boolean) as SandColor[],
        chips_colors: [chipsColors.find(c => c.code === 'Chips 07')].filter(Boolean) as ChipsColor[],
        decorative_type: 'sand',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        usage_count: 15,
        tags: ['industrialne', 'szare', 'klasyczne']
      },
      {
        id: '2',
        name: 'Elegancki marmur',
        description: 'Biała kolorystyka z marmurowym efektem',
        application: 'Salony, biura, przestrzenie reprezentacyjne',
        resin_colors: ralColors.filter(c => ['RAL 9010', 'RAL 9003'].includes(c.code)),
        sand_colors: [sandColors.find(c => c.code === 'Piasek kwarcowy M03')].filter(Boolean) as SandColor[],
        chips_colors: [chipsColors.find(c => c.code === 'Chips 12')].filter(Boolean) as ChipsColor[],
        decorative_type: 'chips',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        usage_count: 8,
        tags: ['eleganckie', 'białe', 'marmurowe']
      }
    ]
    setCompositions(mockCompositions)
  }

  // Helper functions for managing multiple color selections
  const addRalColor = (color: RALColor) => {
    if (selectedRalColors.length < 5 && !selectedRalColors.find(c => c.code === color.code)) {
      setSelectedRalColors(prev => [...prev, color])
    }
  }

  const removeRalColor = (colorCode: string) => {
    setSelectedRalColors(prev => prev.filter(c => c.code !== colorCode))
  }

  const addSandColor = (color: SandColor) => {
    if (selectedSandColors.length < 5 && !selectedSandColors.find(c => c.code === color.code)) {
      setSelectedSandColors(prev => [...prev, color])
    }
  }

  const removeSandColor = (colorCode: string) => {
    setSelectedSandColors(prev => prev.filter(c => c.code !== colorCode))
  }

  const addChipsColor = (color: ChipsColor) => {
    if (selectedChipsColors.length < 5 && !selectedChipsColors.find(c => c.code === color.code)) {
      setSelectedChipsColors(prev => [...prev, color])
    }
  }

  const removeChipsColor = (colorCode: string) => {
    setSelectedChipsColors(prev => prev.filter(c => c.code !== colorCode))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || selectedRalColors.length === 0 || (selectedSandColors.length === 0 && selectedChipsColors.length === 0)) {
      alert('Wypełnij wszystkie wymagane pola! Wybierz przynajmniej jeden kolor RAL i jeden efekt dekoracyjny.')
      return
    }

    try {
      // Prepare composition colors array for API
      const compositionColors = [
        ...selectedRalColors.map(color => ({
          color_code: color.code,
          color_name: color.name,
          color_hex: color.hex,
          percentage: Math.round(100 / (selectedRalColors.length + selectedSandColors.length + selectedChipsColors.length))
        })),
        ...selectedSandColors.map(color => ({
          color_code: color.code,
          color_name: color.name,
          color_hex: color.hex,
          percentage: Math.round(100 / (selectedRalColors.length + selectedSandColors.length + selectedChipsColors.length))
        })),
        ...selectedChipsColors.map(color => ({
          color_code: color.code,
          color_name: color.name,
          color_hex: color.hex,
          percentage: Math.round(100 / (selectedRalColors.length + selectedSandColors.length + selectedChipsColors.length))
        }))
      ]

      const requestData = {
        id: editingComposition?.id,
        name: formData.name,
        description: formData.description,
        application: formData.application,
        is_active: formData.is_active,
        is_featured: false,
        status: 'published',
        sort_order: 0,
        composition_colors: compositionColors,
        resin_type: formData.resin_type,
        system_type: formData.system_type,
        floor_type: formData.floor_type,
        decorative_type: formData.decorative_type,
        tags: formData.tags || []
      }

      console.log('Sending composition data to API:', requestData)

      let response
      if (editingComposition) {
        // Update existing composition
        response = await fetch('/api/color-compositions', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        })
      } else {
        // Create new composition
        response = await fetch('/api/color-compositions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        })
      }

      const result = await response.json()
      console.log('API response:', result)

      if (response.ok && result.success) {
        // Reload compositions from API to get updated data
        await loadCompositions()

        // Reset form
        setFormData({
          name: '',
          description: '',
          application: '',
          is_active: true,
          decorative_type: 'sand',
          tags: []
        })
        setSelectedRalColors([])
        setSelectedSandColors([])
        setSelectedChipsColors([])
        setShowForm(false)
        setEditingComposition(null)

        alert(editingComposition ? 'Kompozycja została zaktualizowana!' : 'Kompozycja została dodana!')
      } else {
        console.error('API error:', result)
        alert(`Błąd podczas zapisywania kompozycji: ${result.error || 'Nieznany błąd'}`)
      }
    } catch (error) {
      console.error('Error saving composition:', error)
      alert('Błąd podczas zapisywania kompozycji!')
    }
  }

  const deleteComposition = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę kompozycję?')) {
      try {
        const response = await fetch(`/api/color-compositions?id=${id}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (response.ok && result.success) {
          // Reload compositions from API to get updated data
          await loadCompositions()
          alert('Kompozycja została usunięta pomyślnie!')
        } else {
          console.error('API error:', result)
          alert(`Błąd podczas usuwania kompozycji: ${result.error || 'Nieznany błąd'}`)
        }
      } catch (error) {
        console.error('Error deleting composition:', error)
        alert('Błąd podczas usuwania kompozycji!')
      }
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie kompozycji kolorów...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Kompozycje kolorów</h1>
            <p className="text-gray-600 mt-1">Zarządzaj gotowymi kombinacjami kolorów</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <span className="mr-2">➕</span>
              Nowa kompozycja
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="border-b border-gray-200 p-6">
            <nav className="flex space-x-8">
              {[
                { id: 'list', name: 'Lista kompozycji', icon: '📋' },
                { id: 'database', name: 'Baza kolorów', icon: '🎨' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Compositions List Tab */}
            {activeTab === 'list' && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <div className="flex flex-col lg:flex-row gap-6 items-center">
                    <div className="flex-1 w-full lg:w-auto">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Szukaj kompozycji po nazwie, opisie lub tagach..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-slate-800 placeholder-slate-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-slate-400 text-lg">🔍</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <select className="px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-slate-800 min-w-[140px]">
                        <option value="">Wszystkie</option>
                        <option value="active">Aktywne</option>
                        <option value="inactive">Nieaktywne</option>
                      </select>
                      <select className="px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-slate-50 text-slate-800 min-w-[140px]">
                        <option value="">Wszystkie typy</option>
                        <option value="sand">Piasek</option>
                        <option value="chips">Chips</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {compositions.map((composition) => (
                    <div key={composition.id} className="group relative">
                      {/* Main Card - Style matching the main page */}
                      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300 transform hover:-translate-y-1">
                        {/* Header with Title and Featured Badge */}
                        <div className="p-6 pb-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {composition.name}
                            </h3>
                            {composition.is_featured && (
                              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                <span>⭐</span>
                                Polecana
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            {composition.description}
                          </p>
                        </div>

                        {/* Color Preview Bar - Real colors from database */}
                        <div className="px-6 pb-4">
                          <div className="h-16 rounded-lg overflow-hidden border shadow-sm">
                            <div className="h-full flex">
                              {/* RAL Colors */}
                              {composition.resin_colors?.map((color, index) => (
                                <div
                                  key={`ral-${color.code}-${index}`}
                                  className="flex-1 h-full relative group"
                                  style={{ backgroundColor: color.hex }}
                                  title={`${color.name} (${Math.round(100 / ((composition.resin_colors?.length || 1) + (composition.sand_colors?.length || 0) + (composition.chips_colors?.length || 0)))}%)`}
                                >
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                    <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                                      {Math.round(100 / ((composition.resin_colors?.length || 1) + (composition.sand_colors?.length || 0) + (composition.chips_colors?.length || 0)))}%
                                    </span>
                                  </div>
                                </div>
                              ))}

                              {/* Sand Colors */}
                              {composition.sand_colors?.map((color, index) => {
                                const getSandImagePath = (code: string) => {
                                  const imageMap: { [key: string]: string } = {
                                    'Piasek kwarcowy M01': '/assets/Piaski/webersys mix PU M_01.jpg',
                                    'Piasek kwarcowy M02': '/assets/Piaski/webersys mix PU M_02.jpg',
                                    'Piasek kwarcowy M03': '/assets/Piaski/webersys mix PU M_03.jpg',
                                    'Piasek kwarcowy M04': '/assets/Piaski/webersys mix PU M_04.jpg',
                                    'Piasek kwarcowy M05': '/assets/Piaski/webersys mix PU M_05.jpg',
                                    'Piasek kwarcowy M06': '/assets/Piaski/webersys mix PU M_06.jpg',
                                    'Piasek kwarcowy M07': '/assets/Piaski/webersys mix PU M_07.jpg',
                                    'Piasek kwarcowy M08': '/assets/Piaski/webersys mix PU M_08.jpg',
                                    'Piasek kwarcowy M09': '/assets/Piaski/webersys mix PU M_09.jpg',
                                    'Piasek kwarcowy M10': '/assets/Piaski/webersys mix PU M_10.jpg',
                                    'Piasek kwarcowy M11': '/assets/Piaski/webersys mix PU M_11.jpg',
                                    'Piasek kwarcowy M12': '/assets/Piaski/webersys mix PU M_12.jpg',
                                    'Piasek kwarcowy M13': '/assets/Piaski/webersys mix PU M_13.jpg',
                                    'Piasek kwarcowy M14': '/assets/Piaski/webersys mix PU M_14.jpg',
                                    'Piasek kwarcowy M15': '/assets/Piaski/webersys mix PU M_15.jpg',
                                    'Piasek kwarcowy M16': '/assets/Piaski/webersys mix PU M_16.jpg',
                                  }
                                  return imageMap[code] || null
                                }

                                const imagePath = getSandImagePath(color.code)

                                return (
                                  <div
                                    key={`sand-${color.code}-${index}`}
                                    className="flex-1 h-full relative group bg-cover bg-center"
                                    style={{
                                      backgroundImage: imagePath ? `url(${imagePath})` : `linear-gradient(135deg, ${color.hex}, ${color.hex}dd)`,
                                      backgroundColor: imagePath ? undefined : color.hex
                                    }}
                                    title={`${color.name} (${Math.round(100 / ((composition.resin_colors?.length || 0) + (composition.sand_colors?.length || 1) + (composition.chips_colors?.length || 0)))}%)`}
                                  >
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                      <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                                        {Math.round(100 / ((composition.resin_colors?.length || 0) + (composition.sand_colors?.length || 1) + (composition.chips_colors?.length || 0)))}%
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}

                              {/* Chips Colors */}
                              {composition.chips_colors?.map((color, index) => {
                                const getChipsImagePath = (code: string) => {
                                  const imageMap: { [key: string]: string } = {
                                    'Chips 01': '/assets/Chips/webersys chips_01.jpg',
                                    'Chips 02': '/assets/Chips/webersys chips_02.jpg',
                                    'Chips 03': '/assets/Chips/webersys chips_03.jpg',
                                    'Chips 05': '/assets/Chips/webersys chips_05.jpg',
                                    'Chips 07': '/assets/Chips/webersys chips_07.jpg',
                                    'Chips 08': '/assets/Chips/webersys chips_08.jpg',
                                    'Chips 09': '/assets/Chips/webersys chips_09.jpg',
                                    'Chips 10': '/assets/Chips/webersys chips_10.jpg',
                                    'Chips 11': '/assets/Chips/webersys chips_11.jpg',
                                    'Chips 12': '/assets/Chips/webersys chips_12.jpg',
                                    'Chips 13': '/assets/Chips/webersys chips_13.jpg',
                                    'Chips 16': '/assets/Chips/webersys chips_16.jpg',
                                    'Chips 17': '/assets/Chips/webersys chips_17.jpg',
                                    'Chips 18': '/assets/Chips/webersys chips_18.jpg',
                                    'Chips 19': '/assets/Chips/webersys chips_19.jpg',
                                    'Chips 20': '/assets/Chips/webersys chips_20.jpg',
                                    'Chips 21': '/assets/Chips/webersys chips_21.jpg',
                                  }
                                  return imageMap[code] || null
                                }

                                const imagePath = getChipsImagePath(color.code)

                                return (
                                  <div
                                    key={`chips-${color.code}-${index}`}
                                    className="flex-1 h-full relative group bg-cover bg-center"
                                    style={{
                                      backgroundImage: imagePath ? `url(${imagePath})` : `linear-gradient(135deg, ${color.hex}, ${color.hex}dd)`,
                                      backgroundColor: imagePath ? undefined : color.hex
                                    }}
                                    title={`${color.name} (${Math.round(100 / ((composition.resin_colors?.length || 0) + (composition.sand_colors?.length || 0) + (composition.chips_colors?.length || 1)))}%)`}
                                  >
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                      <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                                        {Math.round(100 / ((composition.resin_colors?.length || 0) + (composition.sand_colors?.length || 0) + (composition.chips_colors?.length || 1)))}%
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}

                              {/* No Colors Indicator */}
                              {(!composition.resin_colors || composition.resin_colors.length === 0) &&
                               (!composition.sand_colors || composition.sand_colors.length === 0) &&
                               (!composition.chips_colors || composition.chips_colors.length === 0) && (
                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                  <span className="text-gray-500 text-sm">Brak kolorów</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Color Details List - Real colors from database */}
                        <div className="px-6 pb-4">
                          <div className="space-y-2">
                            {/* RAL Colors */}
                            {composition.resin_colors?.map((color, index) => (
                              <div key={`ral-list-${color.code}-${index}`} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                  <span className="text-gray-700 font-medium">{color.name}</span>
                                </div>
                                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs">
                                  {Math.round(100 / ((composition.resin_colors?.length || 1) + (composition.sand_colors?.length || 0) + (composition.chips_colors?.length || 0)))}%
                                </span>
                              </div>
                            ))}

                            {/* Sand Colors */}
                            {composition.sand_colors?.map((color, index) => (
                              <div key={`sand-list-${color.code}-${index}`} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                  <div className="w-4 h-4 rounded-full border border-gray-300 shadow-sm bg-cover bg-center"
                                       style={{ backgroundColor: color.hex }}></div>
                                  <span className="text-gray-700 font-medium">{color.name}</span>
                                </div>
                                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs">
                                  {Math.round(100 / ((composition.resin_colors?.length || 0) + (composition.sand_colors?.length || 1) + (composition.chips_colors?.length || 0)))}%
                                </span>
                              </div>
                            ))}

                            {/* Chips Colors */}
                            {composition.chips_colors?.map((color, index) => (
                              <div key={`chips-list-${color.code}-${index}`} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                  <div className="w-4 h-4 rounded-full border border-gray-300 shadow-sm bg-cover bg-center"
                                       style={{ backgroundColor: color.hex }}></div>
                                  <span className="text-gray-700 font-medium">{color.name}</span>
                                </div>
                                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs">
                                  {Math.round(100 / ((composition.resin_colors?.length || 0) + (composition.sand_colors?.length || 0) + (composition.chips_colors?.length || 1)))}%
                                </span>
                              </div>
                            ))}

                            {/* No Colors Message */}
                            {(!composition.resin_colors || composition.resin_colors.length === 0) &&
                             (!composition.sand_colors || composition.sand_colors.length === 0) &&
                             (!composition.chips_colors || composition.chips_colors.length === 0) && (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                Brak zdefiniowanych kolorów
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button - Matching main page style */}
                        <div className="px-6 pb-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setPreviewComposition(composition)
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                          >
                            <span>👁️</span>
                            Zobacz szczegóły
                          </button>
                        </div>

                        {/* Admin Action Buttons - Hidden by default, shown on hover */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingComposition(composition)
                                setFormData(composition)
                                setSelectedRalColors(composition.resin_colors || [])
                                setSelectedSandColors(composition.sand_colors || [])
                                setSelectedChipsColors(composition.chips_colors || [])
                                setFormData(prev => ({ ...prev, decorative_type: composition.decorative_type }))
                                setShowForm(true)
                              }}
                              className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
                              title="Edytuj"
                            >
                              <span className="text-xs">✏️</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteComposition(composition.id)
                              }}
                              className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
                              title="Usuń"
                            >
                              <span className="text-xs">🗑️</span>
                            </button>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                            composition.is_active
                              ? 'bg-emerald-500/90 text-white backdrop-blur-sm'
                              : 'bg-red-500/90 text-white backdrop-blur-sm'
                          }`}>
                            {composition.is_active ? '✓ Aktywna' : '✗ Nieaktywna'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {compositions.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-6">🎨</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Brak kompozycji kolorów</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                      Utwórz pierwsze kompozycje kolorów, które będą dostępne w wycenach szczegółowych.
                    </p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <span className="mr-2">➕</span>
                      Utwórz pierwszą kompozycję
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Color Database Tab - READ ONLY DISPLAY */}
            {activeTab === 'database' && (
              <div className="space-y-8">
                {/* RAL Colors - Read Only */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <span className="mr-3">🟦</span>
                      Paleta RAL - Żywice
                    </h3>
                    <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                      {ralColors.length} kolorów
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {ralColors.map((color) => (
                      <div
                        key={color.code}
                        className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <div
                          className="w-full h-16 rounded-t-lg shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <div className="p-3 text-center">
                          <div className="font-bold text-sm text-gray-900">{color.code}</div>
                                  <div className="text-xs text-gray-600 mt-1 truncate" title={color.name}>{color.name.replace(/"/g, '"')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sand Colors - Piasek kwarcowy MIX - Read Only with Images */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <span className="mr-3">🟩</span>
                      Piasek kwarcowy MIX
                    </h3>
                    <span className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                      {sandColors.length} kolorów
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {sandColors.map((color) => {
                      // Map color codes to actual image paths
                      const getSandImagePath = (code: string) => {
                        const imageMap: { [key: string]: string } = {
                          'Piasek kwarcowy M01': '/assets/Piaski/webersys mix PU M_01.jpg',
                          'Piasek kwarcowy M02': '/assets/Piaski/webersys mix PU M_02.jpg',
                          'Piasek kwarcowy M03': '/assets/Piaski/webersys mix PU M_03.jpg',
                          'Piasek kwarcowy M04': '/assets/Piaski/webersys mix PU M_04.jpg',
                          'Piasek kwarcowy M05': '/assets/Piaski/webersys mix PU M_05.jpg',
                          'Piasek kwarcowy M06': '/assets/Piaski/webersys mix PU M_06.jpg',
                          'Piasek kwarcowy M07': '/assets/Piaski/webersys mix PU M_07.jpg',
                          'Piasek kwarcowy M08': '/assets/Piaski/webersys mix PU M_08.jpg',
                          'Piasek kwarcowy M09': '/assets/Piaski/webersys mix PU M_09.jpg',
                          'Piasek kwarcowy M10': '/assets/Piaski/webersys mix PU M_10.jpg',
                          'Piasek kwarcowy M11': '/assets/Piaski/webersys mix PU M_11.jpg',
                          'Piasek kwarcowy M12': '/assets/Piaski/webersys mix PU M_12.jpg',
                          'Piasek kwarcowy M13': '/assets/Piaski/webersys mix PU M_13.jpg',
                          'Piasek kwarcowy M14': '/assets/Piaski/webersys mix PU M_14.jpg',
                          'Piasek kwarcowy M15': '/assets/Piaski/webersys mix PU M_15.jpg',
                          'Piasek kwarcowy M16': '/assets/Piaski/webersys mix PU M_16.jpg',
                        }
                        return imageMap[code] || null
                      }

                      const imagePath = getSandImagePath(color.code)

                      return (
                        <div
                          key={color.code}
                          className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                          {imagePath ? (
                            <div className="w-full h-24 rounded-t-lg shadow-sm overflow-hidden bg-gray-100">
                              <img
                                src={imagePath}
                                alt={color.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  console.error(`Failed to load sand image: ${imagePath}`)
                                  // Fallback to color if image fails
                                  const target = e.currentTarget
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    const fallbackDiv = document.createElement('div')
                                    fallbackDiv.className = 'w-full h-full'
                                    fallbackDiv.style.backgroundColor = color.hex
                                    parent.appendChild(fallbackDiv)
                                  }
                                }}
                                onLoad={() => console.log(`Successfully loaded sand image: ${imagePath}`)}
                              />
                            </div>
                          ) : (
                            <div
                              className="w-full h-24 rounded-t-lg shadow-sm"
                              style={{ backgroundColor: color.hex }}
                            ></div>
                          )}
                          <div className="p-3 text-center">
                            <div className="font-bold text-sm text-gray-900">{color.code}</div>
                            <div className="text-xs text-gray-600 mt-1 truncate" title={color.name}>{color.name}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Chips Colors - Dekoracyjne chips - Read Only with Images */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <span className="mr-3">🟣</span>
                      Dekoracyjne chips
                    </h3>
                    <span className="text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                      {chipsColors.length} kolorów
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {chipsColors.map((color) => {
                      // Map color codes to actual image paths for chips
                      const getChipsImagePath = (code: string) => {
                        const imageMap: { [key: string]: string } = {
                          'Chips 01': '/assets/Chips/webersys chips_01.jpg',
                          'Chips 02': '/assets/Chips/webersys chips_02.jpg',
                          'Chips 03': '/assets/Chips/webersys chips_03.jpg',
                          'Chips 05': '/assets/Chips/webersys chips_05.jpg',
                          'Chips 07': '/assets/Chips/webersys chips_07.jpg',
                          'Chips 08': '/assets/Chips/webersys chips_08.jpg',
                          'Chips 09': '/assets/Chips/webersys chips_09.jpg',
                          'Chips 10': '/assets/Chips/webersys chips_10.jpg',
                          'Chips 11': '/assets/Chips/webersys chips_11.jpg',
                          'Chips 12': '/assets/Chips/webersys chips_12.jpg',
                          'Chips 13': '/assets/Chips/webersys chips_13.jpg',
                          'Chips 16': '/assets/Chips/webersys chips_16.jpg',
                          'Chips 17': '/assets/Chips/webersys chips_17.jpg',
                          'Chips 18': '/assets/Chips/webersys chips_18.jpg',
                          'Chips 19': '/assets/Chips/webersys chips_19.jpg',
                          'Chips 20': '/assets/Chips/webersys chips_20.jpg',
                          'Chips 21': '/assets/Chips/webersys chips_21.jpg',
                        }
                        return imageMap[code] || null
                      }

                      const imagePath = getChipsImagePath(color.code)

                      return (
                        <div
                          key={color.code}
                          className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                          {imagePath ? (
                            <div className="w-full h-24 rounded-t-lg shadow-sm overflow-hidden bg-gray-100">
                              <img
                                src={imagePath}
                                alt={color.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  console.error(`Failed to load chips image: ${imagePath}`)
                                  // Fallback to color if image fails
                                  const target = e.currentTarget
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    const fallbackDiv = document.createElement('div')
                                    fallbackDiv.className = 'w-full h-full'
                                    fallbackDiv.style.backgroundColor = color.hex
                                    parent.appendChild(fallbackDiv)
                                  }
                                }}
                                onLoad={() => console.log(`Successfully loaded chips image: ${imagePath}`)}
                              />
                            </div>
                          ) : (
                            <div
                              className="w-full h-24 rounded-t-lg shadow-sm"
                              style={{ backgroundColor: color.hex }}
                            ></div>
                          )}
                          <div className="p-3 text-center">
                            <div className="font-bold text-sm text-gray-900">{color.code}</div>
                            <div className="text-xs text-gray-600 mt-1 truncate" title={color.name}>{color.name}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Color Statistics */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Podsumowanie bazy kolorów</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{ralColors.length}</div>
                      <div className="text-sm font-medium text-gray-900">Kolorów RAL</div>
                      <div className="text-xs text-gray-600">Żywice epoksydowe i poliuretanowe</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-3xl font-bold text-green-600 mb-2">{sandColors.length}</div>
                      <div className="text-sm font-medium text-gray-900">Piasków kwarcowych</div>
                      <div className="text-xs text-gray-600">MIX M01-M16 z wzornikami</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{chipsColors.length}</div>
                      <div className="text-sm font-medium text-gray-900">Chips dekoracyjnych</div>
                      <div className="text-xs text-gray-600">01-21 z wzornikami</div>
                    </div>
                  </div>
                  <div className="text-center mt-6">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      Razem: {ralColors.length + sandColors.length + chipsColors.length} kolorów
                    </div>
                    <div className="text-sm text-gray-600">
                      Wszystkie kolory są dostępne w wycenach szczegółowych
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="space-y-8">
                {/* Preview Controls */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Podgląd kompozycji dla klienta</h3>

                  {selectedRalColors.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center shadow-lg">
                        <span className="text-3xl">🎨</span>
                      </div>
                      <p className="text-gray-600 text-lg">
                        Wybierz kolory w zakładce "Baza kolorów", aby zobaczyć podgląd kompozycji
                      </p>
                      <button
                        onClick={() => setActiveTab('database')}
                        className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Przejdź do wyboru kolorów
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Composition Info Panel */}
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
                        <div className="text-center mb-6">
                          <h4 className="text-2xl font-bold text-gray-900 mb-2">Kompozycja kolorów</h4>
                          <p className="text-gray-600">Profesjonalny podgląd dla klienta</p>
                        </div>

                        {/* Color Palette Display */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* RAL Colors Panel */}
                          {selectedRalColors.length > 0 && (
                            <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm">
                              <h5 className="text-lg font-bold text-blue-900 mb-4 text-center">Żywice RAL</h5>
                              <div className="space-y-3">
                                {selectedRalColors.map((color, index) => (
                                  <div key={color.code} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <div
                                      className="w-8 h-8 rounded-full shadow-sm border-2 border-white"
                                      style={{ backgroundColor: color.hex }}
                                    ></div>
                                    <div className="flex-1">
                                      <div className="font-bold text-sm text-gray-900">{color.code}</div>
                                      <div className="text-xs text-gray-600">{color.name}</div>
                                    </div>
                                    <div className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                      Żywica {index + 1}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sand Colors Panel */}
                          {selectedSandColors.length > 0 && (
                            <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm">
                              <h5 className="text-lg font-bold text-green-900 mb-4 text-center">Piasek kwarcowy</h5>
                              <div className="space-y-3">
                                {selectedSandColors.map((color, index) => (
                                  <div key={color.code} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                    <div
                                      className="w-8 h-8 rounded-full shadow-sm border-2 border-white"
                                      style={{ backgroundColor: color.hex }}
                                    ></div>
                                    <div className="flex-1">
                                      <div className="font-bold text-sm text-gray-900">{color.code}</div>
                                      <div className="text-xs text-gray-600">{color.name}</div>
                                    </div>
                                    <div className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                      Piasek {index + 1}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Chips Colors Panel */}
                          {selectedChipsColors.length > 0 && (
                            <div className="bg-white p-6 rounded-lg border border-purple-200 shadow-sm">
                              <h5 className="text-lg font-bold text-purple-900 mb-4 text-center">Chips dekoracyjne</h5>
                              <div className="space-y-3">
                                {selectedChipsColors.map((color, index) => (
                                  <div key={color.code} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                                    <div
                                      className="w-8 h-8 rounded-full shadow-sm border-2 border-white"
                                      style={{ backgroundColor: color.hex }}
                                    ></div>
                                    <div className="flex-1">
                                      <div className="font-bold text-sm text-gray-900">{color.code}</div>
                                      <div className="text-xs text-gray-600">{color.name}</div>
                                    </div>
                                    <div className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded">
                                      Chips {index + 1}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Visual Floor Preview */}
                      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Podgląd wizualny</h4>

                        {/* Floor Surface Simulation */}
                        <div className="relative">
                          <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-inner">
                            {/* Base layer - resin colors */}
                            {selectedRalColors.length > 0 && (
                              <div
                                className="absolute inset-0 opacity-90"
                                style={{
                                  background: `linear-gradient(135deg, ${selectedRalColors.map(c => c.hex).join(', ')})`
                                }}
                              ></div>
                            )}

                            {/* Decorative layer - sand or chips */}
                            {selectedSandColors.length > 0 && (
                              <div className="absolute inset-0">
                                {/* Sand texture overlay */}
                                <div
                                  className="w-full h-full opacity-60 mix-blend-multiply"
                                  style={{
                                    backgroundImage: `radial-gradient(circle at 20% 30%, ${selectedSandColors[0].hex}40 2px, transparent 2px), radial-gradient(circle at 80% 70%, ${selectedSandColors[0].hex}40 1px, transparent 1px)`,
                                    backgroundSize: '30px 30px, 20px 20px'
                                  }}
                                ></div>
                              </div>
                            )}

                            {selectedChipsColors.length > 0 && (
                              <div className="absolute inset-0">
                                {/* Chips texture overlay */}
                                {selectedChipsColors.map((color, index) => (
                                  <div
                                    key={color.code}
                                    className="absolute"
                                    style={{
                                      left: `${15 + index * 20}%`,
                                      top: `${20 + (index % 2) * 30}%`,
                                      width: '8px',
                                      height: '8px',
                                      backgroundColor: color.hex,
                                      borderRadius: '50%',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                  ></div>
                                ))}
                              </div>
                            )}

                            {/* Overlay for better text visibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                            {/* Info overlay */}
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                                <div className="text-sm font-medium text-gray-900 mb-1">Kompozycja podłogowa</div>
                                <div className="text-xs text-gray-600">
                                  {selectedRalColors.length} kolor{selectedRalColors.length !== 1 ? 'y' : ''} żywicy •
                                  {selectedSandColors.length > 0 ? ` ${selectedSandColors.length} kolor${selectedSandColors.length !== 1 ? 'y' : ''} piasku` : ''}
                                  {selectedChipsColors.length > 0 ? ` ${selectedChipsColors.length} kolor${selectedChipsColors.length !== 1 ? 'y' : ''} chips` : ''}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Technical Details Panel */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Szczegóły techniczne</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-bold text-gray-900 mb-2">Skład kompozycji:</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Żywice RAL:</span>
                                  <span className="font-medium text-blue-700">{selectedRalColors.length} kolor{selectedRalColors.length !== 1 ? 'y' : ''}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Efekt dekoracyjny:</span>
                                  <span className="font-medium text-green-700">
                                    {selectedSandColors.length > 0 ? 'Piasek kwarcowy' : 'Chips dekoracyjne'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Kolory dodatkowe:</span>
                                  <span className="font-medium text-purple-700">
                                    {selectedSandColors.length > 0
                                      ? `${selectedSandColors.length} kolor${selectedSandColors.length !== 1 ? 'y' : ''} piasku`
                                      : `${selectedChipsColors.length} kolor${selectedChipsColors.length !== 1 ? 'y' : ''} chips`
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h5 className="font-bold text-gray-900 mb-2">Zastosowanie:</h5>
                              <div className="text-sm text-gray-600">
                                Kompozycja nadaje się do stosowania w pomieszczeniach mieszkalnych i komercyjnych.
                                Zapewnia wysoką odporność na ścieranie i łatwe utrzymanie w czystości.
                              </div>
                            </div>

                            <div>
                              <h5 className="font-bold text-gray-900 mb-2">Cechy:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Odporna na UV</span>
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Łatwa pielęgnacja</span>
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Antypoślizgowa</span>
                                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Trwała</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => setActiveTab('database')}
                          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                        >
                          Modyfikuj kolory
                        </button>
                        <button
                          onClick={() => {
                            // Here you could implement saving the composition or generating a PDF
                            alert('Funkcja zapisywania kompozycji w przygotowaniu!')
                          }}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                        >
                          Zapisz kompozycję
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Preview Modal - Completely Redesigned */}
        {previewComposition && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-8 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl text-white">🎨</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800 mb-2">{previewComposition.name}</h2>
                      <p className="text-slate-600 text-lg">Szczegółowy podgląd kompozycji kolorów</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          previewComposition.is_active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {previewComposition.is_active ? '✓ Aktywna' : '✗ Nieaktywna'}
                        </span>
                        <span className="text-sm text-slate-500 flex items-center">
                          <span className="mr-1">👥</span>
                          Użyć: {previewComposition.usage_count}
                        </span>
                        <span className="text-sm text-slate-500 flex items-center">
                          <span className="mr-1">📅</span>
                          {new Date(previewComposition.created_at).toLocaleDateString('pl-PL')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewComposition(null)}
                    className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="flex h-[calc(95vh-200px)]">
                {/* Left Panel - Color Composition & Visual Preview */}
                <div className="flex-1 p-8 overflow-y-auto">
                  {/* Color Composition Display - Enhanced */}
                  <div className="mb-10">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                      <span className="mr-3 text-3xl">🎨</span>
                      Skład kompozycji kolorów
                    </h3>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                      {/* RAL Colors Panel - Enhanced */}
                      {previewComposition.resin_colors?.length > 0 && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border-2 border-blue-200 shadow-lg">
                          <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-md">
                              <span className="text-xl text-white">🧪</span>
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-blue-900">Żywice RAL</h4>
                              <p className="text-blue-700 text-sm">Kolory podstawowe</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {previewComposition.resin_colors.map((color, index) => (
                              <div key={color.code} className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-blue-100">
                                <div className="relative">
                                  <div
                                    className="w-14 h-14 rounded-2xl shadow-md border-3 border-white relative overflow-hidden"
                                    style={{ backgroundColor: color.hex }}
                                  >
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                      <span className="text-white text-sm font-bold drop-shadow-lg">
                                        {Math.round(100 / previewComposition.resin_colors.length)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-lg text-slate-900">{color.code}</div>
                                  <div className="text-sm text-slate-600 mb-1">{color.name}</div>
                                  <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full w-fit">
                                    Żywica {index + 1}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sand Colors Panel - Enhanced */}
                      {previewComposition.sand_colors?.length > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-3xl border-2 border-green-200 shadow-lg">
                          <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mr-4 shadow-md">
                              <span className="text-xl text-white">🏜️</span>
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-green-900">Piasek kwarcowy</h4>
                              <p className="text-green-700 text-sm">Efekt dekoracyjny</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {previewComposition.sand_colors.map((color, index) => {
                              const getSandImagePath = (code: string) => {
                                const imageMap: { [key: string]: string } = {
                                  'Piasek kwarcowy M01': '/assets/Piaski/webersys mix PU M_01.jpg',
                                  'Piasek kwarcowy M02': '/assets/Piaski/webersys mix PU M_02.jpg',
                                  'Piasek kwarcowy M03': '/assets/Piaski/webersys mix PU M_03.jpg',
                                  'Piasek kwarcowy M04': '/assets/Piaski/webersys mix PU M_04.jpg',
                                  'Piasek kwarcowy M05': '/assets/Piaski/webersys mix PU M_05.jpg',
                                  'Piasek kwarcowy M06': '/assets/Piaski/webersys mix PU M_06.jpg',
                                  'Piasek kwarcowy M07': '/assets/Piaski/webersys mix PU M_07.jpg',
                                  'Piasek kwarcowy M08': '/assets/Piaski/webersys mix PU M_08.jpg',
                                  'Piasek kwarcowy M09': '/assets/Piaski/webersys mix PU M_09.jpg',
                                  'Piasek kwarcowy M10': '/assets/Piaski/webersys mix PU M_10.jpg',
                                  'Piasek kwarcowy M11': '/assets/Piaski/webersys mix PU M_11.jpg',
                                  'Piasek kwarcowy M12': '/assets/Piaski/webersys mix PU M_12.jpg',
                                  'Piasek kwarcowy M13': '/assets/Piaski/webersys mix PU M_13.jpg',
                                  'Piasek kwarcowy M14': '/assets/Piaski/webersys mix PU M_14.jpg',
                                  'Piasek kwarcowy M15': '/assets/Piaski/webersys mix PU M_15.jpg',
                                  'Piasek kwarcowy M16': '/assets/Piaski/webersys mix PU M_16.jpg',
                                }
                                return imageMap[code] || null
                              }

                              const imagePath = getSandImagePath(color.code)

                              return (
                                <div key={color.code} className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-green-100">
                                  <div className="relative">
                                    {imagePath ? (
                                      <div className="w-14 h-14 rounded-2xl shadow-md border-3 border-white relative overflow-hidden">
                                        <img
                                          src={imagePath}
                                          alt={color.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            const target = e.currentTarget
                                            target.style.display = 'none'
                                            const parent = target.parentElement
                                            if (parent) {
                                              const fallbackDiv = document.createElement('div')
                                              fallbackDiv.className = 'w-full h-full'
                                              fallbackDiv.style.backgroundColor = color.hex
                                              parent.appendChild(fallbackDiv)
                                            }
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div
                                        className="w-14 h-14 rounded-2xl shadow-md border-3 border-white"
                                        style={{ backgroundColor: color.hex }}
                                      ></div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-bold text-lg text-slate-900">{color.code}</div>
                                    <div className="text-sm text-slate-600 mb-1">{color.name}</div>
                                    <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full w-fit">
                                      Piasek {index + 1}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Chips Colors Panel - Enhanced */}
                      {previewComposition.chips_colors?.length > 0 && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-3xl border-2 border-purple-200 shadow-lg">
                          <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mr-4 shadow-md">
                              <span className="text-xl text-white">✨</span>
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-purple-900">Chips dekoracyjne</h4>
                              <p className="text-purple-700 text-sm">Efekt dekoracyjny</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {previewComposition.chips_colors.map((color, index) => {
                              const getChipsImagePath = (code: string) => {
                                const imageMap: { [key: string]: string } = {
                                  'Chips 01': '/assets/Chips/webersys chips_01.jpg',
                                  'Chips 02': '/assets/Chips/webersys chips_02.jpg',
                                  'Chips 03': '/assets/Chips/webersys chips_03.jpg',
                                  'Chips 05': '/assets/Chips/webersys chips_05.jpg',
                                  'Chips 07': '/assets/Chips/webersys chips_07.jpg',
                                  'Chips 08': '/assets/Chips/webersys chips_08.jpg',
                                  'Chips 09': '/assets/Chips/webersys chips_09.jpg',
                                  'Chips 10': '/assets/Chips/webersys chips_10.jpg',
                                  'Chips 11': '/assets/Chips/webersys chips_11.jpg',
                                  'Chips 12': '/assets/Chips/webersys chips_12.jpg',
                                  'Chips 13': '/assets/Chips/webersys chips_13.jpg',
                                  'Chips 16': '/assets/Chips/webersys chips_16.jpg',
                                  'Chips 17': '/assets/Chips/webersys chips_17.jpg',
                                  'Chips 18': '/assets/Chips/webersys chips_18.jpg',
                                  'Chips 19': '/assets/Chips/webersys chips_19.jpg',
                                  'Chips 20': '/assets/Chips/webersys chips_20.jpg',
                                  'Chips 21': '/assets/Chips/webersys chips_21.jpg',
                                }
                                return imageMap[code] || null
                              }

                              const imagePath = getChipsImagePath(color.code)

                              return (
                                <div key={color.code} className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-purple-100">
                                  <div className="relative">
                                    {imagePath ? (
                                      <div className="w-14 h-14 rounded-2xl shadow-md border-3 border-white relative overflow-hidden">
                                        <img
                                          src={imagePath}
                                          alt={color.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            const target = e.currentTarget
                                            target.style.display = 'none'
                                            const parent = target.parentElement
                                            if (parent) {
                                              const fallbackDiv = document.createElement('div')
                                              fallbackDiv.className = 'w-full h-full'
                                              fallbackDiv.style.backgroundColor = color.hex
                                              parent.appendChild(fallbackDiv)
                                            }
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div
                                        className="w-14 h-14 rounded-2xl shadow-md border-3 border-white"
                                        style={{ backgroundColor: color.hex }}
                                      ></div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-bold text-lg text-slate-900">{color.code}</div>
                                    <div className="text-sm text-slate-600 mb-1">{color.name}</div>
                                    <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full w-fit">
                                      Chips {index + 1}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Visual Floor Preview */}
                  <div className="bg-white p-10 rounded-3xl border-2 border-slate-200 shadow-lg">
                    <h4 className="text-2xl font-bold text-slate-800 mb-8 text-center flex items-center justify-center">
                      <span className="mr-3 text-3xl">🏗️</span>
                      Podgląd wizualny posadzki
                    </h4>

                    {/* Large Floor Surface Simulation */}
                    <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl p-8 shadow-inner">
                      <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl overflow-hidden shadow-lg relative">
                        {/* Base layer - resin colors */}
                        {previewComposition.resin_colors?.length > 0 && (
                          <div
                            className="absolute inset-0"
                            style={{
                              background: `linear-gradient(135deg, ${previewComposition.resin_colors.map(c => c.hex).join(', ')})`
                            }}
                          ></div>
                        )}

                        {/* Decorative layer - sand or chips */}
                        {previewComposition.sand_colors?.length > 0 && (
                          <div className="absolute inset-0">
                            {/* Enhanced Sand texture overlay */}
                            <div
                              className="w-full h-full opacity-70 mix-blend-multiply"
                              style={{
                                backgroundImage: `radial-gradient(circle at 25% 25%, ${previewComposition.sand_colors[0].hex}60 3px, transparent 3px), radial-gradient(circle at 75% 75%, ${previewComposition.sand_colors[0].hex}60 2px, transparent 2px), radial-gradient(circle at 50% 10%, ${previewComposition.sand_colors[0].hex}40 1px, transparent 1px)`,
                                backgroundSize: '40px 40px, 30px 30px, 20px 20px'
                              }}
                            ></div>
                          </div>
                        )}

                        {previewComposition.chips_colors?.length > 0 && (
                          <div className="absolute inset-0">
                            {/* Enhanced Chips texture overlay */}
                            {previewComposition.chips_colors.map((color, index) => (
                              <div
                                key={color.code}
                                className="absolute"
                                style={{
                                  left: `${10 + (index * 12)}%`,
                                  top: `${15 + ((index * 7) % 60)}%`,
                                  width: '12px',
                                  height: '12px',
                                  backgroundColor: color.hex,
                                  borderRadius: '50%',
                                  boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
                                  transform: `rotate(${index * 15}deg)`
                                }}
                              ></div>
                            ))}
                          </div>
                        )}

                        {/* Enhanced overlay for better text visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>

                        {/* Enhanced info overlay */}
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="bg-white/98 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-white/30">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-slate-900 mb-3 text-shadow-lg">{previewComposition.name}</div>
                              <div className="text-slate-700 mb-4 text-lg font-medium">
                                Kompozycja podłogowa • {previewComposition.resin_colors?.length || 0} kolor{(previewComposition.resin_colors?.length || 0) !== 1 ? 'ów' : ''} żywicy
                                {previewComposition.sand_colors?.length > 0 ? ` • ${previewComposition.sand_colors.length} kolor${previewComposition.sand_colors.length !== 1 ? 'ów' : ''} piasku` : ''}
                                {previewComposition.chips_colors?.length > 0 ? ` • ${previewComposition.chips_colors.length} kolor${previewComposition.chips_colors.length !== 1 ? 'ów' : ''} chips` : ''}
                              </div>
                              <div className="flex items-center justify-center space-x-6 text-base font-semibold">
                                <span className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                                  <span className="text-blue-600">🧪</span>
                                  <span className="text-blue-800">{previewComposition.resin_type || 'Nie określono'}</span>
                                </span>
                                <span className="flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-lg">
                                  <span className="text-emerald-600">📏</span>
                                  <span className="text-emerald-800">{previewComposition.system_type || 'Nie określono'}</span>
                                </span>
                                <span className="flex items-center space-x-2 bg-violet-50 px-3 py-2 rounded-lg">
                                  <span className="text-violet-600">🏗️</span>
                                  <span className="text-violet-800">{previewComposition.floor_type || 'Nie określono'}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Technical Details & Information */}
                <div className="w-96 bg-gradient-to-b from-slate-50 to-gray-50 border-l border-slate-200 p-8 overflow-y-auto">
                  {/* Technical Specifications */}
                  <div className="mb-10">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                      <span className="mr-3 text-3xl">⚙️</span>
                      Specyfikacja techniczna
                    </h3>

                    <div className="space-y-6">
                      {/* Resin Type */}
                      <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                            <span className="text-white">🧪</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">Rodzaj żywicy</div>
                            <div className="text-sm text-slate-500">Podstawowy składnik</div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-blue-700 bg-blue-50 px-4 py-2 rounded-xl">
                          {previewComposition.resin_type || 'Nie określono'}
                        </div>
                      </div>

                      {/* System Type */}
                      <div className="bg-white p-6 rounded-2xl border-2 border-emerald-200 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mr-3">
                            <span className="text-white">📏</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">Rodzaj systemu</div>
                            <div className="text-sm text-slate-500">Grubość i zastosowanie</div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl">
                          {previewComposition.system_type || 'Nie określono'}
                        </div>
                      </div>

                      {/* Floor Type */}
                      <div className="bg-white p-6 rounded-2xl border-2 border-violet-200 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center mr-3">
                            <span className="text-white">🏗️</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">Rodzaj posadzki</div>
                            <div className="text-sm text-slate-500">Kategoria produktu</div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-violet-700 bg-violet-50 px-4 py-2 rounded-xl">
                          {previewComposition.floor_type || 'Nie określono'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description & Application */}
                  <div className="mb-10">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                      <span className="mr-3 text-3xl">📋</span>
                      Informacje szczegółowe
                    </h3>

                    <div className="space-y-6">
                      {/* Description */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                          <span className="mr-2">📝</span>
                          Opis kompozycji
                        </h4>
                        <p className="text-slate-700 leading-relaxed text-base">
                          {previewComposition.description || 'Brak opisu'}
                        </p>
                      </div>

                      {/* Application */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                          <span className="mr-2">🎯</span>
                          Zastosowanie
                        </h4>
                        <p className="text-slate-700 leading-relaxed text-base">
                          {previewComposition.application || 'Brak informacji o zastosowaniu'}
                        </p>
                      </div>

                      {/* Tags */}
                      {previewComposition.tags.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                            <span className="mr-2">🏷️</span>
                            Tagi
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {previewComposition.tags.map((tag, index) => (
                              <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-medium rounded-full border border-blue-200">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                          <span className="mr-2">✨</span>
                          Cechy produktu
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                            <span className="text-blue-600">☀️</span>
                            <span className="text-sm font-medium text-blue-800">Odporna na UV</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                            <span className="text-green-600">🧽</span>
                            <span className="text-sm font-medium text-green-800">Łatwa pielęgnacja</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                            <span className="text-purple-600">🚫</span>
                            <span className="text-sm font-medium text-purple-800">Antypoślizgowa</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
                            <span className="text-orange-600">💪</span>
                            <span className="text-sm font-medium text-orange-800">Trwała</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="mb-10">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                      <span className="mr-3 text-3xl">📊</span>
                      Statystyki
                    </h3>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center p-4 bg-slate-50 rounded-xl">
                          <div className="text-2xl font-bold text-slate-800 mb-1">{previewComposition.usage_count}</div>
                          <div className="text-sm text-slate-600">Liczba użyć</div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-xl">
                          <div className="text-2xl font-bold text-slate-800 mb-1">
                            {new Date(previewComposition.created_at).toLocaleDateString('pl-PL')}
                          </div>
                          <div className="text-sm text-slate-600">Data utworzenia</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="bg-white p-8 border-t border-slate-200">
                <div className="flex justify-center gap-6">
                  <button
                    onClick={() => {
                      setEditingComposition(previewComposition)
                      setFormData(previewComposition)
                      setSelectedRalColors(previewComposition.resin_colors || [])
                      setSelectedSandColors(previewComposition.sand_colors || [])
                      setSelectedChipsColors(previewComposition.chips_colors || [])
                      setFormData(prev => ({ ...prev, decorative_type: previewComposition.decorative_type }))
                      setShowForm(true)
                      setPreviewComposition(null)
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-3"
                  >
                    <span className="text-xl">✏️</span>
                    <span>Edytuj kompozycję</span>
                  </button>
                  <button
                    onClick={() => {
                      alert('Funkcja generowania PDF w przygotowaniu!')
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-3"
                  >
                    <span className="text-xl">📄</span>
                    <span>Generuj PDF</span>
                  </button>
                  <button
                    onClick={() => setPreviewComposition(null)}
                    className="px-8 py-4 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-3"
                  >
                    <span className="text-xl">❌</span>
                    <span>Zamknij</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingComposition ? 'Edytuj kompozycję' : 'Nowa kompozycja kolorów'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditingComposition(null)
                      setFormData({ name: '', description: '', application: '', is_active: true, decorative_type: 'sand', tags: [] })
                      setSelectedRalColors([])
                      setSelectedSandColors([])
                      setSelectedChipsColors([])
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Nazwa kompozycji *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                      value={formData.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({...formData, is_active: e.target.value === 'active'})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                    >
                      <option value="active">Aktywna</option>
                      <option value="inactive">Nieaktywna</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Opis kompozycji
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                    value={formData.application}
                    onChange={(e) => setFormData({...formData, application: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                    placeholder="np. Garaże, warsztaty, przestrzenie komercyjne"
                  />
                </div>

                {/* Color Selection */}
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-gray-900">Wybierz kolory</h4>

                  {/* RAL Colors Selection */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-300">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-md font-bold text-blue-900">Kolory żywicy (RAL) - max 5</h5>
                      <span className="text-sm font-semibold text-blue-700 bg-white px-3 py-1 rounded-full shadow-sm">
                        {selectedRalColors.length}/5
                      </span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {ralColors.map((color) => {
                        const isSelected = selectedRalColors.some(c => c.code === color.code)
                        return (
                          <div
                            key={color.code}
                            onClick={() => isSelected ? removeRalColor(color.code) : addRalColor(color)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all transform hover:scale-105 ${
                              isSelected
                                ? 'border-blue-500 bg-white shadow-lg ring-2 ring-blue-200'
                                : selectedRalColors.length >= 5
                                ? 'border-gray-200 opacity-50 cursor-not-allowed'
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                            }`}
                          >
                            <div
                              className="w-full h-10 rounded mb-2 shadow-sm"
                              style={{ backgroundColor: color.hex }}
                            ></div>
                            <div className="text-center">
                              <div className="text-xs font-bold text-gray-900 bg-white px-2 py-1 rounded shadow-sm">{color.code}</div>
                              <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded mt-1 truncate">{color.name}</div>
                              {isSelected && (
                                <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded mt-1">✓ Wybrany</div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* System and Resin Type Selection */}
                  <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-10 rounded-3xl border-2 border-slate-200 shadow-lg">
                    <h5 className="text-2xl font-bold text-slate-800 mb-8 flex items-center">
                      <span className="mr-4 text-3xl">⚙️</span>
                      Specyfikacja techniczna
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="space-y-4">
                        <label className="block text-base font-bold text-slate-700 mb-4">
                          Rodzaj żywicy *
                        </label>
                        <select
                          value={formData.resin_type || ''}
                          onChange={(e) => setFormData({...formData, resin_type: e.target.value})}
                          className="w-full px-6 py-5 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-600 bg-white text-slate-800 font-semibold text-lg shadow-sm hover:border-slate-400 transition-all duration-200"
                          required
                        >
                          <option value="">Wybierz rodzaj żywicy</option>
                          <option value="epoxy">🧪 Żywica epoksydowa</option>
                          <option value="polyurethane">🧪 Żywica poliuretanowa</option>
                          <option value="epoxy-polyurethane">🧪 Epoksydowo-poliuretanowa</option>
                          <option value="acrylic">🧪 Żywica akrylowa</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-base font-bold text-slate-700 mb-4">
                          Rodzaj systemu *
                        </label>
                        <select
                          value={formData.system_type || ''}
                          onChange={(e) => setFormData({...formData, system_type: e.target.value})}
                          className="w-full px-6 py-5 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-emerald-500 focus:border-emerald-600 bg-white text-slate-800 font-semibold text-lg shadow-sm hover:border-slate-400 transition-all duration-200"
                          required
                        >
                          <option value="">Wybierz rodzaj systemu</option>
                          <option value="thin-layer">📏 Cienkowarstwowy (0.5-1mm)</option>
                          <option value="self-leveling">📏 Samopoziomujący (1-3mm)</option>
                          <option value="thick-layer">📏 Grubowarstwowy (3-5mm)</option>
                          <option value="decorative">📏 Dekoracyjny</option>
                          <option value="industrial">📏 Przemysłowy</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-base font-bold text-slate-700 mb-4">
                          Rodzaj posadzki *
                        </label>
                        <select
                          value={formData.floor_type || ''}
                          onChange={(e) => setFormData({...formData, floor_type: e.target.value})}
                          className="w-full px-6 py-5 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-violet-500 focus:border-violet-600 bg-white text-slate-800 font-semibold text-lg shadow-sm hover:border-slate-400 transition-all duration-200"
                          required
                        >
                          <option value="">Wybierz rodzaj posadzki</option>
                          <option value="wylewna">🏗️ Wylewna</option>
                          <option value="quartzcolor">🏗️ Quartzcolor</option>
                          <option value="eco">🏗️ Eco</option>
                          <option value="antypoślizgowa">🏗️ Antypoślizgowa</option>
                          <option value="kamienny-dywan">🏗️ Kamienny dywan</option>
                          <option value="mikrocement">🏗️ Mikrocement</option>
                          <option value="epoxy-3d">🏗️ Epoxy 3D</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Effect Selection */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h5 className="text-md font-bold text-gray-900 mb-4">Efekt dekoracyjny (opcjonalny)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, decorative_type: 'none'})}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.decorative_type === 'none'
                            ? 'border-gray-500 bg-gray-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-sm">✕</span>
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-gray-900">Brak efektu</div>
                            <div className="text-sm text-gray-600">Tylko żywice</div>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({...formData, decorative_type: 'sand'})}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.decorative_type === 'sand'
                            ? 'border-green-500 bg-green-50 shadow-lg'
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-200 rounded-full"></div>
                          <div className="text-left">
                            <div className="font-bold text-gray-900">Piasek kwarcowy</div>
                            <div className="text-sm text-gray-600">Efekt piaskowy</div>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({...formData, decorative_type: 'chips'})}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.decorative_type === 'chips'
                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-200 rounded-full"></div>
                          <div className="text-left">
                            <div className="font-bold text-gray-900">Chips dekoracyjne</div>
                            <div className="text-sm text-gray-600">Efekt chips</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Sand Colors Selection (if sand is selected) */}
                  {formData.decorative_type === 'sand' && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-md font-bold text-green-900">Kolory piasku - max 5</h5>
                        <span className="text-sm font-semibold text-green-700 bg-white px-3 py-1 rounded-full shadow-sm">
                          {selectedSandColors.length}/5
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {sandColors.map((color) => {
                          const isSelected = selectedSandColors.some(c => c.code === color.code)

                          // Map color codes to actual image paths for sand in form
                          const getSandImagePath = (code: string) => {
                            const imageMap: { [key: string]: string } = {
                              'Piasek kwarcowy M01': '/assets/Piaski/webersys mix PU M_01.jpg',
                              'Piasek kwarcowy M02': '/assets/Piaski/webersys mix PU M_02.jpg',
                              'Piasek kwarcowy M03': '/assets/Piaski/webersys mix PU M_03.jpg',
                              'Piasek kwarcowy M04': '/assets/Piaski/webersys mix PU M_04.jpg',
                              'Piasek kwarcowy M05': '/assets/Piaski/webersys mix PU M_05.jpg',
                              'Piasek kwarcowy M06': '/assets/Piaski/webersys mix PU M_06.jpg',
                              'Piasek kwarcowy M07': '/assets/Piaski/webersys mix PU M_07.jpg',
                              'Piasek kwarcowy M08': '/assets/Piaski/webersys mix PU M_08.jpg',
                              'Piasek kwarcowy M09': '/assets/Piaski/webersys mix PU M_09.jpg',
                              'Piasek kwarcowy M10': '/assets/Piaski/webersys mix PU M_10.jpg',
                              'Piasek kwarcowy M11': '/assets/Piaski/webersys mix PU M_11.jpg',
                              'Piasek kwarcowy M12': '/assets/Piaski/webersys mix PU M_12.jpg',
                              'Piasek kwarcowy M13': '/assets/Piaski/webersys mix PU M_13.jpg',
                              'Piasek kwarcowy M14': '/assets/Piaski/webersys mix PU M_14.jpg',
                              'Piasek kwarcowy M15': '/assets/Piaski/webersys mix PU M_15.jpg',
                              'Piasek kwarcowy M16': '/assets/Piaski/webersys mix PU M_16.jpg',
                            }
                            return imageMap[code] || null
                          }

                          const imagePath = getSandImagePath(color.code)

                          return (
                            <div
                              key={color.code}
                              onClick={() => isSelected ? removeSandColor(color.code) : addSandColor(color)}
                              className={`group bg-white rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
                                isSelected
                                  ? 'border-green-500 shadow-lg ring-2 ring-green-200'
                                  : selectedSandColors.length >= 5
                                  ? 'border-gray-200 opacity-50 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                              }`}
                            >
                              {imagePath ? (
                                <div className="w-full h-20 rounded-t-lg shadow-sm overflow-hidden bg-gray-100">
                                  <img
                                    src={imagePath}
                                    alt={color.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    onError={(e) => {
                                      console.error(`Failed to load sand image in form: ${imagePath}`)
                                      // Fallback to color if image fails
                                      const target = e.currentTarget
                                      target.style.display = 'none'
                                      const parent = target.parentElement
                                      if (parent) {
                                        const fallbackDiv = document.createElement('div')
                                        fallbackDiv.className = 'w-full h-full'
                                        fallbackDiv.style.backgroundColor = color.hex
                                        parent.appendChild(fallbackDiv)
                                      }
                                    }}
                                    onLoad={() => console.log(`Successfully loaded sand image in form: ${imagePath}`)}
                                  />
                                </div>
                              ) : (
                                <div
                                  className="w-full h-20 rounded-t-lg shadow-sm"
                                  style={{ backgroundColor: color.hex }}
                                ></div>
                              )}
                              <div className="p-3 text-center">
                                <div className="font-bold text-sm text-gray-900">{color.code}</div>
                                <div className="text-xs text-gray-600 mt-1 truncate" title={color.name}>{color.name}</div>
                                {isSelected && (
                                  <div className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded mt-1">✓ Wybrany</div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Chips Colors Selection (if chips is selected) */}
                  {formData.decorative_type === 'chips' && (
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg border-2 border-purple-300">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-md font-bold text-purple-900">Kolory chips - max 5</h5>
                        <span className="text-sm font-semibold text-purple-700 bg-white px-3 py-1 rounded-full shadow-sm">
                          {selectedChipsColors.length}/5
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {chipsColors.map((color) => {
                          const isSelected = selectedChipsColors.some(c => c.code === color.code)

                          // Map color codes to actual image paths for chips in form
                          const getChipsImagePath = (code: string) => {
                            const imageMap: { [key: string]: string } = {
                              'Chips 01': '/assets/Chips/webersys chips_01.jpg',
                              'Chips 02': '/assets/Chips/webersys chips_02.jpg',
                              'Chips 03': '/assets/Chips/webersys chips_03.jpg',
                              'Chips 05': '/assets/Chips/webersys chips_05.jpg',
                              'Chips 07': '/assets/Chips/webersys chips_07.jpg',
                              'Chips 08': '/assets/Chips/webersys chips_08.jpg',
                              'Chips 09': '/assets/Chips/webersys chips_09.jpg',
                              'Chips 10': '/assets/Chips/webersys chips_10.jpg',
                              'Chips 11': '/assets/Chips/webersys chips_11.jpg',
                              'Chips 12': '/assets/Chips/webersys chips_12.jpg',
                              'Chips 13': '/assets/Chips/webersys chips_13.jpg',
                              'Chips 16': '/assets/Chips/webersys chips_16.jpg',
                              'Chips 17': '/assets/Chips/webersys chips_17.jpg',
                              'Chips 18': '/assets/Chips/webersys chips_18.jpg',
                              'Chips 19': '/assets/Chips/webersys chips_19.jpg',
                              'Chips 20': '/assets/Chips/webersys chips_20.jpg',
                              'Chips 21': '/assets/Chips/webersys chips_21.jpg',
                            }
                            return imageMap[code] || null
                          }

                          const imagePath = getChipsImagePath(color.code)

                          return (
                            <div
                              key={color.code}
                              onClick={() => isSelected ? removeChipsColor(color.code) : addChipsColor(color)}
                              className={`group bg-white rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
                                isSelected
                                  ? 'border-purple-500 shadow-lg ring-2 ring-purple-200'
                                  : selectedChipsColors.length >= 5
                                  ? 'border-gray-200 opacity-50 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                              }`}
                            >
                              {imagePath ? (
                                <div className="w-full h-20 rounded-t-lg shadow-sm overflow-hidden bg-gray-100">
                                  <img
                                    src={imagePath}
                                    alt={color.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    onError={(e) => {
                                      console.error(`Failed to load chips image in form: ${imagePath}`)
                                      // Fallback to color if image fails
                                      const target = e.currentTarget
                                      target.style.display = 'none'
                                      const parent = target.parentElement
                                      if (parent) {
                                        const fallbackDiv = document.createElement('div')
                                        fallbackDiv.className = 'w-full h-full'
                                        fallbackDiv.style.backgroundColor = color.hex
                                        parent.appendChild(fallbackDiv)
                                      }
                                    }}
                                    onLoad={() => console.log(`Successfully loaded chips image in form: ${imagePath}`)}
                                  />
                                </div>
                              ) : (
                                <div
                                  className="w-full h-20 rounded-t-lg shadow-sm"
                                  style={{ backgroundColor: color.hex }}
                                ></div>
                              )}
                              <div className="p-3 text-center">
                                <div className="font-bold text-sm text-gray-900">{color.code}</div>
                                <div className="text-xs text-gray-600 mt-1 truncate" title={color.name}>{color.name}</div>
                                {isSelected && (
                                  <div className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded mt-1">✓ Wybrany</div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Colors Summary */}
                {(selectedRalColors.length > 0 || selectedSandColors.length > 0 || selectedChipsColors.length > 0) && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                    <h5 className="text-lg font-bold text-gray-900 mb-4">Wybrane kolory:</h5>
                    <div className="space-y-4">
                      {/* RAL Colors */}
                      {selectedRalColors.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold text-blue-900 mb-2">Żywice RAL ({selectedRalColors.length}/5):</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedRalColors.map((color) => (
                              <div key={color.code} className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
                                <div
                                  className="w-6 h-6 rounded-full shadow-sm"
                                  style={{ backgroundColor: color.hex }}
                                ></div>
                                <span className="text-xs font-medium text-gray-900">{color.code}</span>
                                <button
                                  onClick={() => removeRalColor(color.code)}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sand Colors */}
                      {selectedSandColors.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold text-green-900 mb-2">Piaski ({selectedSandColors.length}/5):</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedSandColors.map((color) => (
                              <div key={color.code} className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
                                <div
                                  className="w-6 h-6 rounded-full shadow-sm"
                                  style={{ backgroundColor: color.hex }}
                                ></div>
                                <span className="text-xs font-medium text-gray-900">{color.code}</span>
                                <button
                                  onClick={() => removeSandColor(color.code)}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Chips Colors */}
                      {selectedChipsColors.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold text-purple-900 mb-2">Chips ({selectedChipsColors.length}/5):</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedChipsColors.map((color) => (
                              <div key={color.code} className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
                                <div
                                  className="w-6 h-6 rounded-full shadow-sm"
                                  style={{ backgroundColor: color.hex }}
                                ></div>
                                <span className="text-xs font-medium text-gray-900">{color.code}</span>
                                <button
                                  onClick={() => removeChipsColor(color.code)}
                                  className="text-red-500 hover:text-red-700 text-xs"
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
                )}

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    {editingComposition ? 'Aktualizuj kompozycję' : 'Zapisz kompozycję'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingComposition(null)
                      setFormData({ name: '', description: '', application: '', is_active: true, decorative_type: 'sand', tags: [] })
                      setSelectedRalColors([])
                      setSelectedSandColors([])
                      setSelectedChipsColors([])
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
      </div>
    </AdminLayout>
  )
}
