'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'

interface ContractorPricing {
  material_costs: {
    resin_types: {
      epoxy_standard: { cost_per_sqm: number, name: string },
      epoxy_premium: { cost_per_sqm: number, name: string },
      pu_standard: { cost_per_sqm: number, name: string },
      pu_premium: { cost_per_sqm: number, name: string }
    },
    decorative_effects: {
      smooth: { cost_per_sqm: number, name: string },
      flakes: { cost_per_sqm: number, name: string },
      marble: { cost_per_sqm: number, name: string },
      textured: { cost_per_sqm: number, name: string },
      transparent: { cost_per_sqm: number, name: string },
      antistatic: { cost_per_sqm: number, name: string }
    },
    additional_materials: {
      primer: { cost_per_sqm: number, name: string },
      hardener: { cost_per_liter: number, name: string },
      flakes_material: { cost_per_kg: number, name: string },
      plastbeton: { cost_per_kg: number, name: string },
      mastic: { cost_per_kg: number, name: string },
      foil: { cost_per_sqm: number, name: string },
      tools: { cost_per_sqm: number, name: string }
    }
  },
  labor_costs: {
    substrate_prep: { cost_per_sqm: number, name: string, description: string },
    defect_repair: { cost_per_sqm: number, name: string, description: string },
    priming: { cost_per_sqm: number, name: string, description: string },
    resin_application: { cost_per_sqm: number, name: string, description: string },
    decoration: { cost_per_sqm: number, name: string, description: string },
    stairs_walls: { cost_per_sqm: number, name: string, description: string }
  },
  additional_costs: {
    transport: { base_cost: number, per_km: number, name: string },
    waste_disposal: { cost_per_kg: number, name: string },
    heating_drying: { cost_per_day: number, name: string },
    line_painting: { cost_per_meter: number, name: string },
    protective_equipment: { cost_per_person: number, name: string },
    ventilation: { cost_per_day: number, name: string }
  },
  schedule_templates: {
    standard: {
      stages: {
        inspection: { duration_days: number, duration_hours: number, critical: boolean },
        preparation: { duration_days: number, duration_hours: number, critical: boolean },
        priming: { duration_days: number, duration_hours: number, critical: boolean },
        application: { duration_days: number, duration_hours: number, critical: boolean },
        decoration: { duration_days: number, duration_hours: number, critical: boolean },
        drying: { duration_days: number, duration_hours: number, critical: boolean },
        final_inspection: { duration_days: number, duration_hours: number, critical: boolean }
      }
    }
  },
  technical_defaults: {
    drying_time_hours: number,
    curing_time_hours: number,
    temperature_range: { min: number, max: number },
    humidity_max: number,
    warranty_years: number
  },
  version: number
}

