import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pistas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pistas.html',
  styleUrl: './pistas.scss',
})
export class PistasComponent {
  http = inject(HttpClient);
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
    this.http.get('http://localhost:8080/api/pistas')
      .subscribe((datos: any) => {
        this.pistas = datos;
        this.cd.detectChanges();
      });
  }

  guardarPista() {
    this.http.post('http://localhost:8080/api/pistas', this.nuevaPista)
      .subscribe(() => {
        this.limpiarFormulario();
        this.cargarPistas();
      });
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

