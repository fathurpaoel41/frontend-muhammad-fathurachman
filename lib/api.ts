import axios from 'axios'

export interface Option {
  value: string
  label: string
}

export interface GoodsData {
  id_barang: number
  nama_barang: string
  id_pelabuhan: number
  description: string
  diskon: number
  harga: number
}

let countryCache: Option[] | null = null
let portCache: { [countryId: string]: Option[] } = {}
let goodsCache: { [portId: string]: GoodsData[] } = {}

export async function fetchCountries(): Promise<Option[]> {
  try {
    if (countryCache) return countryCache

    // Add delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 800))

    const res = await axios.get('http://202.157.176.100:3001/negaras')
    
    if (res.status !== 200) {
      throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`)
    }

    if (!res.data || !Array.isArray(res.data)) {
      throw new Error('Data negara tidak valid atau kosong')
    }

    countryCache = res.data.map((item: any) => ({
      value: String(item.id_negara),
      label: item.nama_negara,
    }))
    return countryCache
  } catch (error: any) {
    console.error('Error fetching countries:', error)
    
    if (error.response?.status === 404) {
      throw new Error('Endpoint negara tidak ditemukan')
    } else if (error.response?.status === 500) {
      throw new Error('Server sedang bermasalah, silakan coba lagi nanti')
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Koneksi internet bermasalah')
    } else {
      throw new Error('Gagal memuat data negara: ' + (error.message || 'Error tidak diketahui'))
    }
  }
}

export async function fetchPorts(countryId: string): Promise<Option[]> {
  try {
    if (portCache[countryId]) return portCache[countryId]

    // Add delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 600))

    const filter = encodeURIComponent(JSON.stringify({ where: { id_negara: Number(countryId) } }))
    const res = await axios.get(`http://202.157.176.100:3001/pelabuhans?filter=${filter}`)
    
    if (res.status !== 200) {
      throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`)
    }

    if (!res.data || !Array.isArray(res.data)) {
      throw new Error('Data pelabuhan tidak valid atau kosong')
    }

    portCache[countryId] = res.data.map((item: any) => ({
      value: String(item.id_pelabuhan),
      label: item.nama_pelabuhan,
    }))
    return portCache[countryId]
  } catch (error: any) {
    console.error('Error fetching ports:', error)
    
    if (error.response?.status === 404) {
      throw new Error('Pelabuhan tidak ditemukan untuk negara ini')
    } else if (error.response?.status === 500) {
      throw new Error('Server sedang bermasalah, silakan coba lagi nanti')
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Koneksi internet bermasalah')
    } else {
      throw new Error('Gagal memuat data pelabuhan: ' + (error.message || 'Error tidak diketahui'))
    }
  }
}

export async function fetchGoods(portId: string): Promise<GoodsData[]> {
  try {
    if (goodsCache[portId]) return goodsCache[portId]

    // Add delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500))

    const filter = encodeURIComponent(JSON.stringify({ where: { id_pelabuhan: Number(portId) } }))
    const res = await axios.get(`http://202.157.176.100:3001/barangs?filter=${filter}`)
    
    if (res.status !== 200) {
      throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`)
    }

    if (!res.data || !Array.isArray(res.data)) {
      throw new Error('Data barang tidak valid atau kosong')
    }

    goodsCache[portId] = res.data
    return goodsCache[portId]
  } catch (error: any) {
    console.error('Error fetching goods:', error)
    
    if (error.response?.status === 404) {
      throw new Error('Barang tidak ditemukan untuk pelabuhan ini')
    } else if (error.response?.status === 500) {
      throw new Error('Server sedang bermasalah, silakan coba lagi nanti')
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Koneksi internet bermasalah')
    } else {
      throw new Error('Gagal memuat data barang: ' + (error.message || 'Error tidak diketahui'))
    }
  }
}