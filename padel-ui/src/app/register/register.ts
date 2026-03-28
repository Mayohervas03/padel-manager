import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: []
})
export class RegisterComponent {

  user = {
    nombre: '',
    email: '',
    password: ''
  };

  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.user.nombre || !this.user.email || !this.user.password) return;

    this.authService.register(this.user).subscribe({
      next: () => {
        this.successMessage = 'Registro exitoso. Redirigiendo al login...';
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = 'Hubo un error en el registro. Es posible que el correo ya esté en uso.';
        this.successMessage = '';
        console.error('Error in register', err);
      }
    });
  }
}
