import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import type { LoginRequest } from '../shared/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly credentials = signal<LoginRequest>({ email: '', password: '' });
  readonly errorMessage = signal('');
  readonly sessionExpiredMessage = signal('');

  ngOnInit() {
    // Verificar si venimos de una sesion expirada
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.sessionExpiredMessage.set(params['message']);
      }
    });
  }

  onSubmit(): void {
    const creds = this.credentials();
    if (!creds.email || !creds.password) return;

    this.errorMessage.set('');
    this.sessionExpiredMessage.set('');

    this.authService.login(creds).subscribe({
      next: () => {
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        // El interceptor normaliza el error: err.error contiene el mensaje del backend
        this.errorMessage.set(err.error || 'Credenciales invalidas. Por favor, intenta de nuevo.');
      }
    });
  }
}
