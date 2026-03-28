import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservas',
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss',
})
export class ReservasComponent implements OnInit {
  pistas: any[] = [];
  reservas: any[] = [];
  cargando: boolean = false;

  // Usamos IDs para el formulario, es más fácil de manejar en el HTML
  nuevaReserva = {
    pistaId: null,
    fecha: '',
    hora: null
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.http.get<any[]>('http://localhost:8080/api/pistas').subscribe(
      data => {
        this.pistas = data;
        this.cdr.detectChanges();
      },
      error => console.error("Error cargando pistas:", error)
    );

    this.http.get<any[]>('http://localhost:8080/api/reservas').subscribe(
      data => {
        this.reservas = data;
        this.cdr.detectChanges();
      },
      error => console.error("Error cargando reservas:", error)
    );
  }

  guardarReserva() {
    if (!this.nuevaReserva.pistaId || !this.nuevaReserva.fecha || this.nuevaReserva.hora == null) {
      alert("Por favor rellena todos los campos.");
      return;
    }

    this.cargando = true;

    // Convertimos los IDs simples en los objetos que espera Java
    const reservaData = {
      pista: { id: Number(this.nuevaReserva.pistaId) },
      fecha: this.nuevaReserva.fecha,
      hora: Number(this.nuevaReserva.hora)
    };

    this.http.post('http://localhost:8080/api/reservas', reservaData).subscribe({
      next: () => {
        // Limpiamos el formulario en caso de éxito
        this.nuevaReserva = { pistaId: null, fecha: '', hora: null };
        this.cargarDatos(); // Recargamos la tabla
      },
      error: (err) => {
        console.error("Error al guardar reserva:", err);
        if (err.status === 400) {
          alert(err.error); 
        } else {
          alert("Ocurrió un error inesperado. Mira la consola para más detalles.");
        }
      }
    }).add(() => {
      // Se ejecuta siempre, tanto si hay error como si no, asegurando que se desbloquee
      this.cargando = false;
    });
  }

  borrarReserva(id: number) {
    if (confirm("¿Estás seguro de que quieres cancelar esta reserva?")) {
      this.http.delete(`http://localhost:8080/api/reservas/${id}`).subscribe({
        next: () => {
          this.cargarDatos();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al borrar reserva:", err);
          alert("Error al borrar la reserva");
        }
      });
    }
  }
}
