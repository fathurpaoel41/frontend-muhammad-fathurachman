# Aplikasi Informasi Transaksi
Test frontend Muhammad Fathurachman

Aplikasi Menggunakan Next.js untuk memproses dokumentasi infor masi transaksi dengan kemampuan generasi PDF profesional.

## 🚀 Fitur Utama

### Fungsionalitas Inti
- **Form Dinamis**: Dropdown interaktif untuk Negara, Pelabuhan, dan Barang dengan fungsi pencarian
- **Kalkulasi Otomatis**: Perhitungan diskon dan total otomatis berdasarkan data API
- **Format Mata Uang**: Format Rupiah Indonesia (IDR) dengan pemisah ribuan yang tepat
- **Generasi PDF**: Dokumen PDF profesional dengan layout yang terformat
- **Validasi Form**: Validasi komprehensif dengan pesan error yang user-friendly
- **Alur Berurutan**: User harus memilih secara berurutan: Negara → Pelabuhan → Barang
- **Error Handling**: Sistem penanganan error yang komprehensif dengan pesan dalam bahasa Indonesia
- **Alert System**: Notifikasi real-time untuk sukses/error dengan auto-close
- **Loading States**: Animasi loading untuk semua operasi API dan PDF generation
- **Reset Function**: Tombol reset untuk menghapus semua data form
- **SSR Optimization**: Perbaikan masalah hydration dengan React-Select
- **Professional Footer**: Footer dengan branding yang elegan

### Fitur Teknis
- **Async Data Loading**: Dropdown dengan kemampuan pencarian asinkron
- **Responsive Design**: Pendekatan mobile-first dengan breakpoint yang tepat
- **UI/UX Modern**: Interface bersih dengan animasi halus dan efek hover
- **Error Boundary**: Penanganan error level komponen dengan fallback UI
- **TypeScript**: Dukungan penuh TypeScript untuk type safety
- **Optimized Performance**: Lazy loading dan dynamic imports untuk performa optimal

## 🛠️ Teknologi Yang Digunakan

### Framework & Library Utama
- **Next.js 13.5.1**: React framework untuk production
- **Node 23.11.0**: Versi Node Js
- **TypeScript**: Superset JavaScript dengan type safety
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Library untuk form management
- **Zod**: Schema validation library
- **Axios**: HTTP client untuk API calls

### UI Components & Styling
- **React-Select**: Enhanced dropdown components
- **React-Select/Async**: Async dropdown dengan search (SSR optimized)
- **Lucide React**: Icon library modern
- **Tailwind CSS**: Responsive styling framework
- **Custom Alert Component**: Sistem notifikasi dengan Flowbite-style design

### PDF & Utility
- **jsPDF**: Library untuk generasi PDF
- **Currency Formatting**: Custom utility untuk format mata uang IDR
- **Dynamic Imports**: Optimized loading untuk komponen berat

## 📦 Instalasi

1. Clone repository:
```bash
git clone <repository-url>
cd nextjs-form-app
```

2. Install dependencies:
```bash
npm install
```

3. Jalankan development server:
```bash
npm run dev
```

4. Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🏗️ Struktur Proyek

```
├── app/
│   ├── globals.css          # Style global dan konfigurasi Tailwind
│   ├── layout.tsx           # Layout komponen utama
│   └── page.tsx             # Halaman form utama
├── components/
├   |── UI                   # Kumpulan Component Folder
│   ├── Alert.tsx            # Komponen alert dengan animasi
│   └── ErrorBoundary.tsx    # Error boundary untuk handling crash
├── lib/
│   ├── api.ts              # Fungsi API dengan error handling
│   ├── currency.ts         # Utility format mata uang
│   ├── pdf-generator.ts    # Logic generasi PDF
│   └── utils.ts            # Fungsi utility
├── components.json         # Konfigurasi shadcn/ui
├── next.config.js         # Konfigurasi Next.js
├── tailwind.config.ts     # Konfigurasi Tailwind CSS
└── tsconfig.json          # Konfigurasi TypeScript
```

## 🌐 Integrasi API

### Base URL API
```
http://202.157.176.100:3001
```

### 1. API Negara
**Endpoint**: `GET /negaras`
**Fungsi**: Mengambil daftar negara

