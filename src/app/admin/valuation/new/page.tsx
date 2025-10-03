'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClientComponentClient } from '@/lib/supabase'

const valuationSchema = z.object({
  // Object data
  object_name: z.string().min(1, 'Nazwa obiektu jest wymagana'),
  object_address: z.string().min(1, 'Adres obiektu jest wymagany'),
  owner_name: z.string().min(1, 'Imię właściciela jest wymagane'),
  measurement_date: z.string().min(1, 'Data pomiarów jest wymagana'),

  // Technical parameters
  humidity: z.number().min(0).max(100).optional(),
  temperature: z.number().optional(),
  dew_point: z.number().optional(),

  // Scope of work
  primer_needed: z.boolean(),
  scratch_needed: z.boolean(),
  topcoat_needed: z.boolean(),
  plinths_needed: z.boolean(),
  ground_levelling_needed: z.boolean(),

  // Materials
  resin_type: z.enum(['PU_STANDARD', 'PU_PREMIUM', 'EPOXY']),
  resin_effect: z.enum(['SMOOTH', 'MARBLE']),
  resin_colors: z.number().min(1).max(5),

  // Additional costs
  tools_cost: z.number().min(0),
  discount_percentage: z.number().min(0).max(100),

  // Customer data (if not from quick valuation)
  customer_name: z.string().optional(),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().optional(),
})

type ValuationFormData = z.infer<typeof valuationSchema>

interface Material {
  id: string
  name: string
  type: string
  unit: string
  base_price: number
  premium_price: number | null
}

