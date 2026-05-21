import { Injectable, signal } from '@angular/core';
import { extractErrorMessage } from './error-utils';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  readonly id: number;
  readonly message: string;
  readonly type: ToastType;
  readonly duration: number;
}

let nextId = 1;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly _notifications = signal<Toast[]>([]);
  readonly notifications = this._notifications.asReadonly();

  // Deduplicacion: evita toasts duplicados dentro de una ventana de tiempo
  private readonly recentMessages = new Map<string, number>();
  private readonly dedupWindowMs = 3000;

  private isDuplicate(message: string): boolean {
    const now = Date.now();

    // Limpiar mensajes antiguos
    for (const [msg, time] of this.recentMessages.entries()) {
      if (now - time > this.dedupWindowMs) {
        this.recentMessages.delete(msg);
      }
    }

    // Si el mensaje ya existe en la ventana, es duplicado
    if (this.recentMessages.has(message)) {
      return true;
    }

    // Registrar nuevo mensaje
    this.recentMessages.set(message, now);
    return false;
  }

  private add(message: string, type: ToastType, duration = 4000): void {
    if (this.isDuplicate(message)) {
      return;
    }

    const id = nextId++;
    const toast: Toast = { id, message, type, duration };

    this._notifications.update(current => {
      const trimmed = current.length >= 4 ? current.slice(1) : current;
      return [...trimmed, toast];
    });

    setTimeout(() => this.remove(id), duration);
  }

  success(message: string, duration?: number): void {
    this.add(message, 'success', duration);
  }

  /**
   * Acepta un string directo o un objeto de error HTTP (err.error, err, etc.).
   * Normaliza automaticamente los mensajes de validacion del backend.
   */
  error(messageOrError: string | any, duration?: number): void {
    const msg = typeof messageOrError === 'string'
      ? messageOrError
      : extractErrorMessage(messageOrError);
    this.add(msg, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.add(message, 'info', duration);
  }

  remove(id: number): void {
    this._notifications.update(current => current.filter(t => t.id !== id));
  }
}
