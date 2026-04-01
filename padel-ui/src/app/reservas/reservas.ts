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
  reservas: any[] = [];
  cargando: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.generarDias();
    this.cargarMisReservas();
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
          console.log(`Consultando disponibilidad -> ${url}`);
          
          this.http.get<any[]>(url)
            .subscribe({
                next: (data) => {
                    console.log("Pistas libres recibidas desde BD:", data);
                    this.pistasDisponibles = data;
                    this.cdr.detectChanges();
                },
                error: (err) => console.error("Error obteniendo disponibilidad", err)
            });
      } else {
          this.pistasDisponibles = [];
      }
  }

  cargarMisReservas() {
    this.http.get<any[]>('http://localhost:8080/api/reservas').subscribe(
      data => {
        this.reservas = data;
        this.cdr.detectChanges();
      },
      error => console.error("Error cargando reservas:", error)
    );
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
        this.cargarMisReservas();
      },
      error: (err) => {
        console.error("Error al guardar reserva:", err);
        if (err.status === 400) {
           alert(err.error); 
        } else {
           alert("Ocurrió un error inesperado.");
        }
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

  borrarReserva(id: number) {
    if (confirm("¿Estás seguro de que quieres cancelar esta reserva?")) {
      this.http.delete(`http://localhost:8080/api/reservas/${id}`).subscribe({
        next: () => {
          this.cargarMisReservas();
        },
        error: (err) => {
          console.error("Error al borrar reserva:", err);
          alert("Error al borrar la reserva");
        }
      });
    }
  }
}
