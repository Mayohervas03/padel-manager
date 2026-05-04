import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import type { RegisterRequest } from '../shared/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = signal<RegisterRequest>({ nombre: '', email: '', password: '' });
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  onSubmit(): void {
    const u = this.user();
    if (!u.nombre || !u.email || !u.password) return;

    this.authService.register(u).subscribe({
      next: () => {
        this.successMessage.set('Registro exitoso. Redirigiendo al login...');
        this.errorMessage.set('');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        // El interceptor normaliza el error: err.error contiene el mensaje del backend
        this.errorMessage.set(err.error || 'Hubo un error en el registro. Es posible que el correo ya este en uso.');
        this.successMessage.set('');
      }
    });
  }
}
