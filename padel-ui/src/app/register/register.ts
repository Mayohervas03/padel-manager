import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import type { RegisterRequest } from '../shared/models';
import { extractErrorMessage } from '../shared/error-utils';

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
  confirmPasswordValue = '';
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly cargando = signal(false);
  readonly showPassword = signal(false);

  get confirmPassword(): string {
    return this.confirmPasswordValue;
  }
  set confirmPassword(value: string) {
    this.confirmPasswordValue = value;
  }

  passwordStrength(): number {
    const p = this.user().password || '';
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }

  passwordStrengthLabel(): string {
    const s = this.passwordStrength();
    if (s <= 2) return 'Débil';
    if (s <= 3) return 'Media';
    if (s <= 4) return 'Fuerte';
    return 'Muy fuerte';
  }

  passwordStrengthClass(): string {
    const s = this.passwordStrength();
    if (s <= 2) return 'weak';
    if (s <= 3) return 'medium';
    if (s <= 4) return 'strong';
    return 'very-strong';
  }

  passwordsMatch(): boolean {
    return this.user().password === this.confirmPasswordValue;
  }

  onSubmit(): void {
    const u = this.user();
    if (!u.nombre || !u.email || !u.password || !this.passwordsMatch()) return;

    this.cargando.set(true);
    this.authService.register(u).subscribe({
      next: () => {
        this.cargando.set(false);
        this.successMessage.set('Registro exitoso. Redirigiendo al login...');
        this.errorMessage.set('');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMessage.set(extractErrorMessage(err));
        this.successMessage.set('');
      }
    });
  }
}
