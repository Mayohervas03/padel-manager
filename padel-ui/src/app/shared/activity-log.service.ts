import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api.config';

export interface ActivityLog {
  readonly id: number;
  readonly timestamp: string;
  readonly action: string;
  readonly entity: string;
  readonly entityId?: number;
  readonly details: string;
  readonly usuario: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly storageKey = 'padel_admin_logs';
  private nextId = 1;
  readonly logs = signal<ActivityLog[]>([]);

  constructor() {
    this.loadLogs();
    this.syncFromBackend();
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as ActivityLog[];
        this.logs.set(parsed);
        this.nextId = parsed.length > 0 ? Math.max(...parsed.map(l => l.id)) + 1 : 1;
      }
    } catch {
      this.logs.set([]);
    }
  }

  private saveLogs() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.logs()));
  }

  private syncFromBackend() {
    this.http.get<ActivityLog[]>(`${this.apiUrl}/admin/logs`).subscribe({
      next: (data) => {
        this.logs.set(data);
        this.nextId = data.length > 0 ? Math.max(...data.map(l => l.id)) + 1 : 1;
        this.saveLogs();
      },
      error: () => {
        // Fallback: mantener localStorage si backend no disponible
      }
    });
  }

  log(action: string, entity: string, details: string, entityId?: number) {
    const usuario = localStorage.getItem('padel_user_name') || 'Admin';
    const newLog: ActivityLog = {
      id: this.nextId++,
      timestamp: new Date().toISOString(),
      action,
      entity,
      entityId,
      details,
      usuario
    };

    this.logs.update(current => [newLog, ...current].slice(0, 1000));
    this.saveLogs();

    // Sync to backend
    this.http.post(`${this.apiUrl}/admin/logs`, {
      action,
      entityType: entity,
      details,
      entityId
    }).subscribe({
      error: () => {
        // Silently fail; log is already saved locally
      }
    });
  }

  clearLogs() {
    this.http.delete(`${this.apiUrl}/admin/logs`).subscribe({
      next: () => {
        this.logs.set([]);
        localStorage.removeItem(this.storageKey);
        this.nextId = 1;
      },
      error: () => {
        // Fallback: clear local only
        this.logs.set([]);
        localStorage.removeItem(this.storageKey);
        this.nextId = 1;
      }
    });
  }

  getFilteredLogs(filtro: string): ActivityLog[] {
    const q = filtro.toLowerCase();
    if (!q) return this.logs();

    return this.logs().filter(log =>
      log.action.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.usuario.toLowerCase().includes(q)
    );
  }
}
