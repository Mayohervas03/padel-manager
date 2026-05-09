import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Usuario } from '../models';

@Component({
  selector: 'app-editar-usuario-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-usuario-dialog.html',
  styleUrl: './editar-usuario-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditarUsuarioDialogComponent {
  readonly usuario = input.required<Usuario>();
  readonly guardar = output<Partial<Usuario>>();
  readonly cerrar = output<void>();

  readonly nombre = signal('');
  readonly email = signal('');
  readonly rol = signal<'ADMIN' | 'USER'>('USER');

  ngOnInit() {
    const u = this.usuario();
    this.nombre.set(u.nombre);
    this.email.set(u.email);
    this.rol.set(u.rol);
  }

  onGuardar() {
    this.guardar.emit({
      nombre: this.nombre(),
      email: this.email(),
      rol: this.rol()
    });
  }

  onCerrar() {
    this.cerrar.emit();
  }
}
