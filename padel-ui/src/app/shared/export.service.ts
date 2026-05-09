import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  exportToCSV(data: any[], filename: string, headers?: string[]): void {
    if (!data || data.length === 0) {
      console.warn('No hay datos para exportar');
      return;
    }

    // Obtener headers de las claves del primer objeto si no se proporcionan
    const csvHeaders = headers || Object.keys(data[0]);
    
    // Crear filas de datos
    const csvRows = data.map(row => {
      return csvHeaders.map(header => {
        const value = row[header];
        // Escapar comillas y envolver en comillas si es necesario
        const stringValue = value === null || value === undefined ? '' : String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });

    // Crear contenido CSV con BOM para soportar caracteres especiales en Excel
    const csvContent = '\uFEFF' + [csvHeaders.join(','), ...csvRows].join('\n');

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}
