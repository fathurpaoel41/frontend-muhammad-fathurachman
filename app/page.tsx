'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Select from 'react-select'
import dynamic from 'next/dynamic'
import { Download, Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import { generatePDF } from '@/lib/pdf-generator'
import { formatCurrency, parseCurrency } from '@/lib/currency'
import { fetchCountries, fetchPorts, fetchGoods, GoodsData } from '@/lib/api'
import Alert from '@/components/Alert'

// Dynamic imports for React-Select to prevent SSR hydration issues
const AsyncSelect = dynamic(() => import('react-select/async'), { ssr: false })

const formSchema = z.object({
  country: z.object({
    value: z.string(),
    label: z.string(),
  }).nullable().refine((val) => val !== null, {
    message: "Country is required",
  }),
  port: z.object({
    value: z.string(),
    label: z.string(),
  }).nullable().refine((val) => val !== null, {
    message: "Port is required",
  }),
  goods: z.object({
    value: z.string(),
    label: z.string(),
  }).nullable().refine((val) => val !== null, {
    message: "Goods/Items is required",
  }),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
})

type FormData = z.infer<typeof formSchema>

interface Option {
  value: string
  label: string
}

interface PortData {
  id_pelabuhan: string
  nama_pelabuhan: string
  id_negara: string
}

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: '48px',
    borderColor: state.isFocused ? '#3B82F6' : '#E5E7EB',
    borderWidth: '2px',
    borderRadius: '12px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#3B82F6',
    },
    transition: 'all 0.2s ease-in-out',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? '#3B82F6' 
      : state.isFocused 
        ? '#EFF6FF' 
        : 'white',
    color: state.isSelected ? 'white' : '#374151',
    padding: '12px 16px',
    '&:hover': {
      backgroundColor: state.isSelected ? '#3B82F6' : '#EFF6FF',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E5E7EB',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#9CA3AF',
  }),
}

interface AlertState {
  isVisible: boolean
  type: 'success' | 'error' | 'info' | 'warning'
  title?: string
  message: string
}

