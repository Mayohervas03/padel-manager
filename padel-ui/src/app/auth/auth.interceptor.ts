import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('[AuthInterceptor] Peticion:', req.method, req.url);
  console.log('[AuthInterceptor] Token existe:', !!token);

  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('[AuthInterceptor] Header Authorization agregado');
    return next(clonedReq);
  }

  console.warn('[AuthInterceptor] No hay token, enviando peticion sin autenticacion');
  return next(req);
};
