import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Dia {
  fecha: string;
  diaLetra: string;
  diaNum: number;
  mes: string;
}

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss',
})
export class ReservasComponent implements OnInit {
  diasDisponibles: Dia[] = [];
  horasDisponibles: string[] = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00', '22:30'];
  
  fechaSeleccionada: string | null = null;
  horaSeleccionada: string | null = null;
  pistaSeleccionada: any = null;

  pistasDisponibles: any[] = [];
  cargando: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.generarDias();
  }

  generarDias() {
    const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 0; i < 14; i++) {
        let date = new Date();
        date.setDate(date.getDate() + i);
        
        let localISO = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        
        this.diasDisponibles.push({
            fecha: localISO,
            diaLetra: nombresDias[date.getDay()],
            diaNum: date.getDate(),
            mes: nombresMeses[date.getMonth()]
        });
    }
  }

  seleccionarDia(fecha: string) {
    this.fechaSeleccionada = fecha;
    this.pistaSeleccionada = null;
    this.comprobarDisponibilidad();
  }

  seleccionarHora(hora: string) {
    this.horaSeleccionada = hora;
    this.pistaSeleccionada = null;
    this.comprobarDisponibilidad();
  }

  seleccionarPista(pista: any) {
    this.pistaSeleccionada = pista;
  }

  comprobarDisponibilidad() {
      if (this.fechaSeleccionada && this.horaSeleccionada) {
          const url = `http://localhost:8080/api/pistas/disponibles?fecha=${this.fechaSeleccionada}&hora=${this.horaSeleccionada}:00`;
          this.http.get<any[]>(url)
            .subscribe({
                next: (data) => {
                    this.pistasDisponibles = data;
                    this.cdr.detectChanges();
                },
                error: (err) => console.error("Error obteniendo disponibilidad", err)
            });
      } else {
          this.pistasDisponibles = [];
      }
  }

  guardarReserva() {
    if (!this.pistaSeleccionada || !this.fechaSeleccionada || !this.horaSeleccionada) {
      return;
    }

    this.cargando = true;

    const reservaData = {
      pista: { id: this.pistaSeleccionada.id },
      fecha: this.fechaSeleccionada,
      hora: `${this.horaSeleccionada}:00`
    };

    this.http.post('http://localhost:8080/api/reservas', reservaData).subscribe({
      next: () => {
        alert("¡Reserva confirmada con éxito!");
        this.resetearFlujo();
      },
      error: (err) => {
        console.error("Error al guardar reserva:", err);
        alert(err.error || "Ocurrió un error inesperado.");
      }
    }).add(() => {
      this.cargando = false;
      this.cdr.detectChanges();
    });
  }

  resetearFlujo() {
      this.fechaSeleccionada = null;
      this.horaSeleccionada = null;
      this.pistaSeleccionada = null;
      this.pistasDisponibles = [];
  }
}
