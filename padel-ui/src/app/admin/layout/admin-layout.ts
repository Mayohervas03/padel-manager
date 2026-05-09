import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { KeyboardShortcutsService } from '../../shared/keyboard-shortcuts.service';
import { NavbarAdminComponent } from '../navbar/navbar-admin';
import { ShortcutsHelpComponent } from '../shortcuts-help/shortcuts-help.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarAdminComponent, ShortcutsHelpComponent, ConfirmDialogComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly keyboardShortcuts = inject(KeyboardShortcutsService);

  ngOnInit() {
    // El servicio de atajos se inicializa automáticamente al inyectarse
  }

  logout() {
    this.authService.logoutAndRedirect();
  }
}
