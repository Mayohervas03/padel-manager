import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardShortcutsService } from '../../shared/keyboard-shortcuts.service';

@Component({
  selector: 'app-shortcuts-help',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shortcutsService.showHelp()) {
      <div class="shortcuts-overlay" (click)="shortcutsService.showHelp.set(false)">
        <div class="shortcuts-modal" (click)="$event.stopPropagation()">
          <div class="shortcuts-header">
            <h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h3>
            <button class="btn-close" (click)="shortcutsService.showHelp.set(false)" aria-label="Close help">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="shortcuts-body">
            <div class="shortcut-section">
              <h4>Quick Navigation</h4>
              <p class="section-desc">Press <strong>G</strong> followed by:</p>
              <div class="shortcut-list">
                <div class="shortcut-item">
                  <span class="key-combo">G > D</span>
                  <span class="key-desc">Dashboard (Schedule)</span>
                </div>
                <div class="shortcut-item">
                  <span class="key-combo">G > U</span>
                  <span class="key-desc">Users</span>
                </div>
                <div class="shortcut-item">
                  <span class="key-combo">G > P</span>
                  <span class="key-desc">Products</span>
                </div>
                <div class="shortcut-item">
                  <span class="key-combo">G > T</span>
                  <span class="key-desc">Tournaments</span>
                </div>
                <div class="shortcut-item">
                  <span class="key-combo">G > S</span>
                  <span class="key-desc">Statistics</span>
                </div>
                <div class="shortcut-item">
                  <span class="key-combo">G > L</span>
                  <span class="key-desc">History</span>
                </div>
              </div>
            </div>

            <div class="shortcut-section">
              <h4>General</h4>
              <div class="shortcut-list">
                <div class="shortcut-item">
                  <span class="key-combo">ESC</span>
                  <span class="key-desc">Close modals and dropdowns</span>
                </div>
                <div class="shortcut-item">
                  <span class="key-combo">?</span>
                  <span class="key-desc">Show/Hide this help</span>
                </div>
              </div>
            </div>
          </div>

          <div class="shortcuts-footer">
            <p>Press <strong>?</strong> at any time to view this help.</p>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .shortcuts-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }

    .shortcuts-modal {
      background: rgba(10, 25, 47, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      max-width: 500px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      animation: slideUp 0.3s ease;
    }

    .shortcuts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);

      h3 {
        margin: 0;
        color: #E6F1FF;
        font-family: 'Oswald', sans-serif;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        gap: 10px;

        i {
          color: #CCFF00;
        }
      }

      .btn-close {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #8892B0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #E6F1FF;
        }
      }
    }

    .shortcuts-body {
      padding: 24px;
    }

    .shortcut-section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        margin: 0 0 12px;
        color: #00D4FF;
        font-family: 'Oswald', sans-serif;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .section-desc {
        margin: 0 0 12px;
        color: #8892B0;
        font-size: 0.85rem;

        strong {
          color: #CCFF00;
        }
      }
    }

    .shortcut-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .shortcut-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .key-combo {
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      font-weight: 600;
      color: #CCFF00;
      background: rgba(204, 255, 0, 0.1);
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid rgba(204, 255, 0, 0.2);
    }

    .key-desc {
      font-size: 0.9rem;
      color: #E6F1FF;
    }

    .shortcuts-footer {
      padding: 16px 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      text-align: center;

      p {
        margin: 0;
        font-size: 0.8rem;
        color: #5C6B8A;

        strong {
          color: #CCFF00;
        }
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ShortcutsHelpComponent {
  readonly shortcutsService = inject(KeyboardShortcutsService);
}
