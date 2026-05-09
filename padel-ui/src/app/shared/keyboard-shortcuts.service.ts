import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  modifiers?: ('ctrl' | 'alt' | 'shift')[];
  preventDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutsService implements OnDestroy {
  private readonly router = inject(Router);
  private readonly shortcuts = new Map<string, KeyboardShortcut>();
  private readonly handler = this.handleKeydown.bind(this);
  private readonly sequenceTimeout = 1000;
  private sequenceBuffer = '';
  private sequenceTimer: any = null;

  readonly showHelp = signal(false);

  constructor() {
    this.registerDefaults();
    document.addEventListener('keydown', this.handler);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handler);
  }

  private registerDefaults() {
    // Navegación rápida con g + tecla
    this.register('g+d', 'Ir al Dashboard (Agenda)', () => {
      this.router.navigate(['/admin/dashboard']);
    });
    this.register('g+u', 'Ir a Usuarios', () => {
      this.router.navigate(['/admin/usuarios']);
    });
    this.register('g+p', 'Ir a Productos', () => {
      this.router.navigate(['/admin/productos']);
    });
    this.register('g+t', 'Ir a Torneos', () => {
      this.router.navigate(['/admin/torneos']);
    });
    this.register('g+s', 'Ir a Estadísticas', () => {
      this.router.navigate(['/admin/stats']);
    });
    this.register('g+l', 'Ir a Historial', () => {
      this.router.navigate(['/admin/logs']);
    });

    // Ayuda
    this.register('?', 'Mostrar/Ocultar ayuda de atajos', () => {
      this.showHelp.update(v => !v);
    });
  }

  register(key: string, description: string, action: () => void, options?: { modifiers?: ('ctrl' | 'alt' | 'shift')[]; preventDefault?: boolean }) {
    this.shortcuts.set(key.toLowerCase(), {
      key,
      description,
      action,
      modifiers: options?.modifiers,
      preventDefault: options?.preventDefault ?? true
    });
  }

  unregister(key: string) {
    this.shortcuts.delete(key.toLowerCase());
  }

  private handleKeydown(event: KeyboardEvent) {
    // No interceptar si el usuario está escribiendo en un input/textarea
    if (this.isInputActive(event.target)) {
      if (event.key === 'Escape') {
        // Cerrar dropdowns al presionar ESC en inputs también
        this.closeDropdowns();
      }
      return;
    }

    const key = event.key.toLowerCase();

    // ESC cierra todo
    if (key === 'escape') {
      this.closeDropdowns();
      this.showHelp.set(false);
      return;
    }

    // Atajos con modificadores
    if (event.ctrlKey || event.altKey || event.metaKey) {
      const combo = this.buildCombo(event);
      const shortcut = this.shortcuts.get(combo);
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }

    // Atajos de secuencia (g + tecla)
    if (key === 'g') {
      this.sequenceBuffer = 'g';
      this.resetSequenceTimer();
      return;
    }

    if (this.sequenceBuffer === 'g' && key.length === 1) {
      this.sequenceBuffer = `g+${key}`;
      const shortcut = this.shortcuts.get(this.sequenceBuffer);
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
      this.sequenceBuffer = '';
      clearTimeout(this.sequenceTimer);
      return;
    }

    // Atajo simple
    if (key === '?') {
      event.preventDefault();
      this.showHelp.update(v => !v);
      return;
    }

    // Reset sequence buffer
    if (this.sequenceBuffer) {
      this.sequenceBuffer = '';
      clearTimeout(this.sequenceTimer);
    }
  }

  private buildCombo(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    parts.push(event.key.toLowerCase());
    return parts.join('+');
  }

  private resetSequenceTimer() {
    clearTimeout(this.sequenceTimer);
    this.sequenceTimer = setTimeout(() => {
      this.sequenceBuffer = '';
    }, this.sequenceTimeout);
  }

  private isInputActive(target: EventTarget | null): boolean {
    if (!target) return false;
    const element = target as HTMLElement;
    return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.isContentEditable;
  }

  private closeDropdowns() {
    // Emitir evento para que los componentes cierren sus dropdowns
    document.dispatchEvent(new CustomEvent('admin:close-dropdowns'));
  }

  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }
}