export default function ContractorPricingPage() {
  const [pricing, setPricing] = useState<ContractorPricing>({
    material_costs: {
      resin_types: {
        epoxy_standard: { cost_per_sqm: 150, name: 'Żywica epoksydowa standard' },
        epoxy_premium: { cost_per_sqm: 250, name: 'Żywica epoksydowa premium' },
        pu_standard: { cost_per_sqm: 180, name: 'Żywica poliuretanowa standard' },
        pu_premium: { cost_per_sqm: 320, name: 'Żywica poliuretanowa premium' }
      },
      decorative_effects: {
        smooth: { cost_per_sqm: 0, name: 'Gładkie' },
        flakes: { cost_per_sqm: 45, name: 'Z płatkami' },
        marble: { cost_per_sqm: 85, name: 'Efekt marmuru' },
        textured: { cost_per_sqm: 35, name: 'Strukturalne' },
        transparent: { cost_per_sqm: 120, name: 'Transparentne' },
        antistatic: { cost_per_sqm: 95, name: 'Antystatyczne' }
      },
      additional_materials: {
        primer: { cost_per_sqm: 25, name: 'Gruntowanie' },
        hardener: { cost_per_liter: 45, name: 'Utwardzacz' },
        flakes_material: { cost_per_kg: 120, name: 'Płatki dekoracyjne' },
        plastbeton: { cost_per_kg: 8, name: 'Plastobeton' },
        mastic: { cost_per_kg: 12, name: 'Mastic' },
        foil: { cost_per_sqm: 5, name: 'Folia ochronna' },
        tools: { cost_per_sqm: 15, name: 'Narzędzia jednorazowe' }
      }
    },
    labor_costs: {
      substrate_prep: { cost_per_sqm: 35, name: 'Przygotowanie podłoża', description: 'Czyszczenie, szlifowanie, naprawy' },
      defect_repair: { cost_per_sqm: 55, name: 'Naprawa ubytków', description: 'Wypełnianie pęknięć i nierówności' },
      priming: { cost_per_sqm: 25, name: 'Gruntowanie', description: 'Aplikacja primera' },
      resin_application: { cost_per_sqm: 65, name: 'Aplikacja żywicy', description: 'Nakładanie warstw żywicy' },
      decoration: { cost_per_sqm: 45, name: 'Dekoracje', description: 'Efekty dekoracyjne i wykończenie' },
      stairs_walls: { cost_per_sqm: 85, name: 'Schody/ściany/cokoły', description: 'Elementy pionowe i schody' }
    },
    additional_costs: {
      transport: { base_cost: 150, per_km: 3, name: 'Transport materiałów' },
      waste_disposal: { cost_per_kg: 2.5, name: 'Wywóz odpadów' },
      heating_drying: { cost_per_day: 200, name: 'Nagrzewnice/osuszanie' },
      line_painting: { cost_per_meter: 12, name: 'Malowanie linii' },
      protective_equipment: { cost_per_person: 50, name: 'Odzież ochronna' },
      ventilation: { cost_per_day: 100, name: 'Wentylacja' }
    },
    schedule_templates: {
      standard: {
        stages: {
          inspection: { duration_days: 1, duration_hours: 2, critical: false },
          preparation: { duration_days: 1, duration_hours: 8, critical: true },
          priming: { duration_days: 1, duration_hours: 4, critical: false },
          application: { duration_days: 2, duration_hours: 16, critical: true },
          decoration: { duration_days: 1, duration_hours: 8, critical: false },
          drying: { duration_days: 3, duration_hours: 0, critical: true },
          final_inspection: { duration_days: 1, duration_hours: 2, critical: false }
        }
      }
    },
    technical_defaults: {
      drying_time_hours: 24,
      curing_time_hours: 72,
      temperature_range: { min: 15, max: 25 },
      humidity_max: 75,
      warranty_years: 5
    },
    version: 1
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('materials')

  const savePricing = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/contractor-pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pricing_data: pricing,
          version: pricing.version
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setPricing(result.pricing_data || result)
        setMessage('✅ Cennik został zapisany!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        setMessage(`❌ ${error.error || 'Błąd podczas zapisywania!'}`)
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error saving pricing:', error)
      setMessage('❌ Błąd podczas zapisywania!')
      setTimeout(() => setMessage(''), 3000)
    }
    setLoading(false)
  }

  const loadPricing = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contractor-pricing')

      if (response.ok) {
        const result = await response.json()
        setPricing(result.pricing_data || result.data || result)
      } else {
        console.error('Error loading pricing:', response.statusText)
        setMessage('❌ Błąd podczas ładowania cennika!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error loading pricing:', error)
      setMessage('❌ Błąd podczas ładowania cennika!')
      setTimeout(() => setMessage(''), 3000)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPricing()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cennik wykonawcy</h1>
            <p className="text-gray-600 mt-1">Definiuj ceny i parametry dla wycen szczegółowych</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadPricing}
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <span className="mr-2">📂</span>
              Załaduj
            </button>
            <button
              onClick={savePricing}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="mr-2">💾</span>
              {loading ? 'Zapisywanie...' : 'Zapisz cennik'}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'materials', name: 'Materiały', icon: '📦' },
                { id: 'labor', name: 'Robocizna', icon: '👷' },
                { id: 'additional', name: 'Dodatkowe', icon: '➕' },
                { id: 'schedule', name: 'Harmonogram', icon: '📅' },
                { id: 'technical', name: 'Parametry', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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
            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div className="space-y-8">
                {/* Resin Types */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Rodzaje żywicy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(pricing.material_costs.resin_types).map(([key, resin]) => (
                      <div key={key} className="p-4 border border-gray-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {resin.name}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={resin.cost_per_sqm}
                            onChange={(e) => setPricing({
                              ...pricing,
                              material_costs: {
                                ...pricing.material_costs,
                                resin_types: {
                                  ...pricing.material_costs.resin_types,
                                  [key]: { ...resin, cost_per_sqm: parseFloat(e.target.value) || 0 }
                                }
                              }
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">zł/m²</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decorative Effects */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Efekty dekoracyjne</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(pricing.material_costs.decorative_effects).map(([key, effect]) => (
                      <div key={key} className="p-4 border border-gray-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {effect.name}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={effect.cost_per_sqm}
                            onChange={(e) => setPricing({
                              ...pricing,
                              material_costs: {
                                ...pricing.material_costs,
                                decorative_effects: {
                                  ...pricing.material_costs.decorative_effects,
                                  [key]: { ...effect, cost_per_sqm: parseFloat(e.target.value) || 0 }
                                }
                              }
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">zł/m²</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Materials */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Materiały dodatkowe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(pricing.material_costs.additional_materials).map(([key, material]) => (
                      <div key={key} className="p-4 border border-gray-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {material.name}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              key === 'hardener' ? (material as any).cost_per_liter :
                              key === 'flakes_material' || key === 'plastbeton' || key === 'mastic' ? (material as any).cost_per_kg :
                              (material as any).cost_per_sqm
                            }
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0
                              if (key === 'hardener') {
                                setPricing({
                                  ...pricing,
                                  material_costs: {
                                    ...pricing.material_costs,
                                    additional_materials: {
                                      ...pricing.material_costs.additional_materials,
                                      [key]: { ...(material as any), cost_per_liter: value }
                                    }
                                  }
                                })
                              } else if (key === 'flakes_material' || key === 'plastbeton' || key === 'mastic') {
                                setPricing({
                                  ...pricing,
                                  material_costs: {
                                    ...pricing.material_costs,
                                    additional_materials: {
                                      ...pricing.material_costs.additional_materials,
                                      [key]: { ...(material as any), cost_per_kg: value }
                                    }
                                  }
                                })
                              } else {
                                setPricing({
                                  ...pricing,
                                  material_costs: {
                                    ...pricing.material_costs,
                                    additional_materials: {
                                      ...pricing.material_costs.additional_materials,
                                      [key]: { ...(material as any), cost_per_sqm: value }
                                    }
                                  }
                                })
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">
                            {key === 'hardener' ? 'zł/l' :
                             key === 'flakes_material' || key === 'plastbeton' || key === 'mastic' ? 'zł/kg' :
                             'zł/m²'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Labor Tab */}
            {activeTab === 'labor' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Koszty robocizny</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(pricing.labor_costs).map(([key, labor]) => (
                    <div key={key} className="p-4 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {labor.name}
                      </label>
                      <div className="mb-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={labor.cost_per_sqm}
                            onChange={(e) => setPricing({
                              ...pricing,
                              labor_costs: {
                                ...pricing.labor_costs,
                                [key]: { ...labor, cost_per_sqm: parseFloat(e.target.value) || 0 }
                              }
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">zł/m²</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{labor.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Costs Tab */}
            {activeTab === 'additional' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Koszty dodatkowe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {pricing.additional_costs.transport.name}
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={pricing.additional_costs.transport.base_cost}
                          onChange={(e) => setPricing({
                            ...pricing,
                            additional_costs: {
                              ...pricing.additional_costs,
                              transport: { ...pricing.additional_costs.transport, base_cost: parseFloat(e.target.value) || 0 }
                            }
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">zł (baza)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={pricing.additional_costs.transport.per_km}
                          onChange={(e) => setPricing({
                            ...pricing,
                            additional_costs: {
                              ...pricing.additional_costs,
                              transport: { ...pricing.additional_costs.transport, per_km: parseFloat(e.target.value) || 0 }
                            }
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">zł/km</span>
                      </div>
                    </div>
                  </div>

                  {Object.entries(pricing.additional_costs).filter(([key]) => key !== 'transport').map(([key, cost]) => (
                    <div key={key} className="p-4 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {cost.name}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={'cost_per_kg' in cost ? cost.cost_per_kg : 'cost_per_day' in cost ? cost.cost_per_day : 'cost_per_meter' in cost ? cost.cost_per_meter : 'base_cost' in cost ? cost.base_cost : 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            setPricing({
                              ...pricing,
                              additional_costs: {
                                ...pricing.additional_costs,
                                [key]: { ...cost, ...('cost_per_kg' in cost ? { cost_per_kg: value } : 'cost_per_day' in cost ? { cost_per_day: value } : 'cost_per_meter' in cost ? { cost_per_meter: value } : { cost_per_person: value }) }
                              }
                            })
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">
                          {key === 'waste_disposal' ? 'zł/kg' :
                           key === 'heating_drying' || key === 'ventilation' ? 'zł/dzień' :
                           key === 'line_painting' ? 'zł/m' :
                           'zł/osoba'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Szablon harmonogramu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(pricing.schedule_templates.standard.stages).map(([key, stage]) => (
                    <div key={key} className="p-4 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {key === 'inspection' ? 'Oględziny' :
                         key === 'preparation' ? 'Przygotowanie' :
                         key === 'priming' ? 'Gruntowanie' :
                         key === 'application' ? 'Aplikacja' :
                         key === 'decoration' ? 'Dekoracje' :
                         key === 'drying' ? 'Schnięcie' :
                         'Odbiór końcowy'}
                        {stage.critical && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Dni</label>
                          <input
                            type="number"
                            min="0"
                            value={stage.duration_days}
                            onChange={(e) => setPricing({
                              ...pricing,
                              schedule_templates: {
                                ...pricing.schedule_templates,
                                standard: {
                                  ...pricing.schedule_templates.standard,
                                  stages: {
                                    ...pricing.schedule_templates.standard.stages,
                                    [key]: { ...stage, duration_days: parseInt(e.target.value) || 0 }
                                  }
                                }
                              }
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Godziny</label>
                          <input
                            type="number"
                            min="0"
                            max="24"
                            value={stage.duration_hours}
                            onChange={(e) => setPricing({
                              ...pricing,
                              schedule_templates: {
                                ...pricing.schedule_templates,
                                standard: {
                                  ...pricing.schedule_templates.standard,
                                  stages: {
                                    ...pricing.schedule_templates.standard.stages,
                                    [key]: { ...stage, duration_hours: parseInt(e.target.value) || 0 }
                                  }
                                }
                              }
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Tab */}
            {activeTab === 'technical' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Parametry techniczne</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Czas schnięcia (godziny)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pricing.technical_defaults.drying_time_hours}
                      onChange={(e) => setPricing({
                        ...pricing,
                        technical_defaults: {
                          ...pricing.technical_defaults,
                          drying_time_hours: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Czas utwardzania (godziny)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pricing.technical_defaults.curing_time_hours}
                      onChange={(e) => setPricing({
                        ...pricing,
                        technical_defaults: {
                          ...pricing.technical_defaults,
                          curing_time_hours: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gwarancja (lata)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pricing.technical_defaults.warranty_years}
                      onChange={(e) => setPricing({
                        ...pricing,
                        technical_defaults: {
                          ...pricing.technical_defaults,
                          warranty_years: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperatura min (°C)
                    </label>
                    <input
                      type="number"
                      value={pricing.technical_defaults.temperature_range.min}
                      onChange={(e) => setPricing({
                        ...pricing,
                        technical_defaults: {
                          ...pricing.technical_defaults,
                          temperature_range: {
                            ...pricing.technical_defaults.temperature_range,
                            min: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperatura max (°C)
                    </label>
                    <input
                      type="number"
                      value={pricing.technical_defaults.temperature_range.max}
                      onChange={(e) => setPricing({
                        ...pricing,
                        technical_defaults: {
                          ...pricing.technical_defaults,
                          temperature_range: {
                            ...pricing.technical_defaults.temperature_range,
                            max: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wilgotność max (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={pricing.technical_defaults.humidity_max}
                      onChange={(e) => setPricing({
                        ...pricing,
                        technical_defaults: {
                          ...pricing.technical_defaults,
                          humidity_max: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Podsumowanie cennika</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(pricing.material_costs.resin_types).length}
              </div>
              <div className="text-sm text-gray-600">Rodzaje żywicy</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(pricing.labor_costs).length}
              </div>
              <div className="text-sm text-gray-600">Kategorii robocizny</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(pricing.additional_costs).length}
              </div>
              <div className="text-sm text-gray-600">Kosztów dodatkowych</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                v{pricing.version}
              </div>
              <div className="text-sm text-gray-600">Wersja cennika</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
