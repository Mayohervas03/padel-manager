import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PistaService } from './pista.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-pistas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pistas.html',
  styleUrl: './pistas.scss',
})
export class PistasComponent implements OnInit {
  pistaService = inject(PistaService);
  authService = inject(AuthService);
  cd = inject(ChangeDetectorRef);

  pistas: any[] = [];
  mostrarFormulario = false;

  nuevaPista: any = {
    id: null,
    nombre: '',
    tipo: 'Indoor',
    precio: 0
  };

  ngOnInit() {
    this.cargarPistas();
  }

  cargarPistas() {
    this.pistaService.getPistas().subscribe({
      next: (datos: any) => {
        this.pistas = datos;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando pistas:', err);
      }
    });
  }

  guardarPista() {
    if (this.nuevaPista.id) {
      this.pistaService.updatePista(this.nuevaPista.id, this.nuevaPista)
        .subscribe(() => {
          this.limpiarFormulario();
          this.cargarPistas();
        });
    } else {
      this.pistaService.createPista(this.nuevaPista)
        .subscribe(() => {
          this.limpiarFormulario();
          this.cargarPistas();
        });
    }
  }

  editarPista(pista: any) {
    this.nuevaPista = { ...pista };
    this.mostrarFormulario = true;
  }

  borrarPista(id: number) {
    if (window.confirm('¿Estás seguro de que deseas borrar esta pista?')) {
      this.pistaService.deletePista(id).subscribe(() => {
        this.cargarPistas();
      });
    }
  }

  toggleFormulario() {
    if (this.mostrarFormulario) {
      this.limpiarFormulario();
    } else {
      this.limpiarFormulario();
      this.mostrarFormulario = true;
    }
  }

  limpiarFormulario() {
    this.mostrarFormulario = false;
    this.nuevaPista = { id: null, nombre: '', tipo: 'Indoor', precio: 0 };
  }
}

