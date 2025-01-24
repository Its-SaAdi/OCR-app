import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

export const generatePDF = (data) => {
    const doc = new jsPDF();
    doc.text(data, 10, 10);
    doc.save(`Extracted_pdf_${Date.now().toString().slice(0, 10)}.pdf`);
}

export const generateTxt = (data) => {
    const blob = new Blob([data], { type: 'text/plain' });
    saveAs(blob, `Extracted_text_${Date.now().toString().slice(0, 10)}.txt`);

    // Alternative way to download txt file
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = `extracted_text_${index + 1}.txt`;
    // a.click();
}