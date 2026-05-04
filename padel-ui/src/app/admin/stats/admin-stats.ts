import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { API_BASE_URL } from '../../shared/api.config';
import type { OcupacionStats, IngresoStats, HorasStats } from '../../shared/models';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
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

  ngOnInit() {
    this.cargarOcupacion();
    this.cargarIngresos();
    this.cargarHoras();
  }

  cargarOcupacion() {
    this.http.get<OcupacionStats>(`${this.apiUrl}/admin/stats/ocupacion`).subscribe(data => {
      this.barChartData.set({
        labels: Object.keys(data),
        datasets: [{ data: Object.values(data), label: 'Partidos Jugados', backgroundColor: ['#004e92', '#002b55', '#ccff00', '#888'] }]
      });
    });
  }

  cargarIngresos() {
    this.http.get<IngresoStats[]>(`${this.apiUrl}/admin/stats/ingresos`).subscribe(data => {
      this.lineChartData.set({
        labels: data.map(d => d.fecha),
        datasets: [{ data: data.map(d => d.total), label: 'Ingresos Diarios (€)', borderColor: '#004e92', tension: 0.1, fill: false }]
      });
    });
  }

  cargarHoras() {
    this.http.get<HorasStats>(`${this.apiUrl}/admin/stats/horas`).subscribe(data => {
      this.pieChartData.set({
        labels: Object.keys(data),
        datasets: [{ data: Object.values(data), backgroundColor: ['#004e92', '#002b55', '#ccff00', '#f8f9fa', '#6c757d', '#28a745', '#ffc107', '#dc3545', '#17a2b8'] }]
      });
    });
  }
}
