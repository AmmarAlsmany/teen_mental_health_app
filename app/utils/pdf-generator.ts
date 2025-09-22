import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface WeeklyReportData {
  weekStart: string;
  weekEnd: string;
  totalEntries: number;
  averages: {
    mood: number;
    sleep: number;
    energy: number;
    medication: number;
  };
  trends: {
    mood: number;
    sleep: number;
    energy: number;
    medication: number;
  };
  insights: string[];
  recommendations: string[];
}

export class PDFGenerator {
  static async generateWeeklyReportPDF(data: WeeklyReportData): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set up PDF styling
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(59, 130, 246); // Blue color
    pdf.text('Weekly Mental Health Report', margin, yPosition);
    yPosition += 15;

    // Date range
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${data.weekStart} - ${data.weekEnd}`, margin, yPosition);
    yPosition += 20;

    // Summary section
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Weekly Summary', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.text(`Total Entries: ${data.totalEntries}`, margin, yPosition);
    yPosition += 15;

    // Averages section
    pdf.setFontSize(14);
    pdf.text('Weekly Averages', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    const averages = [
      `Mood: ${data.averages.mood.toFixed(1)}/10`,
      `Sleep Quality: ${data.averages.sleep.toFixed(1)}/10`,
      `Energy Level: ${data.averages.energy.toFixed(1)}/10`,
      `Medication Adherence: ${data.averages.medication.toFixed(1)}/10`
    ];

    averages.forEach(avg => {
      pdf.text(`• ${avg}`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 10;

    // Trends section
    pdf.setFontSize(14);
    pdf.text('Weekly Trends', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    const trends = [
      { name: 'Mood', value: data.trends.mood },
      { name: 'Sleep Quality', value: data.trends.sleep },
      { name: 'Energy Level', value: data.trends.energy },
      { name: 'Medication Adherence', value: data.trends.medication }
    ];

    trends.forEach(trend => {
      const direction = trend.value > 0 ? '↗️' : trend.value < 0 ? '↘️' : '→';
      const change = Math.abs(trend.value).toFixed(1);
      pdf.text(`• ${trend.name}: ${direction} ${change} points`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 15;

    // Insights section
    if (data.insights.length > 0) {
      pdf.setFontSize(14);
      pdf.text('Key Insights', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(11);
      data.insights.forEach(insight => {
        const lines = pdf.splitTextToSize(insight, pageWidth - 2 * margin - 10);
        pdf.text(`• ${lines[0]}`, margin + 5, yPosition);
        yPosition += 6;
        
        if (lines.length > 1) {
          for (let i = 1; i < lines.length; i++) {
            pdf.text(`  ${lines[i]}`, margin + 5, yPosition);
            yPosition += 6;
          }
        }
      });
      yPosition += 10;
    }

    // Recommendations section
    if (data.recommendations.length > 0) {
      pdf.setFontSize(14);
      pdf.text('Recommendations', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(11);
      data.recommendations.forEach(rec => {
        const lines = pdf.splitTextToSize(rec, pageWidth - 2 * margin - 10);
        pdf.text(`• ${lines[0]}`, margin + 5, yPosition);
        yPosition += 6;
        
        if (lines.length > 1) {
          for (let i = 1; i < lines.length; i++) {
            pdf.text(`  ${lines[i]}`, margin + 5, yPosition);
            yPosition += 6;
          }
        }
      });
    }

    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    const footerText = `Generated on ${new Date().toLocaleDateString()}`;
    pdf.text(footerText, pageWidth - margin - pdf.getTextWidth(footerText), pageHeight - 10);

    return pdf.output('blob');
  }

  static async generateReportFromElement(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Report element not found');
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        height: element.scrollHeight,
        width: element.scrollWidth
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }
}

export class ShareManager {
  static async shareReport(data: WeeklyReportData, pdfBlob?: Blob): Promise<void> {
    const shareData = {
      title: 'Weekly Mental Health Report',
      text: `My weekly mental health report (${data.weekStart} - ${data.weekEnd})`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare) {
      try {
        if (pdfBlob) {
          const file = new File([pdfBlob], 'weekly-report.pdf', { type: 'application/pdf' });
          const shareDataWithFile = { ...shareData, files: [file] };
          
          if (navigator.canShare(shareDataWithFile)) {
            await navigator.share(shareDataWithFile);
            return;
          }
        }
        
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          this.fallbackShare(shareData);
        }
      }
    } else {
      this.fallbackShare(shareData);
    }
  }

  private static fallbackShare(shareData: { title: string; text: string; url: string }): void {
    // Copy to clipboard as fallback
    const textToShare = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare).then(() => {
        alert('Report link copied to clipboard!');
      }).catch(() => {
        this.legacyFallbackShare(textToShare);
      });
    } else {
      this.legacyFallbackShare(textToShare);
    }
  }

  private static legacyFallbackShare(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      alert('Report link copied to clipboard!');
    } catch (err) {
      console.error('Unable to copy to clipboard', err);
      alert('Unable to share. Please copy the URL manually.');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  static downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}