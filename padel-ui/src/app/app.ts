import { Component, signal, ChangeDetectionStrategy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastContainerComponent } from './shared/toast/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly hideNavbar = signal(false);
  readonly showMobileMenu = signal(false);
  readonly isScrolled = signal(false);
  readonly nombre = toSignal(this.authService.nombre$);

  constructor() {
    this.router.events.subscribe(() => {
      const url = this.router.url;
      this.hideNavbar.set(
        url.startsWith('/admin') || url === '/login' || url === '/register'
      );
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  logout() {
    this.authService.logoutAndRedirect();
  }
}
