const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser(this, 1);

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    fs.writeFileSync('c:\\Users\\lagsu\\OneDrive\\Escritorio\\Smartune\\Documentacion\\extracted_text.txt', pdfParser.getRawTextContent());
    console.log('Extraction completed');
});

pdfParser.loadPDF('c:\\Users\\lagsu\\OneDrive\\Escritorio\\Smartune\\Documentacion\\Documentacion Final Skeletune.pdf');
