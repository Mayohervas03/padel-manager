import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Si hay un token pero está expirado, limpiamos la sesión
  if (authService.getToken()) {
    authService.logoutAndRedirect('Your session has expired, please log in again.');
    return false;
  }

  // Redirigir si no está autenticado
  router.navigate(['/login']);
  return false;
};
