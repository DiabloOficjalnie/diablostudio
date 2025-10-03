import jsPDF from 'jspdf'
import { CONTENT, getDecorativeOption, getFloorSystemData } from './content'

interface QuoteData {
  area: number
  floorSystem: string
  substrateCondition: string
  location: string
  decorativeSystem: string
  priceRange: {
    min: number
    max: number
  }
  totalMin: number
  totalMax: number
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

export const generateQuotePDF = async (quoteData: QuoteData): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let yPosition = margin

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, y)
    return lines.length * fontSize * 0.5 // More accurate line height
  }

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Header - Company Info
  doc.setFillColor(59, 130, 246) // Blue color
  doc.rect(0, 0, pageWidth, 35, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(CONTENT.COMPANY.NAME, margin, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(CONTENT.COMPANY.TAGLINE, margin, 28)

  // Company details on the right
  doc.setFontSize(8)
  const companyDetails = [
    CONTENT.COMPANY.ADDRESS,
    `Tel: ${CONTENT.COMPANY.PHONE}`,
    `Email: ${CONTENT.COMPANY.EMAIL}`,
    `Website: ${CONTENT.COMPANY.WEBSITE}`,
    `NIP: ${CONTENT.COMPANY.NIP}`
  ]

  const rightX = pageWidth - margin - 50
  companyDetails.forEach((detail, index) => {
    doc.text(detail, rightX, 12 + (index * 4))
  })

  yPosition = 40

  // Quote Title
  checkPageBreak(20)
  doc.setTextColor(59, 130, 246)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('OFERTA CENOWA', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 12

  // Quote Date
  const currentDate = new Date().toLocaleDateString('pl-PL')
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(9)
  doc.text(`Data wystawienia: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15

  // Customer Information Section
  checkPageBreak(40)
  doc.setTextColor(59, 130, 246)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('DANE KLIENTA', margin, yPosition)
  yPosition += 10

  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)

  if (quoteData.customerName) {
    doc.text(`Imię i nazwisko: ${quoteData.customerName}`, margin, yPosition)
    yPosition += 7
  }
  if (quoteData.customerEmail) {
    doc.text(`Email: ${quoteData.customerEmail}`, margin, yPosition)
    yPosition += 7
  }
  if (quoteData.customerPhone) {
    doc.text(`Telefon: ${quoteData.customerPhone}`, margin, yPosition)
    yPosition += 7
  }

  yPosition += 10

  // Project Details Section
  checkPageBreak(50)
  doc.setTextColor(59, 130, 246)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('SZCZEGÓŁY PROJEKTU', margin, yPosition)
  yPosition += 10

  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 15

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)

  // Project details in a structured format
  const projectDetails = [
    { label: 'Powierzchnia całkowita:', value: `${quoteData.area.toFixed(2)} m²` },
    { label: 'System posadzkowy:', value: getFloorSystemData(quoteData.floorSystem)?.name || quoteData.floorSystem },
    { label: 'Rodzaj podłoża:', value: quoteData.substrateCondition },
    { label: 'Lokalizacja:', value: quoteData.location === 'INDOOR' ? 'Wnętrze' : 'Zewnątrz' },
    { label: 'System dekoracyjny:', value: getDecorativeOption(quoteData.decorativeSystem)?.name || quoteData.decorativeSystem }
  ]

  projectDetails.forEach(detail => {
    doc.setFont('helvetica', 'bold')
    doc.text(detail.label, margin, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(detail.value, margin + 50, yPosition)
    yPosition += 8
  })

  yPosition += 10

  // Price Section
  checkPageBreak(60)
  doc.setTextColor(59, 130, 246)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('OFERTA CENOWA', margin, yPosition)
  yPosition += 10

  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 15

  // Price display
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.text('Cena za m²:', margin, yPosition)
  yPosition += 8

  doc.setFontSize(16)
  doc.setTextColor(0, 100, 0)
  doc.setFont('helvetica', 'bold')
  doc.text(`${quoteData.priceRange.min} - ${quoteData.priceRange.max} PLN`, margin + 30, yPosition)
  yPosition += 12

  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.text('Cena całkowita:', margin, yPosition)
  yPosition += 8

  doc.setFontSize(16)
  doc.setTextColor(0, 100, 0)
  doc.setFont('helvetica', 'bold')
  doc.text(`${quoteData.totalMin.toLocaleString()} - ${quoteData.totalMax.toLocaleString()} PLN`, margin + 30, yPosition)
  yPosition += 15

  // Disclaimer
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'italic')
  const disclaimerText = '* Cena orientacyjna. Ostateczna cena może ulec zmianie po dokonaniu oględzin miejsca realizacji.'
  yPosition += addWrappedText(disclaimerText, margin, yPosition, pageWidth - 2 * margin, 9)

  yPosition += 15

  // Terms and Conditions
  checkPageBreak(80)
  doc.setTextColor(59, 130, 246)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('WARUNKI OFERTY', margin, yPosition)
  yPosition += 10

  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 15

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  const terms = [
    '• Oferta ważna przez 30 dni od daty wystawienia',
    '• Cena nie obejmuje ewentualnych prac przygotowawczych podłoża',
    '• Realizacja po dokonaniu przedpłaty w wysokości 50% wartości zamówienia',
    '• Gwarancja na wykonane prace: 24 miesiące',
    '• Płatność pozostałej kwoty po zakończeniu prac',
    '• Wycena została przygotowana na podstawie podanych informacji'
  ]

  terms.forEach(term => {
    yPosition += 6
    checkPageBreak(10)
    doc.text(term, margin, yPosition)
  })

  yPosition += 15

  // Footer
  checkPageBreak(30)
  const footerY = pageHeight - 30

  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10)

  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.text('Dokument wygenerowany automatycznie przez system wycen', pageWidth / 2, footerY, { align: 'center' })
  doc.text(`${CONTENT.COMPANY.WEBSITE}`, pageWidth / 2, footerY + 5, { align: 'center' })

  // Save the PDF
  const fileName = `wycena-${CONTENT.COMPANY.NAME}-${currentDate.replace(/\./g, '-')}.pdf`
  doc.save(fileName)
}

export default generateQuotePDF
