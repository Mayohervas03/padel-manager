import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import type { LoginRequest } from '../shared/models';
import { extractErrorMessage } from '../shared/error-utils';

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

  readonly credentials = signal<LoginRequest>({ email: '', password: '', rememberMe: false });
  readonly errorMessage = signal('');
  readonly sessionExpiredMessage = signal('');
  readonly cargando = signal(false);
  readonly showPassword = signal(false);

  ngOnInit() {
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
    this.cargando.set(true);

    this.authService.login(creds).subscribe({
      next: () => {
        this.cargando.set(false);
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      }
    });
  }
}
