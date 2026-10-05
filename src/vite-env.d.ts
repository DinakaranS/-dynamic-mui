/// <reference types="vite/client" />

// Optional peer dependency, lazy-loaded only when `apiRef.exportPdf()` is called.
// Declared so the subpath imports type-check without pdfmake being a hard dep.
declare module 'pdfmake/build/pdfmake';
declare module 'pdfmake/build/vfs_fonts';
