import { Component, HostListener, ElementRef, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar-admin.html',
  styleUrl: './navbar-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarAdminComponent {
  private readonly el = inject(ElementRef);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly showGestionDropdown = signal(false);
  readonly showUserDropdown = signal(false);
  readonly nombre = toSignal(this.authService.nombre$);

  toggleGestion(event: Event) {
    event.stopPropagation();
    this.showGestionDropdown.update(v => !v);
    this.showUserDropdown.set(false);
  }

  toggleUser(event: Event) {
    event.stopPropagation();
    this.showUserDropdown.update(v => !v);
    this.showGestionDropdown.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.showGestionDropdown.set(false);
      this.showUserDropdown.set(false);
    }
  }

  closeDropdowns() {
    this.showGestionDropdown.set(false);
    this.showUserDropdown.set(false);
  }

  logout() {
    this.authService.logoutAndRedirect();
  }
}
