import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './admin-stats.html',
  styleUrls: ['./admin-stats.scss']
})
export class AdminStatsComponent implements OnInit {
  public barChartData: ChartConfiguration<'bar'>['data'] | undefined;
  public barChartOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false };

  public lineChartData: ChartConfiguration<'line'>['data'] | undefined;
  public lineChartOptions: ChartConfiguration<'line'>['options'] = { responsive: true, maintainAspectRatio: false };

  public pieChartData: ChartConfiguration<'doughnut'>['data'] | undefined;
  public pieChartOptions: ChartConfiguration<'doughnut'>['options'] = { responsive: true, maintainAspectRatio: false };

  constructor(private http: HttpClient, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarOcupacion();
    this.cargarIngresos();
    this.cargarHoras();
  }

  cargarOcupacion() {
    this.http.get<any>('http://localhost:8080/api/admin/stats/ocupacion', { headers: { Authorization: `Bearer ${this.authService.getToken()}` }})
      .subscribe(data => {
        this.barChartData = {
          labels: Object.keys(data),
          datasets: [{ data: Object.values(data), label: 'Partidos Jugados', backgroundColor: ['#004e92', '#002b55', '#ccff00', '#888'] }]
        };
        this.cdr.detectChanges();
      });
  }

  cargarIngresos() {
    this.http.get<any[]>('http://localhost:8080/api/admin/stats/ingresos', { headers: { Authorization: `Bearer ${this.authService.getToken()}` }})
      .subscribe(data => {
        this.lineChartData = {
          labels: data.map(d => d.fecha),
          datasets: [{ data: data.map(d => d.total), label: 'Ingresos Diarios (€)', borderColor: '#004e92', tension: 0.1, fill: false }]
        };
        this.cdr.detectChanges();
      });
  }

  cargarHoras() {
    this.http.get<any>('http://localhost:8080/api/admin/stats/horas', { headers: { Authorization: `Bearer ${this.authService.getToken()}` }})
      .subscribe(data => {
        this.pieChartData = {
          labels: Object.keys(data),
          datasets: [{ data: Object.values(data), backgroundColor: ['#004e92', '#002b55', '#ccff00', '#f8f9fa', '#6c757d', '#28a745', '#ffc107', '#dc3545', '#17a2b8'] }]
        };
        this.cdr.detectChanges();
      });
  }
}
