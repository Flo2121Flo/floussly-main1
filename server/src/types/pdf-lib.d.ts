declare module 'pdf-lib' {
  export class PDFDocument {
    static load(pdfBytes: Uint8Array | ArrayBuffer): Promise<PDFDocument>;
    save(): Promise<Uint8Array>;
    getPageCount(): number;
    getPages(): PDFPage[];
  }

  export interface PDFPage {
    getWidth(): number;
    getHeight(): number;
  }
} 