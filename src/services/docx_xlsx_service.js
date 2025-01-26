import { isTableLike, formatTableData } from './table_handler';
import { Document, Paragraph, Packer, TextRun, Table, TableRow, TableCell } from 'docx';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const generateDocx = (data) => {
    const { isTable, delimiter } = isTableLike(data);
    
    let documentContent;
    if (isTable) {
        const rows = formatTableData(data, delimiter);

        const table = new Table({
        rows: rows.map((row) =>
            new TableRow({
            children: row.map((cell) =>
                new TableCell({
                children: [new Paragraph({ children: [new TextRun(cell)] })],
                })
            ),
            })
        ),
        });

        documentContent = [table];
    } else {
        const paragraph = new Paragraph({
        children: [new TextRun(data)],
        });

        documentContent = [paragraph];
    }

    const doc = new Document({
        sections: [
        {
            properties: {},
            children: documentContent,
        },
        ],
    });

    Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `ExtractedText_${Date.now().toString().slice(0, 10)}.docx`);
    }); 
};

export const generateXlsx = (data) => {
    const { isTable, delimiter } = isTableLike(data);

    let worksheet;
    if (isTable) {
        // Format as table
        const rows = formatTableData(data, delimiter);
            
        worksheet = XLSX.utils.aoa_to_sheet(rows);
    } else {
        // Format as sentence
        worksheet = XLSX.utils.aoa_to_sheet([["Extracted Text"], [data]]);
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Text");
    XLSX.writeFile(workbook, `ExtractedText_${Date.now().toString().slice(0, 10)}.xlsx`);
};