function NewValuationPageContent() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [quickValuation, setQuickValuation] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ValuationFormData>({
    resolver: zodResolver(valuationSchema),
    defaultValues: {
      primer_needed: false,
      scratch_needed: false,
      topcoat_needed: false,
      plinths_needed: false,
      ground_levelling_needed: false,
      tools_cost: 0,
      discount_percentage: 0,
      resin_colors: 1,
    }
  })

  useEffect(() => {
    loadMaterials()
    loadQuickValuation()
  }, [])

  const loadMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('type', { ascending: true })

    if (error) {
      console.error('Error loading materials:', error)
      return
    }

    setMaterials(data || [])
  }

  const loadQuickValuation = async () => {
    const quickId = searchParams.get('quick')
    if (!quickId) return

    const { data, error } = await supabase
      .from('valuations')
      .select(`
        *,
        customers (
          name,
          email,
          phone
        )
      `)
      .eq('id', quickId)
      .single()

    if (error) {
      console.error('Error loading quick valuation:', error)
      return
    }

    setQuickValuation(data)

    // Pre-fill form with quick valuation data
    setValue('customer_name', data.customers.name)
    setValue('customer_email', data.customers.email)
    setValue('customer_phone', data.customers.phone)
    setValue('resin_type', data.floor_type)
    setValue('resin_effect', data.effect)
    setValue('resin_colors', data.color_count)
  }

  const calculateCosts = (data: ValuationFormData) => {
    // This is a simplified calculation - in real app you'd have more complex logic
    let materialsCost = 0
    let laborCost = 0

    // Base resin cost (assuming 1m² for calculation, will be scaled later)
    const resinPrice = data.resin_type === 'PU_PREMIUM' ? 220 : data.resin_type === 'PU_STANDARD' ? 180 : 160
    materialsCost += resinPrice

    // Effect modifier
    if (data.resin_effect === 'MARBLE') {
      materialsCost += 30
    }

    // Color modifier
    if (data.resin_colors > 1) {
      materialsCost += (data.resin_colors - 1) * 15
    }

    // Additional materials
    if (data.primer_needed) materialsCost += 25
    if (data.topcoat_needed) materialsCost += 45
    if (data.scratch_needed) materialsCost += 20

    // Tools
    materialsCost += data.tools_cost

    // Labor cost (simplified)
    laborCost = materialsCost * 0.3 // 30% of materials cost

    const totalCost = materialsCost + laborCost
    const discountAmount = totalCost * (data.discount_percentage / 100)
    const finalCost = totalCost - discountAmount

    return {
      materials_cost: materialsCost,
      labor_cost: laborCost,
      total_cost: totalCost,
      final_cost: finalCost
    }
  }

  const onSubmit = async (data: ValuationFormData) => {
    setLoading(true)

    try {
      const costs = calculateCosts(data)

      // Create or get customer
      let customerId = quickValuation?.customer_id

      if (!customerId && data.customer_email) {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: data.customer_name,
            email: data.customer_email,
            phone: data.customer_phone || null
          })
          .select()
          .single()

        if (customerError) throw customerError
        customerId = customerData.id
      }

      if (!customerId) {
        throw new Error('Dane klienta są wymagane')
      }

      // Create valuation
      const { data: valuationData, error: valuationError } = await supabase
        .from('admin_valuations')
        .insert({
          customer_id: customerId,
          valuation_id: quickValuation?.id || null,
          object_name: data.object_name,
          object_address: data.object_address,
          owner_name: data.owner_name,
          measurement_date: data.measurement_date,
          humidity: data.humidity || null,
          temperature: data.temperature || null,
          dew_point: data.dew_point || null,
          primer_needed: data.primer_needed,
          scratch_needed: data.scratch_needed,
          topcoat_needed: data.topcoat_needed,
          plinths_needed: data.plinths_needed,
          ground_levelling_needed: data.ground_levelling_needed,
          resin_type: data.resin_type,
          resin_effect: data.resin_effect,
          resin_colors: data.resin_colors,
          tools_cost: data.tools_cost,
          discount_percentage: data.discount_percentage,
          ...costs,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (valuationError) throw valuationError

      router.push(`/admin/valuation/${valuationData.id}`)
    } catch (error: any) {
      console.error('Error creating valuation:', error)
      alert('Wystąpił błąd podczas tworzenia wyceny: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">DiabloStudio</h1>
              <span className="ml-2 text-sm text-gray-500">Nowa Wycena</span>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="btn-secondary"
            >
              Powrót do Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {quickValuation ? 'Szczegółowa Wycena' : 'Nowa Wycena Szczegółowa'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Object Data */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Dane Obiektu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Nazwa obiektu *</label>
                  <input
                    type="text"
                    className="form-input"
                    {...register('object_name')}
                  />
                  {errors.object_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.object_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Data pomiarów *</label>
                  <input
                    type="date"
                    className="form-input"
                    {...register('measurement_date')}
                  />
                  {errors.measurement_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.measurement_date.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Adres obiektu *</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    {...register('object_address')}
                  />
                  {errors.object_address && (
                    <p className="text-red-500 text-sm mt-1">{errors.object_address.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Imię właściciela *</label>
                  <input
                    type="text"
                    className="form-input"
                    {...register('owner_name')}
                  />
                  {errors.owner_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.owner_name.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Technical Parameters */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Parametry Techniczne</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">Wilgotność (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    {...register('humidity', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="form-label">Temperatura (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    {...register('temperature', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="form-label">Punkt rosy (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    {...register('dew_point', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            {/* Scope of Work */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Zakres Prac</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'primer_needed', label: 'Gruntowanie' },
                  { key: 'scratch_needed', label: 'Szpachlowanie' },
                  { key: 'topcoat_needed', label: 'Powloka wierzchnia' },
                  { key: 'plinths_needed', label: 'Cokoły' },
                  { key: 'ground_levelling_needed', label: 'Wyrównanie podłoża' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      {...register(key as keyof ValuationFormData)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Materiały</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">Typ żywicy *</label>
                  <select className="form-input" {...register('resin_type')}>
                    <option value="PU_STANDARD">PU Standard</option>
                    <option value="PU_PREMIUM">PU Premium</option>
                    <option value="EPOXY">Epoksydowa</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Efekt *</label>
                  <select className="form-input" {...register('resin_effect')}>
                    <option value="SMOOTH">Gładka</option>
                    <option value="MARBLE">Marmurowa</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Liczba kolorów *</label>
                  <select className="form-input" {...register('resin_colors', { valueAsNumber: true })}>
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Costs */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Koszty Dodatkowe</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Koszt narzędzi (PLN)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    {...register('tools_cost', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="form-label">Rabat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="form-input"
                    {...register('discount_percentage', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            {/* Customer Data (only if not from quick valuation) */}
            {!quickValuation && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Dane Klienta</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="form-label">Imię i nazwisko</label>
                    <input
                      type="text"
                      className="form-input"
                      {...register('customer_name')}
                    />
                  </div>

                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      {...register('customer_email')}
                    />
                  </div>

                  <div>
                    <label className="form-label">Telefon</label>
                    <input
                      type="tel"
                      className="form-input"
                      {...register('customer_phone')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="btn-secondary"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Tworzenie wyceny...' : 'Utwórz wycenę'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function NewValuationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    }>
      <NewValuationPageContent />
    </Suspense>
  )
}
