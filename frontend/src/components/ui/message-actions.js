import React from 'react';
import { Copy, FileDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

export const MessageActions = ({ message, componentRef, contentRef }) => {
  const { toast } = useToast();

  const handleCopyText = async () => {
    if (typeof message.content === 'string') {
      try {
        await navigator.clipboard.writeText(message.content);
        toast({
          title: "Success",
          description: "Text copied to clipboard",
          duration: 2000,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy text",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const downloadResultsAsPDF = async (elementRef, filename) => {
    if (!elementRef.current) {
      console.log('No element reference found');
      return;
    }
  
    try {
      console.log('Starting PDF generation...');
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
  
      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
  
      // Save the current state of all tab contents (hidden/displayed)
      const allTabTriggers = Array.from(elementRef.current.querySelectorAll('[role="tab"]'));
      const allTabs = Array.from(elementRef.current.querySelectorAll('[role="tabpanel"]'));
  
      console.log('Tabs found:', allTabs.length);
      console.log('Tab triggers found:', allTabTriggers.length);
  
      // Temporarily show all tabs by setting their display to block
      allTabs.forEach((tab, index) => {
        console.log(`Making tab ${index + 1} visible`);
        tab.style.display = 'block';  // Make all tabs visible
      });
  
      // Temporarily make all tab triggers active
      allTabTriggers.forEach((trigger, index) => {
        console.log(`Activating tab trigger ${index + 1}`);
        trigger.classList.add('active'); // Ensure tab triggers are active
      });
  
      // Wait for a moment to ensure everything is rendered
      await new Promise((resolve) => {
        setTimeout(() => {
          console.log('Waiting for content to render...');
          resolve();
        }, 200);
      });

      console.log('All Tabs:', allTabs)
      console.log('All Triggers:', allTabs)
  
      // Get all chart containers and tables (including those from hidden tabs)
      const allCharts = elementRef.current.querySelectorAll('.recharts-wrapper, table');
      console.log('Total charts and tables to be included:', allCharts.length);
      
      let yOffset = 10; // Start position from top
  
      for (const chartContainer of allCharts) {
        console.log('Processing chart/table:', chartContainer);
        
        // Set white background for consistency
        const originalBackground = chartContainer.style.background;
        chartContainer.style.background = 'white';
  
        // Render the chart or table as canvas
        const canvas = await html2canvas(chartContainer, {
          backgroundColor: '#ffffff',
          scale: 2, // Increase quality
          logging: false,
          useCORS: true,
        });
  
        console.log('Canvas generated for chart/table');
        
        // Reset original background
        chartContainer.style.background = originalBackground;
  
        // Calculate dimensions to fit A4 width (210mm) with margins
        const pageWidth = 210;
        const margins = 20;
        const contentWidth = pageWidth - margins * 2;
        const scaleFactor = contentWidth / canvas.width;
        const imgWidth = canvas.width * scaleFactor;
        const imgHeight = canvas.height * scaleFactor;
  
        // Check if we need a new page
        if (yOffset + imgHeight > 287) {
          console.log('Adding new page to PDF due to height overflow');
          pdf.addPage();
          yOffset = 10;
        }
  
        // Add image to PDF
        console.log('Adding image to PDF');
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margins, yOffset, imgWidth, imgHeight);
  
        yOffset += imgHeight + 10; // Add spacing between elements
      }
  
      // Restore the original display state of tabs
      allTabs.forEach((tab, index) => {
        console.log(`Restoring visibility of tab ${index + 1}`);
        tab.style.display = ''; // Reset the display property
      });
  
      // Restore the original active state of tab triggers
      allTabTriggers.forEach((trigger, index) => {
        console.log(`Deactivating tab trigger ${index + 1}`);
        trigger.classList.remove('active'); // Reset active class
      });
  
      // Save PDF with the provided filename
      console.log('Saving PDF...');
      pdf.save(`${filename}-${Date.now()}.pdf`);
  
      toast({
        title: 'Success',
        description: 'PDF downloaded successfully',
        duration: 2000,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast({
        title: 'Error',
        description: 'Failed to download PDF',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };  

  const downloadReviewAsPDF = async (elementRef, filename) => {
    if (!elementRef.current) return;
  
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
  
      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Increase quality
        logging: false,
        useCORS: true,
      });
  
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4', // Set the page size to A4
        backgroundColor: '#ffffff',
      });
  
      // Calculate the number of pages needed based on the canvas height
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasHeight = canvas.height;
      const numPages = Math.ceil(canvasHeight / pdfHeight);
  
      for (let i = 0; i < numPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        const y = -i * pdfHeight;
        pdf.addImage(imgData, 'PNG', 0, y, canvas.width, canvas.height);
      }
  
      pdf.save(`${filename}-${Date.now()}.pdf`);
  
      toast({
        title: 'Success',
        description: 'PDF downloaded successfully',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to download PDF',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  // Determine which actions to show based on message type and content
  const renderActions = () => {
    // For messages with risk analysis results
    if (message.results) {
      return (
        <button
          onClick={() => downloadResultsAsPDF(componentRef, 'analysis-results')}
          className="p-3 rounded-full hover:bg-amber-100 transition-colors"
          title="Download analysis as PDF"
        >
          <FileDown className="w-5 h-5" />
        </button>
      );
    }
    
    // For tax review documents
    if (message.content_type === 'tax_review') {
      return (
        <button
          onClick={handleCopyText}
          className="p-1 rounded-full hover:bg-amber-100 transition-colors"
          title="Copy text"
        >
          <Copy className="w-5 h-5" />
        </button>
      );
    }
    
    // For regular text messages
    if (typeof message.content === 'string' && !message.results) {
      return (
        <button
          onClick={handleCopyText}
          className="p-1 rounded-full hover:bg-green-100 transition-colors"
          title="Copy text"
        >
          <Copy className="w-5 h-5" />
        </button>
      );
    }
    
    return null;
  };

  return (
    <div className="absolute top-2 right-2 flex gap-2">
      {renderActions()}
    </div>
  );
};

export default MessageActions;