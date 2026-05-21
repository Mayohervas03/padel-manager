import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Toast, ToastType } from '../notification.service';

@Component({
  selector: 'app-toast-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-item toast-{{ toast.type }}" role="alert" aria-live="polite">
      <div class="toast-content">
        <span class="toast-icon" aria-hidden="true">{{ icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" (click)="onClose()" aria-label="Close notification">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="toast-progress">
        <div class="toast-progress-bar" [style.animation-duration.ms]="toast.duration"></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      animation: toastIn 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
    }

    :host(.removing) {
      animation: toastOut 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }

    .toast-item {
      min-width: 300px;
      max-width: 420px;
      background: rgba(10, 25, 47, 0.88);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.05);
      overflow: hidden;
      position: relative;
    }

    .toast-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      border-radius: 14px 0 0 14px;
    }

    .toast-success::before {
      background: #CCFF00;
      box-shadow: 0 0 12px rgba(204, 255, 0, 0.5);
    }

    .toast-error::before {
      background: #FF4D4D;
      box-shadow: 0 0 12px rgba(255, 77, 77, 0.5);
    }

    .toast-info::before {
      background: #00D4FF;
      box-shadow: 0 0 12px rgba(0, 212, 255, 0.5);
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 18px 14px;
    }

    .toast-icon {
      font-size: 1.3rem;
      flex-shrink: 0;
      line-height: 1;
    }

    .toast-success .toast-icon {
      color: #CCFF00;
      text-shadow: 0 0 10px rgba(204, 255, 0, 0.4);
    }

    .toast-error .toast-icon {
      color: #FF4D4D;
      text-shadow: 0 0 10px rgba(255, 77, 77, 0.4);
    }

    .toast-info .toast-icon {
      color: #00D4FF;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
    }

    .toast-message {
      flex: 1;
      color: #ffffff;
      font-family: 'Roboto', sans-serif;
      font-size: 0.92rem;
      font-weight: 400;
      line-height: 1.4;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .toast-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      font-size: 1.4rem;
      line-height: 1;
      cursor: pointer;
      padding: 0 0 2px;
      transition: color 0.2s, transform 0.2s;
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
    }

    .toast-close:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
      transform: scale(1.1);
    }

    .toast-progress {
      height: 3px;
      background: rgba(255, 255, 255, 0.06);
      position: relative;
    }

    .toast-progress-bar {
      height: 100%;
      width: 100%;
      transform-origin: left;
      animation: progress linear forwards;
    }

    .toast-success .toast-progress-bar {
      background: linear-gradient(90deg, rgba(204, 255, 0, 0.7), rgba(204, 255, 0, 0.3));
    }

    .toast-error .toast-progress-bar {
      background: linear-gradient(90deg, rgba(255, 77, 77, 0.7), rgba(255, 77, 77, 0.3));
    }

    .toast-info .toast-progress-bar {
      background: linear-gradient(90deg, rgba(0, 212, 255, 0.7), rgba(0, 212, 255, 0.3));
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateX(120%) scale(0.85);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @keyframes toastOut {
      from {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateX(120%) scale(0.85);
      }
    }

    @keyframes progress {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }

    @media (max-width: 640px) {
      .toast-item {
        min-width: unset;
        max-width: 92vw;
        width: 92vw;
      }

      .toast-content {
        padding: 14px 16px 12px;
      }

      .toast-message {
        font-size: 0.88rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastItemComponent {
  @Input({ required: true }) toast!: Toast;
  @Output() close = new EventEmitter<void>();

  get icon(): string {
    switch (this.toast.type) {
      case 'success': return '✓';
      case 'error': return '!';
      case 'info': return 'i';
      default: return 'i';
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
