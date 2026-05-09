import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../notification.service';
import { ToastItemComponent } from './toast-item.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastItemComponent],
  template: `
    @if (notifications().length > 0) {
      <div class="toast-container" role="region" aria-label="Notificaciones">
        @for (toast of notifications(); track toast.id) {
          <app-toast-item
            [toast]="toast"
            (close)="remove(toast.id)"></app-toast-item>
        }
      </div>
    }
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
      max-width: 100%;
    }

    app-toast-item {
      pointer-events: auto;
    }

    @media (max-width: 640px) {
      .toast-container {
        top: 16px;
        left: 50%;
        right: auto;
        transform: translateX(-50%);
        align-items: center;
        width: 100%;
        padding: 0 16px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  private readonly notificationService = inject(NotificationService);
  readonly notifications = this.notificationService.notifications;

  remove(id: number): void {
    this.notificationService.remove(id);
  }
}
