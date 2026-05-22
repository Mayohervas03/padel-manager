import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from './notification.service';
import { extractErrorMessage } from './error-utils';

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
      if (error.status === 401 || error.status === 403) {
        console.warn(`[ErrorInterceptor] Error ${error.status} detectado. Cerrando sesión...`);
        authService.logoutAndRedirect('Your session has expired, please log in again.');
        
        const sessionError = {
          status: error.status,
          statusText: error.statusText,
          message: 'Your session has expired. Please log in again.',
          error: 'Your session has expired. Please log in again.',
          errorObject: {
            message: 'Your session has expired. Please log in again.',
            status: error.status,
            path: req.url,
            sessionExpired: true
          }
        };

        return throwError(() => sessionError);
      }

      const errorMessage = extractErrorMessage(error);

      notificationService.error(errorMessage, 5000);

      const standardizedError = {
        status: error.status,
        statusText: error.statusText,
        message: errorMessage,
        error: errorMessage,
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
