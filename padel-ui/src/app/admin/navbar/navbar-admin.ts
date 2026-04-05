import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar-admin.html',
  styleUrl: './navbar-admin.scss'
})
export class NavbarAdminComponent {
  showGestionDropdown = false;
  showUserDropdown = false;

  constructor(
    public authService: AuthService, 
    private el: ElementRef,
    private router: Router
  ) {}

  toggleGestion(event: Event) {
    event.stopPropagation();
    this.showGestionDropdown = !this.showGestionDropdown;
    this.showUserDropdown = false;
  }

  toggleUser(event: Event) {
    event.stopPropagation();
    this.showUserDropdown = !this.showUserDropdown;
    this.showGestionDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.showGestionDropdown = false;
      this.showUserDropdown = false;
    }
  }

  closeDropdowns() {
    this.showGestionDropdown = false;
    this.showUserDropdown = false;
  }

  logout() {
    this.authService.logout();
  }
}
