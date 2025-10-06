'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'

interface Color {
  id?: string
  code: string
  name: string
  hex: string
  rgb: { r: number, g: number, b: number }
  category: string
  imagePath?: string
}

export default function AdminColorsPage() {
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingColor, setEditingColor] = useState<Color | null>(null)
  const [formData, setFormData] = useState<Color>({
    code: '',
    name: '',
    hex: '#000000',
    rgb: { r: 0, g: 0, b: 0 },
    category: 'yellow'
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  const categories = [
    { id: 'yellow', name: 'Żółte' },
    { id: 'orange', name: 'Pomarańczowe' },
    { id: 'red', name: 'Czerwone' },
    { id: 'violet', name: 'Fioletowe' },
    { id: 'blue', name: 'Niebieskie' },
    { id: 'green', name: 'Zielone' },
    { id: 'grey', name: 'Szare' },
    { id: 'white', name: 'Białe' },
    { id: 'black', name: 'Czarne' },
    { id: 'sand', name: 'Piaski kwarcowe' },
    { id: 'chips', name: 'Dekoracyjne chipsy' }
  ]

  useEffect(() => {
    loadColors()
  }, [])

  const loadColors = async () => {
    try {
      const response = await fetch('/api/colors')
      if (response.ok) {
        const data = await response.json()
        if (data && Array.isArray(data)) {
          setColors(data)
          // Save to localStorage as backup
          localStorage.setItem('ralColors', JSON.stringify(data))
        } else {
          // If API returns empty or invalid data, try to populate with demo data
          await populateDemoColors()
        }
      } else {
        throw new Error('Failed to load from API')
      }
    } catch (error) {
      console.error('Error loading colors:', error)
      // Fallback to localStorage
      const savedColors = localStorage.getItem('ralColors')
      if (savedColors) {
        setColors(JSON.parse(savedColors))
      } else {
        // If no saved colors, populate with demo data
        await populateDemoColors()
      }
    }
    setLoading(false)
  }

  const populateDemoColors = async () => {
    try {
      // Try to load demo data from JSON files
      const demoData = await loadDemoColorData()
      if (demoData && demoData.length > 0) {
        setColors(demoData)
        localStorage.setItem('ralColors', JSON.stringify(demoData))
        setMessage('Wczytano kolory demonstracyjne')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error loading demo colors:', error)
    }
  }

  const loadDemoColorData = async () => {
    try {
      // Try to load from demo data files
      const responses = await Promise.allSettled([
        fetch('/demo-data/colors-ral.json'),
        fetch('/demo-data/colors-sands.json'),
        fetch('/demo-data/colors-chips.json')
      ])

      let allColors: Color[] = []

      for (const response of responses) {
        if (response.status === 'fulfilled' && response.value.ok) {
          const data = await response.value.json()
          if (Array.isArray(data)) {
            allColors = allColors.concat(data)
          }
        }
      }

      return allColors.length > 0 ? allColors : null
    } catch (error) {
      console.error('Error loading demo data:', error)
      return null
    }
  }

  const saveColors = async (updatedColors: Color[]) => {
    try {
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedColors),
      })

      if (response.ok) {
        const result = await response.json()
        localStorage.setItem('ralColors', JSON.stringify(updatedColors))
        setColors(updatedColors)
        setMessage(`✅ ${result.message} (${result.count} kolorów)`)
        setTimeout(() => setMessage(''), 3000)
      } else {
        throw new Error('Failed to save to API')
      }
    } catch (error) {
      console.error('Error saving colors:', error)
      // Fallback to localStorage
      localStorage.setItem('ralColors', JSON.stringify(updatedColors))
      setColors(updatedColors)
      setMessage('Kolory zapisane lokalnie!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.name || !formData.hex) {
      setMessage('Wypełnij wszystkie pola!')
      return
    }

    // Validate hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (!hexRegex.test(formData.hex)) {
      setMessage('Nieprawidłowy format HEX!')
      return
    }

    // Convert hex to RGB
    const hex = formData.hex.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    const newColor: Color = {
      id: editingColor?.id || Date.now().toString(),
      code: formData.code,
      name: formData.name,
      hex: formData.hex,
      rgb: { r, g, b },
      category: formData.category
    }

    let updatedColors: Color[]

    if (editingColor) {
      // Edit existing color
      updatedColors = colors.map(color =>
        color.id === editingColor.id ? newColor : color
      )
      setMessage('Kolor zaktualizowany!')
    } else {
      // Add new color
      updatedColors = [...colors, newColor]
      setMessage('Kolor dodany!')
    }

    await saveColors(updatedColors)

    // Reset form
    setFormData({
      code: '',
      name: '',
      hex: '#000000',
      rgb: { r: 0, g: 0, b: 0 },
      category: 'yellow'
    })
    setImageFile(null)
    setShowAddForm(false)
    setEditingColor(null)

    setTimeout(() => setMessage(''), 3000)
  }

  const handleEdit = (color: Color) => {
    setEditingColor(color)
    setFormData(color)
    setShowAddForm(true)

    // Scroll to top when editing
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleDelete = async (colorId: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten kolor?')) {
      const updatedColors = colors.filter(color => color.id !== colorId)
      await saveColors(updatedColors)
      setMessage('Kolor usunięty!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDeleteColor = async (colorId: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten kolor?')) {
      const updatedColors = colors.filter(color => color.id !== colorId)
      await saveColors(updatedColors)
      setMessage('Kolor usunięty!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingColor(null)
    setFormData({
      code: '',
      name: '',
      hex: '#000000',
      rgb: { r: 0, g: 0, b: 0 },
      category: 'yellow'
    })
    setImageFile(null)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie kolorów...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Zarządzanie Kolorami</h1>
              <p className="text-gray-600 mt-2">Dodawaj, edytuj i zarządzaj paletą kolorów</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              <span>+</span>
              Dodaj Kolor
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}

          {/* Enhanced Add/Edit Form */}
          {showAddForm && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 mb-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl ${
                    editingColor ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-green-500 to-emerald-600'
                  }`}>
                    {editingColor ? '✏️' : '➕'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingColor ? 'Edytuj Kolor' : 'Dodaj Nowy Kolor'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {editingColor ? 'Zmodyfikuj właściwości koloru' : 'Dodaj nowy kolor do palety'}
                    </p>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg mx-auto mb-2"
                      style={{ backgroundColor: formData.hex }}
                    />
                    <p className="text-xs font-mono text-gray-600">{formData.hex}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">📋</span>
                    Podstawowe informacje
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Code */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Kod koloru <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="np. RAL 1000, PU M 01"
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                        required
                      />
                    </div>

                    {/* Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Nazwa koloru <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="np. Signal yellow, Piasek kwarcowy biały"
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                        required
                      />
                    </div>

                    {/* HEX Color */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Kolor HEX <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={formData.hex}
                          onChange={(e) => setFormData({ ...formData, hex: e.target.value })}
                          placeholder="#000000"
                          className="flex-1 px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 text-lg font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                          required
                        />
                        <input
                          type="color"
                          value={formData.hex}
                          onChange={(e) => setFormData({ ...formData, hex: e.target.value })}
                          className="w-16 h-12 border-2 border-gray-300 rounded-xl cursor-pointer shadow-sm hover:border-gray-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Kategoria <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                        required
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id} className="text-gray-900">
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Image Upload Section for Sand/Chips */}
                {(formData.category === 'sand' || formData.category === 'chips') && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-100">
                    <h3 className="text-lg font-bold text-amber-900 mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-sm">📸</span>
                      Zdjęcie produktu
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-amber-800 mb-3">
                          Wybierz zdjęcie koloru
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          className="w-full px-4 py-4 border-2 border-amber-300 rounded-xl bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-400 transition-all duration-200 shadow-sm file:mr-4 file:py-3 file:px-6 file:rounded-l-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-amber-500 file:to-orange-500 file:text-white hover:file:from-amber-600 hover:file:to-orange-600"
                        />
                      </div>

                      <div className="bg-amber-100 rounded-xl p-4 border border-amber-200">
                        <p className="text-sm text-amber-800 font-medium">
                          💡 Wskazówka: Dodaj zdjęcie dla piasków kwarcowych lub chipsów dekoracyjnych, aby klienci mogli lepiej zobaczyć produkt.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-8 border-t-2 border-gray-200">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Anuluj
                    </button>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span> {editingColor ? 'Edycja istniejącego koloru' : 'Dodawanie nowego koloru'}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      editingColor
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                    }`}
                  >
                    {editingColor ? '💾 Aktualizuj Kolor' : '➕ Dodaj Kolor'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Enhanced Colors Table */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b-2 border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg">
                    🎨
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Kolory w palecie
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Zarządzaj wszystkimi kolorami w systemie ({colors.length} kolorów)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{colors.length}</div>
                    <div className="text-sm text-gray-600">łącznie</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <tr>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Podgląd
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Kod
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Nazwa
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Kategoria
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      HEX
                    </th>
                    <th className="px-8 py-5 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {colors.map((color) => (
                    <tr key={color.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-xl border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.imagePath && (
                            <img
                              src={color.imagePath}
                              alt={color.name}
                              className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200 shadow-sm group-hover:scale-110 transition-transform duration-200"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">{color.code}</div>
                        <div className="text-sm text-gray-500 mt-1">Kod produktu</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-lg font-semibold text-gray-900">{color.name}</div>
                        <div className="text-sm text-gray-500 mt-1">Nazwa koloru</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold ${
                          color.category === 'sand' ? 'bg-amber-100 text-amber-800' :
                          color.category === 'chips' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {categories.find(c => c.id === color.category)?.name}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border-2 border-gray-300"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-lg font-mono font-bold text-gray-900">{color.hex}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Wartość HEX</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => color.id && handleDeleteColor(color.id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            🗑️ Usuń
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {colors.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-300 text-8xl mb-6">🎨</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Brak kolorów w palecie
                </h3>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  Zacznij budować swoją paletę kolorów. Dodaj pierwszy kolor używając formularza powyżej.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  ➕ Dodaj Pierwszy Kolor
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
