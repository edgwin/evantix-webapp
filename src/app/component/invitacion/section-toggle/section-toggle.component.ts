import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-section-toggle',
    imports: [CommonModule],
    template: `
    <!-- Wrapper principal: siempre muestra el contenido -->
    @if (!isReadOnly || isEnabled) {
      <div class="section-wrapper">
        <!-- Barra de quitar (solo cuando habilitada y no es base) -->
        @if (isEnabled && !isReadOnly && !enabledByDefault) {
          <div class="section-remove-bar">
            <button class="remove-section-btn" (click)="onRemove()" [disabled]="loading">
              @if (!loading) {
                <span>✕</span>
                @if (!pricingLoading) {
                  <span>Quitar {{ sectionName }} (-{{ enableCost | currency:'MXN':'symbol-narrow':'1.0-0' }})</span>
                }
                @if (pricingLoading) {
                  <span class="btn-loading">
                    <span class="mini-spinner"></span>
                    Cargando...
                  </span>
                }
              }
              @if (loading) {
                <span class="mini-spinner"></span>
                <span>Quitando...</span>
              }
            </button>
          </div>
        }
        <!-- Contenido de la sección (siempre visible) -->
        <div class="section-content-area" [class.disabled-blur]="!isEnabled && !isReadOnly">
          <ng-content></ng-content>
        </div>
        <!-- Overlay translúcido cuando deshabilitada -->
        @if (!isEnabled && !isReadOnly) {
          <div class="section-disabled-curtain">
            <div class="curtain-content">
              <span class="curtain-icon">🔒</span>
              <h3 class="curtain-title">{{ sectionName }}</h3>
              <p class="curtain-desc">Agrega esta sección a tu invitación</p>
              <button class="enable-section-btn" (click)="onEnable()" [disabled]="loading || pricingLoading">
                @if (loading) {
                  Activando...
                }
                @if (!loading && pricingLoading) {
                  <span class="mini-spinner white"></span>
                  Cargando precio...
                }
                @if (!loading && !pricingLoading) {
                  Habilitar (+{{ enableCost | currency:'MXN':'symbol-narrow':'1.0-0' }})
                }
              </button>
            </div>
          </div>
        }
      </div>
    }
    `,
    styles: [`
    .section-wrapper {
      position: relative;
    }

    /* Prevent overlapping cards when multiple sections are disabled */
    .section-wrapper:has(.section-disabled-curtain) {
      min-height: 380px;
    }

    /* === Remove bar === */
    .section-remove-bar {
      display: flex;
      justify-content: flex-end;
      padding: 8px 20px;
      background: rgba(0,0,0,0.03);
    }

    .remove-section-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      font-family: var(--body-font, 'Work Sans', sans-serif);
      font-size: 12px;
      font-weight: 600;
      color: #dc3545;
      background: rgba(220, 53, 69, 0.08);
      border: 1px solid rgba(220, 53, 69, 0.2);
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .remove-section-btn:hover:not(:disabled) {
      background: rgba(220, 53, 69, 0.15);
      border-color: rgba(220, 53, 69, 0.4);
    }

    .remove-section-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* === Content area === */
    .section-content-area {
      position: relative;
      transition: filter 0.4s ease;
    }

    .section-content-area.disabled-blur {
      filter: blur(1px);
      pointer-events: none;
      user-select: none;
      max-height: 600px;
      overflow: hidden;
    }

    .section-content-area.disabled-blur::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 80px;
      background: linear-gradient(to bottom, transparent, var(--bg-color, #fff));
      pointer-events: none;
    }

    /* === Disabled curtain overlay === */
    .section-disabled-curtain {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(1px);
      -webkit-backdrop-filter: blur(1px);
      z-index: 10;
      border-radius: var(--border-radius, 8px);
    }

    .curtain-content {
      text-align: center;
      padding: 30px;
      background: rgba(255, 255, 255, 0.85);
      border-radius: var(--border-radius, 12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.6);
      max-width: 320px;
    }

    .curtain-icon {
      font-size: 40px;
      display: block;
      margin-bottom: 12px;
    }

    .curtain-title {
      font-family: var(--body-font, 'Work Sans', sans-serif);
      font-size: 20px;
      font-weight: 600;
      color: var(--text-color, #333);
      margin: 0 0 6px 0;
    }

    .curtain-desc {
      font-family: var(--body-font, 'Work Sans', sans-serif);
      font-size: 14px;
      color: var(--text-light-color, #888);
      margin: 0 0 16px 0;
    }

    .enable-section-btn {
      padding: 12px 28px;
      font-family: var(--body-font, 'Work Sans', sans-serif);
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      background: var(--primary-color, #F14E95);
      border: none;
      border-radius: var(--border-radius-lg, 30px);
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .enable-section-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .enable-section-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* === Shared === */
    .btn-loading {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .mini-spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(0,0,0,0.15);
      border-top-color: #dc3545;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .mini-spinner.white {
      border-color: rgba(255,255,255,0.3);
      border-top-color: #fff;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media screen and (max-width: 480px) {
      .curtain-content {
        padding: 20px;
        max-width: 260px;
      }

      .curtain-icon {
        font-size: 32px;
      }

      .curtain-title {
        font-size: 17px;
      }

      .enable-section-btn {
        padding: 10px 22px;
        font-size: 13px;
      }

      .section-wrapper:has(.section-disabled-curtain) {
        min-height: 320px;
      }
    }
    `]
})
export class SectionToggleComponent {
  @Input() sectionName: string = '';
  @Input() sectionKey: string = '';
  @Input() isEnabled: boolean = false;
  @Input() enableCost: number = 0;
  @Input() enabledByDefault: boolean = true;
  @Input() isReadOnly: boolean = false;
  @Input() loading: boolean = false;
  @Input() pricingLoading: boolean = false;

  @Output() enable = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  onEnable() {
    this.enable.emit(this.sectionKey);
  }

  onRemove() {
    this.remove.emit(this.sectionKey);
  }
}
