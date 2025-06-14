import jsPDF from 'jspdf'

interface FormData {
  country: { value: string; label: string }
  port: { value: string; label: string }
  goods: { value: string; label: string }
  description: string
  price: number
  discount: number
  totalAmount: number
}

export async function generatePDF(data: FormData): Promise<void> {
  const doc = new jsPDF()
  
  // Set up fonts and colors
  const primaryColor: [number, number, number] = [59, 130, 246] // Blue
  const secondaryColor: [number, number, number] = [107, 114, 128] // Gray
  const accentColor: [number, number, number] = [16, 185, 129] // Teal
  
  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Informasi Transaksi', 20, 25)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Dibuat pada: ' + new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }), 20, 35)
  
  // Reset text color
  doc.setTextColor(0, 0, 0)
  
  let yPosition = 60
  
  // Location Information Section
  doc.setFillColor(248, 250, 252)
  doc.rect(15, yPosition - 5, 180, 8, 'F')
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('Informasi Lokasi', 20, yPosition)
  
  yPosition += 15
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...secondaryColor)
  
  // Country
  doc.setFont('helvetica', 'bold')
  doc.text('Negara:', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(data.country.label, 60, yPosition)
  
  yPosition += 10
  
  // Port
  doc.setFont('helvetica', 'bold')
  doc.text('Pelabuhan:', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(data.port.label, 60, yPosition)
  
  yPosition += 20
  
  // Goods Information Section
  doc.setFillColor(248, 250, 252)
  doc.rect(15, yPosition - 5, 180, 8, 'F')
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('Informasi Barang', 20, yPosition)
  
  yPosition += 15
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...secondaryColor)
  
  // Goods/Items
  doc.setFont('helvetica', 'bold')
  doc.text('Barang:', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(data.goods.label, 60, yPosition)
  
  yPosition += 15
  
  // Description
  doc.setFont('helvetica', 'bold')
  doc.text('Deskripsi:', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  
  // Handle long descriptions by splitting into multiple lines
  const descriptionLines = doc.splitTextToSize(data.description, 120)
  doc.text(descriptionLines, 20, yPosition + 8)
  
  yPosition += 8 + (descriptionLines.length * 5) + 10
  
  // Financial Information Section
  doc.setFillColor(248, 250, 252)
  doc.rect(15, yPosition - 5, 180, 8, 'F')
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('Informasi Keuangan', 20, yPosition)
  
  yPosition += 15
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...secondaryColor)
  
  // Price
  doc.setFont('helvetica', 'bold')
  doc.text('Harga:', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text('Rp ' + data.price.toLocaleString('id-ID'), 60, yPosition)
  
  yPosition += 10
  
  // Discount
  doc.setFont('helvetica', 'bold')
  doc.text('Diskon:', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text('% ' + data.discount.toLocaleString('id-ID'), 60, yPosition)
  
  yPosition += 15
  
  // Total Amount (highlighted)
  doc.setFillColor(...accentColor)
  doc.rect(15, yPosition - 3, 180, 12, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Total Harga:', 20, yPosition + 5)
  doc.text('Rp ' + data.totalAmount.toLocaleString('id-ID'), 100, yPosition + 5)
  
  yPosition += 25
  
  // Footer
  doc.setTextColor(...secondaryColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Created by Muhammad Fathurachman', 20, yPosition)
  
  // Add border
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.rect(10, 45, 190, yPosition - 35)
  
  // Save the PDF
  const fileName = `informasi_transaksi_${Date.now()}.pdf`
  doc.save(fileName)
}