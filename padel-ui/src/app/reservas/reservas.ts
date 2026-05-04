import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../shared/api.config';
import type { Pista } from '../shared/models';

interface Dia {
  readonly fecha: string;
  readonly diaLetra: string;
  readonly diaNum: number;
  readonly mes: string;
}

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservasComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  readonly diasDisponibles = signal<Dia[]>([]);
  readonly horasDisponibles = signal<readonly string[]>([
    '09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00', '22:30'
  ]);
  
  readonly fechaSeleccionada = signal<string | null>(null);
  readonly horaSeleccionada = signal<string | null>(null);
  readonly pistaSeleccionada = signal<Pista | null>(null);
  readonly pistasDisponibles = signal<Pista[]>([]);
  readonly cargando = signal(false);

  ngOnInit() {
    this.generarDias();
  }

  generarDias() {
    const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dias: Dia[] = [];

    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const localISO = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      
      dias.push({
        fecha: localISO,
        diaLetra: nombresDias[date.getDay()],
        diaNum: date.getDate(),
        mes: nombresMeses[date.getMonth()]
      });
    }
    this.diasDisponibles.set(dias);
  }

  seleccionarDia(fecha: string) {
    this.fechaSeleccionada.set(fecha);
    this.pistaSeleccionada.set(null);
    this.comprobarDisponibilidad();
  }

  seleccionarHora(hora: string) {
    this.horaSeleccionada.set(hora);
    this.pistaSeleccionada.set(null);
    this.comprobarDisponibilidad();
  }

  seleccionarPista(pista: Pista) {
    this.pistaSeleccionada.set(pista);
  }

  comprobarDisponibilidad() {
    const fecha = this.fechaSeleccionada();
    const hora = this.horaSeleccionada();
    
    if (fecha && hora) {
      const url = `${this.apiUrl}/pistas/disponibles?fecha=${fecha}&hora=${hora}:00`;
      this.http.get<Pista[]>(url).subscribe({
        next: (data) => this.pistasDisponibles.set(data),
        error: (err) => console.error('Error obteniendo disponibilidad', err)
      });
    } else {
      this.pistasDisponibles.set([]);
    }
  }

  guardarReserva() {
    const pista = this.pistaSeleccionada();
    const fecha = this.fechaSeleccionada();
    const hora = this.horaSeleccionada();
    
    if (!pista || !fecha || !hora) return;

    this.cargando.set(true);

    // Payload actualizado: enviamos pistaId como campo plano (DTO del backend)
    const reservaData = {
      pistaId: pista.id,
      fecha,
      hora: `${hora}:00`
    };

    this.http.post(`${this.apiUrl}/reservas`, reservaData).subscribe({
      next: () => {
        alert('Reserva confirmada con éxito!');
        this.resetearFlujo();
      },
      error: (err) => {
        // El interceptor ya normaliza el error para que err.error sea un string
        alert(err.error || 'Ocurrió un error inesperado.');
      }
    }).add(() => {
      this.cargando.set(false);
    });
  }

  resetearFlujo() {
    this.fechaSeleccionada.set(null);
    this.horaSeleccionada.set(null);
    this.pistaSeleccionada.set(null);
    this.pistasDisponibles.set([]);
  }
}