export default function FormPage() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [portOptions, setPortOptions] = useState<Option[]>([])
  const [goodsOptions, setGoodsOptions] = useState<Option[]>([])
  const [selectedGoodsData, setSelectedGoodsData] = useState<GoodsData | null>(null)
  const [alert, setAlert] = useState<AlertState>({
    isVisible: false,
    type: 'info',
    message: ''
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: undefined,
      port: undefined,
      goods: undefined,
      description: '',
      price: '',
    }
  })

  const watchedPrice = watch('price')
  const watchedGoods = watch('goods')
  const watchedCountry = watch('country')
  const watchedPort = watch('port')

  // Alert helper functions
  const showAlert = (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    setAlert({ isVisible: true, type, message, title })
  }

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isVisible: false }))
  }

  // Handle goods selection and auto-fill form
  useEffect(() => {
    if (watchedGoods?.value && goodsOptions.length > 0) {
      // Find selected goods data from the API
      const fetchGoodsDetails = async () => {
        if (watchedPort?.value) {
          try {
            const goodsData = await fetchGoods(watchedPort.value)
            const selectedGoods = goodsData.find(g => g.id_barang.toString() === watchedGoods.value)
            
            if (selectedGoods) {
              setSelectedGoodsData(selectedGoods)
              
              // Auto-fill form fields
              setValue('description', selectedGoods.description)
              setValue('price', formatCurrency(selectedGoods.harga.toString()))
              
              // Calculate discount and total
              // selectedGoods.diskon is percentage (e.g., 10 = 10%)
              const discountPercentage = selectedGoods.diskon
              const discountAmount = (selectedGoods.harga * discountPercentage) / 100
              const total = selectedGoods.harga - discountAmount
              
              setDiscount(discountPercentage)
              setTotalAmount(total)
            }
          } catch (error: any) {
            console.error('Error fetching goods details:', error)
            showAlert('error', error.message || 'Gagal memuat detail barang', 'Error')
          }
        }
      }
      
      fetchGoodsDetails()
    }
  }, [watchedGoods, watchedPort, setValue, goodsOptions])

  // Fetch ports when country changes
  useEffect(() => {
    const fetchPortsData = async () => {
      if (watchedCountry?.value) {
        try {
          const portsData = await fetchPorts(watchedCountry.value)
          // Check if data needs conversion from API format to react-select format
          let formattedPorts: Option[] = []
          
          if (portsData && portsData.length > 0) {
            // Check if data is already in react-select format (has value/label) or needs conversion
            if (portsData[0].hasOwnProperty('id_pelabuhan')) {
              // Convert from API format to react-select format
              formattedPorts = portsData.map((port: any) => ({
                value: port.id_pelabuhan,
                label: port.nama_pelabuhan
              }))
            } else {
              // Data is already in react-select format
              formattedPorts = portsData as Option[]
            }
          }
          
          setPortOptions(formattedPorts)
          setValue('port', null as any) // reset port selection
        } catch (error: any) {
          console.error('Error fetching ports:', error)
          setPortOptions([])
          showAlert('error', error.message || 'Gagal memuat data pelabuhan', 'Error')
        }
      } else {
        setPortOptions([])
        setValue('port', null as any)
      }
    }
    
    fetchPortsData()
  }, [watchedCountry, setValue])

  // Fetch goods when port changes
  useEffect(() => {
    const fetchGoodsData = async () => {
      if (watchedPort?.value) {
        try {
          const goodsData = await fetchGoods(watchedPort.value)
          
          const formattedGoods = goodsData.map((good) => ({
            value: good.id_barang.toString(),
            label: good.nama_barang
          }))
          
          setGoodsOptions(formattedGoods)
          setValue('goods', null as any) // reset goods selection
          
          // Reset form fields when port changes
          setValue('description', '')
          setValue('price', '')
          setSelectedGoodsData(null)
          setDiscount(0)
          setTotalAmount(0)
        } catch (error: any) {
          console.error('Error fetching goods:', error)
          setGoodsOptions([])
          showAlert('error', error.message || 'Gagal memuat data barang', 'Error')
        }
      } else {
        setGoodsOptions([])
        setValue('goods', null as any)
        setValue('description', '')
        setValue('price', '')
        setSelectedGoodsData(null)
        setDiscount(0)
        setTotalAmount(0)
      }
    }
    
    fetchGoodsData()
  }, [watchedPort, setValue])

  const loadCountryOptions = async (inputValue: string) => {
    try {
      const countries = await fetchCountries()
      if (!inputValue) return countries
      return countries.filter(c =>
        c.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    } catch (error: any) {
      showAlert('error', error.message || 'Gagal memuat data negara', 'Error')
      return []
    }
  }

  const loadPortOptions = async (inputValue: string) => {
    if (!watchedCountry?.value) return []
    
    // Return all port options if no input, otherwise filter by input
    if (!inputValue) {
      return portOptions
    }
    
    return portOptions.filter((port) =>
      port.label.toLowerCase().includes(inputValue.toLowerCase())
    )
  }

  const loadGoodsOptions = useCallback(async (inputValue: string) => {
    if (!watchedPort?.value) return []
    
    // Return all goods options if no input, otherwise filter by input
    if (!inputValue) {
      return goodsOptions
    }
    
    return goodsOptions.filter((good) =>
      good.label.toLowerCase().includes(inputValue.toLowerCase())
    )
  }, [watchedPort, goodsOptions])

  const onSubmit = async (data: FormData) => {
    try {
      setIsGeneratingPDF(true)
      
      // Add delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Type guard to ensure all required fields are not null
      if (!data.country || !data.port || !data.goods) {
        throw new Error('Semua field harus diisi')
      }
      
      const formDataWithCalculations = {
        ...data,
        country: data.country,
        port: data.port,
        goods: data.goods,
        price: selectedGoodsData ? selectedGoodsData.harga : parseCurrency(data.price),
        discount,
        totalAmount,
      }
      
      await generatePDF(formDataWithCalculations)
      showAlert('success', 'PDF berhasil diunduh!', 'Berhasil')
    } catch (error: any) {
      console.error('Error generating PDF:', error)
      showAlert('error', error.message || 'Gagal membuat PDF', 'Error')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleReset = () => {
    try {
      // Reset form values
      setValue('country', null as any)
      setValue('port', null as any)
      setValue('goods', null as any)
      setValue('description', '')
      setValue('price', '')
      
      // Reset state
      setPortOptions([])
      setGoodsOptions([])
      setSelectedGoodsData(null)
      setDiscount(0)
      setTotalAmount(0)
      
      showAlert('success', 'Form berhasil direset!', 'Berhasil')
    } catch (error: any) {
      console.error('Error resetting form:', error)
      showAlert('error', 'Gagal mereset form', 'Error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Alert Component */}
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        autoClose={true}
        duration={5000}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Informasi Transaksi
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Isi form di bawah ini untuk memproses dokumen informasi transaksi
            </p>
          </div>

          {/* Form */}
          <div className="bg-gradient-to-br from-white via-gray-50/30 to-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-8 py-6">
              <h2 className="text-2xl font-semibold text-white">Informasi Transaksi</h2>
              <p className="text-blue-100 mt-2">Silakan isi semua detail yang diperlukan</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
              {/* Location and Goods Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Informasi Transaksi
                </h3>

                {/* Country */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Negara<span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <AsyncSelect
                        {...field}
                        instanceId="country-select"
                        cacheOptions
                        defaultOptions
                        loadOptions={loadCountryOptions}
                        placeholder="Pilih atau cari negara..."
                        styles={customSelectStyles}
                        className={errors.country ? 'border-red-500' : ''}
                        onChange={(option) => {
                          field.onChange(option)
                        }}
                        value={field.value}
                      />
                    )}
                  />
                  {errors.country && (
                    <div className="flex items-center text-red-600 text-sm mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.country.message}
                    </div>
                  )}
                </div>

                {/* Port */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Pelabuhan <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="port"
                    control={control}
                    render={({ field }) => (
                      <AsyncSelect
                        {...field}
                        instanceId="port-select"
                        key={watchedCountry?.value || 'no-country'} // Force re-render when country changes
                        cacheOptions
                        defaultOptions={portOptions} // Use pre-loaded port options
                        loadOptions={loadPortOptions}
                        placeholder={watchedCountry ? "Pilih atau cari pelabuhan..." : "Silakan pilih negara terlebih dahulu"}
                        styles={customSelectStyles}
                        className={errors.port ? 'border-red-500' : ''}
                        isDisabled={!watchedCountry}
                        value={field.value}
                        noOptionsMessage={() => watchedCountry ? "Pelabuhan tidak ditemukan" : "Silakan pilih negara terlebih dahulu"}
                      />
                    )}
                  />
                  {errors.port && (
                    <div className="flex items-center text-red-600 text-sm mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.port.message}
                    </div>
                  )}
                </div>

                {/* Goods/Items */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Barang <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="goods"
                    control={control}
                    render={({ field }) => (
                      <AsyncSelect
                        {...field}
                        instanceId="goods-select"
                        key={watchedPort?.value || 'no-port'} // Force re-render when port changes
                        cacheOptions
                        defaultOptions={goodsOptions} // Use pre-loaded goods options
                        loadOptions={loadGoodsOptions}
                        placeholder={watchedPort ? "Pilih atau cari barang..." : "Silakan pilih pelabuhan terlebih dahulu"}
                        styles={customSelectStyles}
                        className={errors.goods ? 'border-red-500' : ''}
                        isDisabled={!watchedPort}
                        value={field.value}
                        noOptionsMessage={() => watchedPort ? "Tidak ada barang yang ditemukan" : "Silakan pilih pelabuhan terlebih dahulu"}
                        onChange={(option) => {
                          field.onChange(option)
                        }}
                      />
                    )}
                  />
                  {errors.goods && (
                    <div className="flex items-center text-red-600 text-sm mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.goods.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Deskripsi
                </h3>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Deskripsi akan otomatis"
                    readOnly
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <div className="flex items-center text-red-600 text-sm mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Calculations Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Perhitungan
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Discount */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Diskon
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        %
                      </span>
                      <input
                        type="text"
                        value={discount.toString()}
                        readOnly
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Harga <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        Rp
                      </span>
                      <input
                        {...register('price')}
                        type="text"
                        placeholder="Harga akan otomatis terisi"
                        readOnly
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.price && (
                      <div className="flex items-center text-red-600 text-sm mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.price.message}
                      </div>
                    )}
                  </div>
                </div>
                {/* Total Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Total
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={formatCurrency(totalAmount.toString())}
                      readOnly
                      className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-xl text-green-800 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200 space-y-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isGeneratingPDF}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-teal-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Membuat PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Unduh PDF</span>
                    </>
                  )}
                </button>
                
                {/* Reset Button */}
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting || isGeneratingPDF}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Reset Form</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full mb-3">
                  <span className="text-white font-bold text-lg">MF</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">
                Created by
              </p>
              <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Muhammad Fathurachman
              </p>
              <p className="text-xs text-gray-500 mt-2">
                © Test Front End PT. Amar Mulia Bersama
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}