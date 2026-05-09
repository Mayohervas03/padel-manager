import { Component, HostListener, ElementRef, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { KeyboardShortcutsService } from '../../shared/keyboard-shortcuts.service';
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
  readonly keyboardShortcuts = inject(KeyboardShortcutsService);

  readonly showGestionDropdown = signal(false);
  readonly showUserDropdown = signal(false);
  readonly showMobileMenu = signal(false);
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

  toggleMobileMenu() {
    this.showMobileMenu.update(v => !v);
    // Prevenir scroll del body cuando el menú está abierto
    document.body.style.overflow = this.showMobileMenu() ? 'hidden' : '';
  }

  closeMobileMenu() {
    this.showMobileMenu.set(false);
    document.body.style.overflow = '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.showGestionDropdown.set(false);
      this.showUserDropdown.set(false);
    }
  }

  @HostListener('document:admin:close-dropdowns')
  onCloseDropdownsEvent() {
    this.showGestionDropdown.set(false);
    this.showUserDropdown.set(false);
  }

  @HostListener('window:resize')
  onResize() {
    // Cerrar menú móvil al redimensionar a desktop
    if (window.innerWidth > 768 && this.showMobileMenu()) {
      this.closeMobileMenu();
    }
  }

  closeDropdowns() {
    this.showGestionDropdown.set(false);
    this.showUserDropdown.set(false);
    this.closeMobileMenu();
  }

  showKeyboardHelp() {
    this.keyboardShortcuts.showHelp.set(true);
    this.closeDropdowns();
  }

  logout() {
    this.closeMobileMenu();
    this.authService.logoutAndRedirect();
  }
}