**Contoh Response**:
```json
[
  {
    "id_negara": "1",
    "nama_negara": "Indonesia"
  },
  {
    "id_negara": "2", 
    "nama_negara": "Malaysia"
  }
]
```

**Implementasi dengan Error Handling**:
```typescript
export async function fetchCountries(): Promise<Option[]> {
  try {
    const res = await axios.get('http://202.157.176.100:3001/negaras')
    return res.data.map((item: any) => ({
      value: String(item.id_negara),
      label: item.nama_negara,
    }))
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Koneksi timeout. Silakan coba lagi.')
    }
    if (error.response?.status === 404) {
      throw new Error('Data negara tidak ditemukan')
    }
    if (error.response?.status >= 500) {
      throw new Error('Server sedang bermasalah. Silakan coba lagi nanti.')
    }
    throw new Error('Gagal memuat data negara')
  }
}
```

### 2. API Pelabuhan
**Endpoint**: `GET /pelabuhans?filter={"where":{"id_negara":7}}`
**Fungsi**: Mengambil daftar pelabuhan berdasarkan negara

**Contoh Response**:
```json
[
  {
    "id_pelabuhan": "7",
    "nama_pelabuhan": "Tanjung Priok",
    "id_negara": "7"
  },
  {
    "id_pelabuhan": "8",
    "nama_pelabuhan": "Merak", 
    "id_negara": "7"
  }
]
```

### 3. API Barang
**Endpoint**: `GET /barangs?filter={"where":{"id_pelabuhan":2}}`
**Fungsi**: Mengambil daftar barang berdasarkan pelabuhan

**Contoh Response**:
```json
[
  {
    "id_barang": 2,
    "nama_barang": "KAOS",
    "id_pelabuhan": 2, 
    "description": "Merk Urgoon bahan tipis santai",
    "diskon": 10,
    "harga": 17500
  }
]
```

## 🔄 Alur Kerja Aplikasi

### 1. Alur Pengisian Form
```
Negara → Pelabuhan → Barang → Auto-fill Form → Generate PDF
```

### 2. Validasi Berurutan
- **Pelabuhan**: Disabled sampai negara dipilih
- **Barang**: Disabled sampai pelabuhan dipilih
- **Form Fields**: Auto-filled setelah barang dipilih

### 3. Auto-fill Logic
Ketika barang dipilih, sistem otomatis mengisi:
- **Deskripsi**: Dari `description` API
- **Harga**: Dari `harga` API 
- **Diskon**: Dihitung dari `diskon` (persentase) × `harga`
- **Total**: `harga` - `diskon amount`

**Contoh Perhitungan**:
```javascript
// Data dari API
const goods = {
  harga: 50000,
  diskon: 10 // 10%
}

// Perhitungan
const discountAmount = (50000 * 10) / 100 = 5000
const total = 50000 - 5000 = 45000
```


## 🚀 Deployment

### Build untuk Production
```bash
npm run build
```

### Static Export
```bash
npm run export
```

### Opsi Deployment
- **Vercel**: Deployment otomatis dengan Git integration
- **Netlify**: Drag and drop deployment
- **GitHub Pages**: Static hosting
- **CDN**: Upload folder `out`

## 🎯 Kustomisasi

### Menambah Field Form Baru
1. Update Zod schema di `app/page.tsx`
2. Tambahkan field ke JSX form
3. Update PDF generator untuk include field baru
4. Update alert messages jika diperlukan

### Modifikasi Logic Diskon
Update logic kalkulasi di useEffect:
```typescript
// Custom discount logic
const discountPercentage = selectedGoods.diskon // dari API
const discountAmount = (selectedGoods.harga * discountPercentage) / 100
const total = selectedGoods.harga - discountAmount
```

### Kustomisasi Alert System
```typescript
// Menampilkan alert dengan berbagai tipe
showAlert('success', 'Operasi berhasil!', 'Sukses')
showAlert('error', 'Terjadi kesalahan', 'Error')
showAlert('warning', 'Peringatan penting', 'Peringatan')
showAlert('info', 'Informasi tambahan', 'Info')
```
---

Created by Muhammad Fathurachman PT. Amar Mulia Bersama