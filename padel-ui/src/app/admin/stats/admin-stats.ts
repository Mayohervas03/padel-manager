import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { API_BASE_URL } from '../../shared/api.config';
import type { OcupacionStats, IngresoStats, HorasStats } from '../../shared/models';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './admin-stats.html',
  styleUrls: ['./admin-stats.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminStatsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  readonly barChartData = signal<ChartConfiguration<'bar'>['data'] | undefined>(undefined);
  readonly barChartOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false };

  readonly lineChartData = signal<ChartConfiguration<'line'>['data'] | undefined>(undefined);
  readonly lineChartOptions: ChartConfiguration<'line'>['options'] = { responsive: true, maintainAspectRatio: false };

  readonly pieChartData = signal<ChartConfiguration<'doughnut'>['data'] | undefined>(undefined);
  readonly pieChartOptions: ChartConfiguration<'doughnut'>['options'] = { responsive: true, maintainAspectRatio: false };

  // Datos raw para KPIs
  readonly ocupacionRaw = signal<OcupacionStats | null>(null);
  readonly ingresosRaw = signal<IngresoStats[] | null>(null);
  readonly horasRaw = signal<HorasStats | null>(null);

  desde = this.formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  hasta = this.formatDate(new Date());

  readonly kpis = computed(() => {
    const ocupacion = this.ocupacionRaw();
    const ingresos = this.ingresosRaw();
    const horas = this.horasRaw();

    const totalPartidos = ocupacion ? Object.values(ocupacion).reduce((a, b) => a + b, 0) : 0;
    const totalIngresos = ingresos ? ingresos.reduce((sum, i) => sum + (i.total || 0), 0) : 0;
    const promedioDiario = ingresos && ingresos.length > 0 ? Math.round(totalIngresos / ingresos.length) : 0;
    
    const pistaTop = ocupacion && Object.keys(ocupacion).length > 0
      ? Object.entries(ocupacion).sort((a, b) => b[1] - a[1])[0]
      : null;
    
    const horaTop = horas && Object.keys(horas).length > 0
      ? Object.entries(horas).sort((a, b) => b[1] - a[1])[0]
      : null;

    return {
      totalPartidos,
      totalIngresos: Math.round(totalIngresos * 100) / 100,
      promedioDiario,
      pistaTop: pistaTop ? { nombre: pistaTop[0], valor: pistaTop[1] } : null,
      horaTop: horaTop ? { nombre: horaTop[0], valor: horaTop[1] } : null
    };
  });

  ngOnInit() {
    this.cargarOcupacion();
    this.cargarIngresos();
    this.cargarHoras();
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private buildParams(): { [key: string]: string } {
    const params: { [key: string]: string } = {};
    if (this.desde) params['desde'] = this.desde;
    if (this.hasta) params['hasta'] = this.hasta;
    return params;
  }

  aplicarFiltros() {
    this.cargarOcupacion();
    this.cargarIngresos();
    this.cargarHoras();
  }

  cargarOcupacion() {
    this.http.get<OcupacionStats>(`${this.apiUrl}/admin/stats/ocupacion`, { params: this.buildParams() }).subscribe(data => {
      this.ocupacionRaw.set(data);
      this.barChartData.set({
        labels: Object.keys(data),
        datasets: [{ data: Object.values(data), label: 'Partidos Jugados', backgroundColor: ['#004e92', '#002b55', '#ccff00', '#888'] }]
      });
    });
  }

  cargarIngresos() {
    this.http.get<IngresoStats[]>(`${this.apiUrl}/admin/stats/ingresos`, { params: this.buildParams() }).subscribe(data => {
      this.ingresosRaw.set(data);
      this.lineChartData.set({
        labels: data.map(d => d.fecha),
        datasets: [{ data: data.map(d => d.total), label: 'Ingresos Diarios (€)', borderColor: '#004e92', tension: 0.1, fill: false }]
      });
    });
  }

  cargarHoras() {
    this.http.get<HorasStats>(`${this.apiUrl}/admin/stats/horas`, { params: this.buildParams() }).subscribe(data => {
      this.horasRaw.set(data);
      this.pieChartData.set({
        labels: Object.keys(data),
        datasets: [{ data: Object.values(data), backgroundColor: ['#004e92', '#002b55', '#ccff00', '#f8f9fa', '#6c757d', '#28a745', '#ffc107', '#dc3545', '#17a2b8'] }]
      });
    });
  }
}
