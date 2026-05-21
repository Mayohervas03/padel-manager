import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CompaneroEditData {
  id: number;
  jugadorNombre: string;
  nombreCompanero: string;
}

@Component({
  selector: 'app-editar-companero-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-companero-dialog.html',
  styleUrl: './editar-companero-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditarCompaneroDialogComponent {
  readonly data = input.required<CompaneroEditData>();
  readonly guardar = output<string>();
  readonly cerrar = output<void>();

  readonly nombreCompanero = signal('');

  ngOnInit() {
    this.nombreCompanero.set(this.data().nombreCompanero);
  }

  onGuardar() {
    this.guardar.emit(this.nombreCompanero().trim());
  }

  onCerrar() {
    this.cerrar.emit();
  }
}
