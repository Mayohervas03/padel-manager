import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from './notification.service';

/**
 * Interceptor global de errores HTTP.
 * 
 * Transforma las respuestas de error del backend (ErrorResponse JSON)
 * para que los componentes puedan acceder al mensaje de forma sencilla
 * a través de err.error (como string) o err.error.message (como objeto).
 * 
 * Además, detecta errores 401 (Unauthorized) y 403 (Forbidden) para
 * cerrar la sesión y redirigir al login automáticamente.
 * 
 * Estructura esperada del backend:
 * {
 *   timestamp: string,
 *   status: number,
 *   error: string,
 *   message: string,
 *   path: string
 * }
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Detectar sesión expirada o acceso no autorizado
      if (error.status === 401 || error.status === 403) {
        console.warn(`[ErrorInterceptor] Error ${error.status} detectado. Cerrando sesión...`);
        authService.logoutAndRedirect('Tu sesion ha expirado, por favor vuelve a entrar.');
        
        // Creamos un error específico para informar al componente
        const sessionError = {
          status: error.status,
          statusText: error.statusText,
          message: 'Tu sesion ha expirado. Por favor, inicia sesion de nuevo.',
          error: 'Tu sesion ha expirado. Por favor, inicia sesion de nuevo.',
          errorObject: {
            message: 'Tu sesion ha expirado. Por favor, inicia sesion de nuevo.',
            status: error.status,
            path: req.url,
            sessionExpired: true
          }
        };

        return throwError(() => sessionError);
      }

      let errorMessage = 'Ha ocurrido un error inesperado.';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente (red, etc.)
        errorMessage = error.error.message;
      } else if (error.error && typeof error.error === 'object') {
        // Error del backend con estructura JSON
        if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.error) {
          errorMessage = error.error.error;
        }
      } else if (typeof error.error === 'string') {
        // Error como string plano
        errorMessage = error.error;
      } else if (error.statusText) {
        errorMessage = error.statusText;
      }

      // Mostramos toast de error para feedback visual global
      notificationService.error(errorMessage, 5000);

      // Creamos un objeto de error estandarizado
      const standardizedError = {
        status: error.status,
        statusText: error.statusText,
        message: errorMessage,
        // Mantenemos compatibilidad: err.error será un string con el mensaje
        error: errorMessage,
        // Y también como objeto para quien use err.error.message
        errorObject: {
          message: errorMessage,
          status: error.status,
          path: error.error?.path || req.url
        }
      };

      return throwError(() => standardizedError);
    })
  );
};
