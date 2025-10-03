'use client'

import { useState, useEffect } from 'react'
import MainLayout from '../components/MainLayout'

interface Color {
  id?: string
  code: string
  name: string
  hex: string
  category: string
  imagePath?: string
  manufacturer?: string
  productType?: string
}

interface ColorComposition {
  id: string
  name: string
  description?: string
  is_featured: boolean
  is_active: boolean
  status: string
  sort_order: number
  composition_colors: Array<{
    color_code: string
    color_name: string
    color_hex: string
    percentage: number
  }>
}

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([])
  const [filteredColors, setFilteredColors] = useState<Color[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRalCategory, setSelectedRalCategory] = useState<string>('all')
  const [mainCategory, setMainCategory] = useState<string>('all') // Track main category (all, ral-colors, manufacturer-filter)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [compositions, setCompositions] = useState<ColorComposition[]>([])
  const [loadingCompositions, setLoadingCompositions] = useState(true)
  const [currentView, setCurrentView] = useState<'colors' | 'compositions' | 'mixing'>('colors')
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all')
  const [showNotebook, setShowNotebook] = useState(false)
  const [notebookItems, setNotebookItems] = useState<Array<{
    id: string
    type: 'color' | 'composition'
    name: string
    code?: string
    hex?: string
    description?: string
    compositionColors?: Array<{color_code: string, color_name: string, percentage: number}>
    addedAt: string
  }>>([])

  useEffect(() => {
    loadColors()
    loadCompositions()
  }, [])

  const loadColors = async () => {
    try {
      const response = await fetch('/api/colors')
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded colors:', data.length, 'items')
        setColors(data)
        setFilteredColors(data)
      } else {
        console.error('Failed to load colors from API:', response.status, response.statusText)
        setColors([])
        setFilteredColors([])
      }
    } catch (error) {
      console.error('Error loading colors:', error)
      setColors([])
      setFilteredColors([])
    }
    setLoading(false)
  }

  const loadCompositions = async () => {
    try {
      setLoadingCompositions(true)
      const response = await fetch('/api/color-compositions')
      if (response.ok) {
        const data = await response.json()
        setCompositions(data.compositions || [])
      } else {
        console.error('Failed to load compositions')
        setCompositions([])
      }
    } catch (error) {
      console.error('Error loading compositions:', error)
      setCompositions([])
    }
    setLoadingCompositions(false)
  }

  useEffect(() => {
    let filtered = colors

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'ral-colors') {
        // Show all RAL colors when main RAL category is selected
        filtered = filtered.filter((color: Color) => color.category.startsWith('ral-'))
      } else if (selectedCategory === 'manufacturer-filter') {
        // Filter by Weber products (sand and chips categories)
        if (selectedManufacturer === 'weber') {
          filtered = filtered.filter((color: Color) => color.category === 'sand' || color.category === 'chips')
        }
      } else if (selectedCategory === 'quartz-sand') {
        filtered = filtered.filter((color: Color) => color.category === 'sand')
      } else if (selectedCategory === 'decorative-chips') {
        filtered = filtered.filter((color: Color) => color.category === 'chips')
      } else if (selectedCategory.startsWith('ral-')) {
        // Handle specific RAL color categories - show only that category
        filtered = filtered.filter((color: Color) => color.category === selectedCategory)
      } else {
        filtered = filtered.filter((color: Color) => color.category === selectedCategory)
      }
    }

    if (searchTerm) {
      filtered = filtered.filter((color: Color) =>
        color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredColors(filtered)
  }, [selectedCategory, selectedManufacturer, searchTerm, colors])

  const getImagePath = (color: Color) => {
    if (color.category === 'sand' && color.imagePath) {
      return `/assets/Piaski/${color.imagePath.split('/').pop()}`
    }
    if (color.category === 'chips' && color.imagePath) {
      return color.imagePath
    }
    return null
  }

  const handleCompositionSelect = (composition: ColorComposition) => {
    // Copy composition details to clipboard
    const compositionText = `Kompozycja: ${composition.name}\n\n${
      composition.description ? `Opis: ${composition.description}\n\n` : ''
    }Skład:\n${
      composition.composition_colors.map(color =>
        `${color.color_code} - ${color.color_name} (${color.percentage}%)`
      ).join('\n')
    }`

    navigator.clipboard.writeText(compositionText).then(() => {
      alert(`Kompozycja "${composition.name}" została skopiowana do schowka!`)
    }).catch(() => {
      alert(`Kompozycja: ${composition.name}\n\n${compositionText}`)
    })
  }

  // Notebook functions
  const addToNotebook = (item: {
    type: 'color' | 'composition'
    name: string
    code?: string
    hex?: string
    description?: string
    compositionColors?: Array<{color_code: string, color_name: string, percentage: number}>
  }) => {
    const newItem = {
      id: Date.now().toString(),
      ...item,
      addedAt: new Date().toLocaleString('pl-PL')
    }
    setNotebookItems(prev => [...prev, newItem])
    setShowNotebook(true)
  }

  const removeFromNotebook = (id: string) => {
    setNotebookItems(prev => prev.filter(item => item.id !== id))
  }

  const exportNotebook = () => {
    const companyInfo = `FIRMA: DiabloStudio
Email: info@diablostudio.pl, biuro@diablostudio.pl
Telefon: +48 123 456 789
Lokalizacja: Warszawa
Strona: www.diablostudio.pl

`

    const notebookText = notebookItems.map((item, index) => {
      if (item.type === 'color') {
        return `${index + 1}. KOLOR: ${item.name} (${item.code})\n   HEX: ${item.hex}\n   Dodano: ${item.addedAt}\n`
      } else {
        return `${index + 1}. KOMPOZYCJA: ${item.name}\n   ${item.description || ''}\n   Skład:\n   ${item.compositionColors?.map(c => `   - ${c.color_code}: ${c.color_name} (${c.percentage}%)`).join('\n') || ''}\n   Dodano: ${item.addedAt}\n`
      }
    }).join('\n')

    const blob = new Blob([`NOTATNIK PALETY KOLORÓW DIABLOSTUDIO
Data eksportu: ${new Date().toLocaleString('pl-PL')}

${companyInfo}
ZAWARTOŚĆ NOTATNIKA:
${notebookText}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notatnik-kolory-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sendNotebook = () => {
    if (notebookItems.length === 0) {
      alert('Notatnik jest pusty!')
      return
    }

    const notebookText = notebookItems.map((item, index) => {
      if (item.type === 'color') {
        return `${index + 1}. KOLOR: ${item.name} (${item.code}) - HEX: ${item.hex}`
      } else {
        return `${index + 1}. KOMPOZYCJA: ${item.name} - ${item.compositionColors?.map(c => `${c.color_code}(${c.percentage}%)`).join(', ')}`
      }
    }).join('\n')

    const subject = encodeURIComponent('Notatnik kolorów z DiabloStudio')
    const body = encodeURIComponent(`Witam,\n\nPrzesyłam zawartość mojego notatnika kolorów:\n\n${notebookText}\n\nPozdrawiam`)

    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  // Separate categories and manufacturers
  const colorCategories = [
    { id: 'all', name: 'Wszystkie kolory', count: colors.length },
    // Main Color Categories
    { id: 'ral-colors', name: '🎨 Kolory RAL', count: colors.filter((c: Color) => c.category.startsWith('ral-')).length },
  ]

  const ralCategories = [
    { id: 'ral-yellow', name: '🟡 RAL - Żółte', count: colors.filter((c: Color) => c.category === 'ral-yellow').length },
    { id: 'ral-orange', name: '🟠 RAL - Pomarańczowe', count: colors.filter((c: Color) => c.category === 'ral-orange').length },
    { id: 'ral-red', name: '🔴 RAL - Czerwone', count: colors.filter((c: Color) => c.category === 'ral-red').length },
    { id: 'ral-violet', name: '🟣 RAL - Fioletowe', count: colors.filter((c: Color) => c.category === 'ral-violet').length },
    { id: 'ral-blue', name: '🔵 RAL - Niebieskie', count: colors.filter((c: Color) => c.category === 'ral-blue').length },
    { id: 'ral-green', name: '🟢 RAL - Zielone', count: colors.filter((c: Color) => c.category === 'ral-green').length },
    { id: 'ral-grey', name: '⚫ RAL - Szare i beże', count: colors.filter((c: Color) => c.category === 'ral-grey').length },
    { id: 'ral-white', name: '⚪ RAL - Białe i kremy', count: colors.filter((c: Color) => c.category === 'ral-white').length },
    { id: 'ral-black', name: '🖤 RAL - Czarne', count: colors.filter((c: Color) => c.category === 'ral-black').length },
  ]

  const manufacturers = [
    { id: 'all', name: 'Wszyscy producenci', count: colors.filter((c: Color) => c.category === 'sand' || c.category === 'chips').length },
    { id: 'weber', name: '🏭 Weber', count: colors.filter((c: Color) => c.category === 'sand' || c.category === 'chips').length },
  ]

  const weberProductTypes = [
    { id: 'quartz-sand', name: '🏔️ Piasek kwarcowy', count: colors.filter((c: Color) => c.category === 'sand').length },
    { id: 'decorative-chips', name: '💎 Chipsy dekoracyjne', count: colors.filter((c: Color) => c.category === 'chips').length },
  ]

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie palety kolorów...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Simplified Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="inline-block p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mr-3">
                <span className="text-3xl">🎨</span>
              </div>
              {/* Notebook Button */}
              <button
                onClick={() => setShowNotebook(!showNotebook)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 flex items-center gap-2 ${
                  showNotebook
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <span>📝</span>
                Notatnik ({notebookItems.length})
              </button>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Paleta kolorów DiabloStudio
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Wybierz idealny kolor dla swojej posadzki żywicznej z naszej bogatej palety RAL,
              skorzystaj z gotowych kompozycji lub stwórz własną mieszankę produktów.
            </p>
          </div>

          {/* Navigation Tabs - Simplified */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-xl shadow-sm border p-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentView('colors')}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                    currentView === 'colors'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🎨 Paleta kolorów
                </button>
                <button
                  onClick={() => setCurrentView('compositions')}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                    currentView === 'compositions'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🏆 Gotowe kompozycje
                </button>
                <button
                  onClick={() => setCurrentView('mixing')}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                    currentView === 'mixing'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ⚗️ Mieszanie kolorów
                </button>
              </div>
            </div>
          </div>

          {/* Colors View */}
          {currentView === 'colors' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Sidebar - Categories */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Kategorie</h2>

                  {/* Search */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wyszukaj kolor
                    </label>
                    <input
                      type="text"
                      placeholder="Wpisz nazwę lub kod..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white placeholder-gray-500"
                    />
                  </div>

                  {/* Color Categories */}
                  <div className="mb-8">
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Kolory</h3>
                    <div className="space-y-2">
                      {colorCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {category.name} ({category.count})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* RAL Color Subcategories */}
                  {(selectedCategory === 'ral-colors' || selectedCategory.startsWith('ral-')) && (
                    <div className="mb-8">
                      <h3 className="text-md font-semibold text-gray-900 mb-3">Odcienie RAL</h3>
                      <div className="space-y-2">
                        {ralCategories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedCategory === category.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {category.name} ({category.count})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manufacturers */}
                  <div className="mb-8">
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Producenci</h3>
                    <div className="space-y-2">
                      {manufacturers.map((manufacturer) => (
                        <button
                          key={manufacturer.id}
                          onClick={() => {
                            setSelectedManufacturer(manufacturer.id)
                            setSelectedCategory('manufacturer-filter')
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedManufacturer === manufacturer.id
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {manufacturer.name} ({manufacturer.count})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weber Product Types */}
                  {selectedManufacturer === 'weber' && (
                    <div className="mb-8">
                      <h3 className="text-md font-semibold text-gray-900 mb-3">Produkty Weber</h3>
                      <div className="space-y-2">
                        {weberProductTypes.map((productType) => (
                          <button
                            key={productType.id}
                            onClick={() => setSelectedCategory(productType.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedCategory === productType.id
                                ? 'bg-amber-600 text-white'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {productType.name} ({productType.count})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Center Content - Colors */}
              <div className="lg:col-span-3">
                {/* Color Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredColors.map((color) => {
                    const imagePath = getImagePath(color)

                    return (
                      <div
                        key={color.code}
                        className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="relative">
                          {imagePath ? (
                            <div className="h-32 bg-gray-100 rounded-t-lg overflow-hidden">
                              <img
                                src={imagePath}
                                alt={color.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to color swatch if image fails to load
                                  const target = e.currentTarget
                                  const parent = target.parentElement
                                  if (parent) {
                                    target.style.display = 'none'
                                    const fallbackDiv = document.createElement('div')
                                    fallbackDiv.className = 'h-full w-full'
                                    fallbackDiv.style.backgroundColor = color.hex
                                    parent.appendChild(fallbackDiv)
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="h-32 rounded-t-lg border-b"
                              style={{ backgroundColor: color.hex }}
                            />
                          )}
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-gray-900">
                              {color.code}
                            </div>
                            <button
                              onClick={() => addToNotebook({
                                type: 'color',
                                name: color.name,
                                code: color.code,
                                hex: color.hex
                              })}
                              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                              title="Dodaj do notatnika"
                            >
                              + 📝
                            </button>
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {color.name}
                          </div>
                          {(color.category.startsWith('ral-') || color.category === 'ral') && (
                            <div className="text-xs font-mono bg-gray-100 p-2 rounded text-gray-900 border">
                              {color.hex}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* No Results */}
                {filteredColors.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🎨</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nie znaleziono kolorów
                    </h3>
                    <p className="text-gray-600">
                      Spróbuj zmienić kryteria wyszukiwania lub kategorię.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compositions View */}
          {currentView === 'compositions' && (
            <div className="py-16">
              <div className="text-center mb-16">
                <div className="inline-block p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full mb-6">
                  <span className="text-4xl">🏆</span>
                </div>
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-800 to-indigo-800 bg-clip-text text-transparent">
                  Gotowe kompozycje kolorów
                </h2>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Wybierz jedną z naszych sprawdzonych kompozycji kolorów stworzonych przez ekspertów.
                  Każda kompozycja została starannie dobrana i przetestowana w praktyce.
                </p>
              </div>

              {loadingCompositions ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Ładowanie kompozycji...</p>
                  </div>
                </div>
              ) : compositions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {compositions.map((composition) => (
                    <div key={composition.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{composition.name}</h3>
                          {composition.is_featured && (
                            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              ⭐ Polecana
                            </span>
                          )}
                        </div>

                        {composition.description && (
                          <p className="text-gray-600 text-sm mb-4">{composition.description}</p>
                        )}

                        {/* Color Preview */}
                        <div className="mb-4">
                          <div className="h-20 rounded-lg overflow-hidden border">
                            <div className="h-full flex">
                              {composition.composition_colors.map((color, index) => (
                                <div
                                  key={index}
                                  className="flex-1 h-full"
                                  style={{ backgroundColor: color.color_hex }}
                                  title={`${color.color_name} (${color.percentage}%)`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Color Details */}
                        <div className="space-y-2 mb-4">
                          {composition.composition_colors.map((color, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded border"
                                  style={{ backgroundColor: color.color_hex }}
                                />
                                <span className="text-gray-700">{color.color_name}</span>
                              </div>
                              <span className="font-medium text-gray-900">{color.percentage}%</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCompositionSelect(composition)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                          >
                            Wybierz tę kompozycję
                          </button>
                          <button
                            onClick={() => addToNotebook({
                              type: 'composition',
                              name: composition.name,
                              description: composition.description,
                              compositionColors: composition.composition_colors.map(c => ({
                                color_code: c.color_code,
                                color_name: c.color_name,
                                percentage: c.percentage
                              }))
                            })}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded-lg text-sm transition-colors"
                            title="Dodaj do notatnika"
                          >
                            + 📝
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-6">🎨</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Brak gotowych kompozycji
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Aktualnie nie mamy gotowych kompozycji kolorów, ale możesz stworzyć swoją własną mieszankę.
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Skontaktuj się z nami
                    <span className="ml-2">📞</span>
                  </a>
                </div>
              )}
            </div>
          )}

              {/* Color Mixing View */}
          {currentView === 'mixing' && (
            <div className="py-16">
              <div className="text-center mb-16">
                <div className="inline-block p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6">
                  <span className="text-4xl">⚗️</span>
                </div>
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-800 to-emerald-800 bg-clip-text text-transparent">
                  System mieszania kolorów
                </h2>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Poznaj nasze trzy niezależne systemy kolorów, które możesz łączyć w unikalne kompozycje.
                  Stwórz indywidualną mieszankę dostosowaną do Twoich potrzeb.
                </p>
              </div>





              {/* Custom Order Section */}
              <div className="mb-16">
                <div className="text-center mb-12">
                  <div className="inline-block p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
                    <span className="text-4xl">🎨</span>
                  </div>
                  <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Indywidualne zamówienia kolorów
                  </h3>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Stwórz unikalne produkty dostosowane do Twoich potrzeb i wizji projektowej.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg mb-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">
                    Piaski kwarcowe na indywidualne zamówienie
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        🏔️ Indywidualny kolor piasku
                      </h5>
                      <p className="text-gray-600 mb-4">
                        Możemy stworzyć piasek kwarcowy w dowolnym kolorze na podstawie palety RAL.
                        Wybierz swój wymarzony odcień, a my przygotujemy produkt na indywidualne zamówienie.
                      </p>
                      <div className="space-y-2 text-sm text-gray-900 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-600 rounded-full" />
                          <span>Dowolny kolor RAL</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <span>Produkcja na zamówienie</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <span>Próbki przed realizacją</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        ⚗️ Indywidualna mieszanka piasków
                      </h5>
                      <p className="text-gray-600 mb-4">
                        Stwórz unikalną mieszankę piasków kwarcowych według własnego projektu.
                        Połącz różne odcienie w wybranych proporcjach dla uzyskania niepowtarzalnego efektu.
                      </p>
                      <div className="space-y-2 text-sm text-gray-900 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                          <span>Dowolne proporcje</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                          <span>Wielkość zamówienia</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                          <span>Konsultacja z ekspertem</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-700 mb-6 text-lg">
                      Skontaktuj się z nami, aby omówić szczegóły indywidualnego zamówienia piasków kwarcowych.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href="/contact"
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <span>📞</span>
                        Omów indywidualne zamówienie
                      </a>
                      <a
                        href="/valuation"
                        className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <span>📋</span>
                        Zamów wycenę
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Mixing Examples */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Quartz Sands Panel */}
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-amber-500">
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-6xl">🏔️</span>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-amber-100 rounded-xl mr-4 group-hover:bg-amber-200 transition-colors">
                        <span className="text-3xl">🏔️</span>
                      </div>
                      <h3 className="text-2xl font-bold text-amber-900">Zastosowanie piasków kwarcowych</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      Piaski kwarcowe znajdują zastosowanie w różnych branżach i produktach. Stosuje się je
                      w posadzkach żywicznych, tynkach dekoracyjnych, zaprawach murarskich, klejach do płytek,
                      a także w przemyśle szklarskim i ceramicznym.
                    </p>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mb-6 border border-amber-100">
                      <h4 className="font-bold text-amber-800 mb-4 flex items-center">
                        <span className="mr-2">🇵🇱</span>
                        Polski piasek kwarcowy - cechy charakterystyczne
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-semibold text-amber-700 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
                            Wytrzymałość
                          </h5>
                          <ul className="text-amber-600 space-y-1">
                            <li>• Wysoce odporny na UV</li>
                            <li>• Odporny na ścieranie</li>
                            <li>• Obojętny chemicznie</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-amber-700 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
                            Jakość
                          </h5>
                          <ul className="text-amber-600 space-y-1">
                            <li>• Duża sferyczność ziarna</li>
                            <li>• Jednorodność ziarna</li>
                            <li>• Czystość powyżej 99% SiO2</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Example Sand Mix Images */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100 shadow-sm">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="w-24 h-24 rounded-full mx-auto mb-3 border-2 border-amber-200 shadow-md overflow-hidden">
                            <img
                              src="/assets/Piaski/webersys mix PU M_01.jpg"
                              alt="M01"
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                ;(e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block'
                              }}
                            />
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 rounded-full hidden"></div>
                          </div>
                          <div className="text-sm font-semibold text-amber-800">M01</div>
                        </div>
                        <div className="text-center">
                          <div className="w-24 h-24 rounded-full mx-auto mb-3 border-2 border-amber-200 shadow-md overflow-hidden">
                            <img
                              src="/assets/Piaski/webersys mix PU M_05.jpg"
                              alt="M05"
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                ;(e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block'
                              }}
                            />
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 rounded-full hidden"></div>
                          </div>
                          <div className="text-sm font-semibold text-amber-800">M05</div>
                        </div>
                        <div className="text-center">
                          <div className="w-24 h-24 rounded-full mx-auto mb-3 border-2 border-amber-200 shadow-md overflow-hidden">
                            <img
                              src="/assets/Piaski/webersys mix PU M_12.jpg"
                              alt="M12"
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                ;(e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block'
                              }}
                            />
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 rounded-full hidden"></div>
                          </div>
                          <div className="text-sm font-semibold text-amber-800">M12</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Chips Panel */}
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-purple-500">
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-6xl">💎</span>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-purple-100 rounded-xl mr-4 group-hover:bg-purple-200 transition-colors">
                        <span className="text-3xl">💎</span>
                      </div>
                      <h3 className="text-2xl font-bold text-purple-900">Chipsy dekoracyjne jako akcent</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      Chipsy dekoracyjne to kolorowe płatki o różnych kształtach i rozmiarach, które dodają
                      unikalnego charakteru powierzchni. Idealnie nadają się do tworzenia efektów wizualnych
                      w posadzkach żywicznych i tynkach dekoracyjnych.
                    </p>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-purple-100">
                      <h4 className="font-bold text-purple-800 mb-4 flex items-center">
                        <span className="mr-2">✨</span>
                        Zastosowania chipsów dekoracyjnych
                      </h4>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="bg-white bg-opacity-60 p-3 rounded-lg border-l-4 border-purple-400">
                          <h5 className="font-semibold text-purple-700 mb-1 flex items-center">
                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                            Posadzki żywiczne
                          </h5>
                          <p className="text-purple-600 text-xs">Tworzenie unikalnych wzorów i efektów dekoracyjnych</p>
                        </div>
                        <div className="bg-white bg-opacity-60 p-3 rounded-lg border-l-4 border-purple-400">
                          <h5 className="font-semibold text-purple-700 mb-1 flex items-center">
                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                            Tynki dekoracyjne
                          </h5>
                          <p className="text-purple-600 text-xs">Dodanie faktury i koloru ścianom wewnętrznym</p>
                        </div>
                        <div className="bg-white bg-opacity-60 p-3 rounded-lg border-l-4 border-purple-400">
                          <h5 className="font-semibold text-purple-700 mb-1 flex items-center">
                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                            Powierzchnie artystyczne
                          </h5>
                          <p className="text-purple-600 text-xs">Kreowanie niepowtarzalnych efektów wizualnych</p>
                        </div>
                      </div>
                    </div>

                    {/* Example Chips Mix Images */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 shadow-sm">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="w-24 h-24 rounded-full mx-auto mb-3 border-2 border-purple-200 shadow-md overflow-hidden">
                            <img
                              src="/assets/Chips/webersys chips_01.jpg"
                              alt="Chips 01"
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                ;(e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block'
                              }}
                            />
                            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 rounded-full hidden"></div>
                          </div>
                          <div className="text-sm font-semibold text-purple-800">01</div>
                        </div>
                        <div className="text-center">
                          <div className="w-24 h-24 rounded-full mx-auto mb-3 border-2 border-purple-200 shadow-md overflow-hidden">
                            <img
                              src="/assets/Chips/webersys chips_09.jpg"
                              alt="Chips 09"
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                ;(e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block'
                              }}
                            />
                            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 rounded-full hidden"></div>
                          </div>
                          <div className="text-sm font-semibold text-purple-800">09</div>
                        </div>
                        <div className="text-center">
                          <div className="w-24 h-24 rounded-full mx-auto mb-3 border-2 border-purple-200 shadow-md overflow-hidden">
                            <img
                              src="/assets/Chips/webersys chips_16.jpg"
                              alt="Chips 16"
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                ;(e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block'
                              }}
                            />
                            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 rounded-full hidden"></div>
                          </div>
                          <div className="text-sm font-semibold text-purple-800">16</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">
                    Stwórz swoją unikalną mieszankę kolorów!
                  </h3>
                  <p className="text-green-100 mb-6 text-lg">
                    Nasi specjaliści pomogą Ci stworzyć idealną kombinację kolorów,
                    która będzie odpowiadać Twoim indywidualnym potrzebom.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/contact"
                      className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <span>📞</span>
                      Skontaktuj się z nami
                    </a>
                    <a
                      href="/valuation"
                      className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <span>📋</span>
                      Zamów wycenę
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notebook Modal */}
          {showNotebook && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <span>📝</span>
                      Notatnik kolorów ({notebookItems.length})
                    </h2>
                    <button
                      onClick={() => setShowNotebook(false)}
                      className="text-white hover:text-gray-200 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="p-6 max-h-96 overflow-y-auto">
                  {notebookItems.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Notatnik jest pusty
                      </h3>
                      <p className="text-gray-600">
                        Dodaj kolory i kompozycje do notatnika, klikając przycisk + 📝 przy wybranych elementach.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notebookItems.map((item, index) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-gray-500">
                                {index + 1}.
                              </span>
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  {item.type === 'color' ? 'KOLOR' : 'KOMPOZYCJA'}: {item.name}
                                </h4>
                                {item.type === 'color' && item.code && (
                                  <p className="text-sm text-gray-600">
                                    Kod: {item.code} | HEX: {item.hex}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromNotebook(item.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                              title="Usuń z notatnika"
                            >
                              🗑️
                            </button>
                          </div>

                          {item.type === 'composition' && item.compositionColors && (
                            <div className="ml-8">
                              <p className="text-sm text-gray-600 mb-2">
                                Skład mieszanki:
                              </p>
                              <div className="space-y-1">
                                {item.compositionColors.map((color, colorIndex) => (
                                  <div key={colorIndex} className="text-sm text-gray-700">
                                    • {color.color_name} ({color.color_code}) - {color.percentage}%
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-2 text-xs text-gray-500">
                            Dodano: {item.addedAt}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {notebookItems.length > 0 && (
                  <div className="p-6 border-t bg-gray-50">
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={exportNotebook}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <span>📄</span>
                        Eksportuj do pliku
                      </button>
                      <button
                        onClick={sendNotebook}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <span>📧</span>
                        Wyślij e-mailem
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
