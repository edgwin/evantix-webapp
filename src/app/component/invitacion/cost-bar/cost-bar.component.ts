import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingService, EventCostResponse } from '../../../services/pricing.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-cost-bar',
    imports: [CommonModule],
    template: `
    @if (!isReadOnly) {
      <div class="cost-bar">
        <div class="cost-bar-content">
          <div class="cost-label">
            <span class="cost-icon">💰</span>
            <span>Costo de tu invitación</span>
          </div>
          <div class="cost-right">
            @if (isLoading) {
              <div class="cost-loading">
                <div class="spinner"></div>
                <span class="loading-text">Actualizando...</span>
              </div>
            }
            <div class="cost-amount" [class.cost-changed]="costChanged" [class.cost-dimmed]="isLoading">
              {{ displayCost | currency:'MXN':'symbol-narrow':'1.0-0' }}
            </div>
            
            <a href="https://app.guidde.com/share/playbooks/3EVqqDEkLP7TgUtzNttQ3e?origin=DQHfpKkgpuNy4HQiHD3WmBpVAO12&mode=videoOnly" 
               target="_blank" class="tutorial-link" title="Ver Video Tutorial">
              <span class="tutorial-icon">🎬</span>
              <span class="tutorial-text">Video tutorial</span>
            </a>
          </div>
        </div>
      </div>
    }
    `,
    styles: [`
    .cost-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: linear-gradient(135deg, rgba(0,0,0,0.92), rgba(30,30,30,0.95));
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 2px solid var(--primary-color, #F14E95);
      padding: 12px 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .cost-bar-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
    }

    .cost-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255,255,255,0.85);
      font-family: var(--body-font, 'Work Sans', sans-serif);
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
      flex-shrink: 0;
    }

    .cost-icon {
      font-size: 18px;
    }

    /* Tutorial Link */
    .tutorial-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #7dd3e8;
      text-decoration: none;
      font-family: var(--body-font, 'Work Sans', sans-serif);
      font-size: 13px;
      font-weight: 600;
      padding: 6px 14px;
      background: rgba(125, 211, 232, 0.1);
      border: 1.5px solid rgba(125, 211, 232, 0.25);
      border-radius: 20px;
      transition: all 0.2s ease;
      white-space: nowrap;
      margin-left: 10px;
    }

    .tutorial-link:hover {
      background: rgba(125, 211, 232, 0.25);
      border-color: rgba(125, 211, 232, 0.6);
      transform: translateY(-1px);
      color: #fff;
      box-shadow: 0 4px 12px rgba(125, 211, 232, 0.2);
    }

    .tutorial-icon {
      font-size: 16px;
    }

    .cost-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cost-loading {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.2);
      border-top-color: var(--primary-color, #F14E95);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loading-text {
      font-family: var(--body-font, 'Work Sans', sans-serif);
      font-size: 12px;
      color: rgba(255,255,255,0.5);
      font-weight: 400;
    }

    .cost-amount {
      font-family: var(--body-font, 'Work Sans', sans-serif);
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      transition: all 0.4s ease;
    }

    .cost-dimmed {
      opacity: 0.4;
    }

    .cost-changed {
      animation: costPulse 0.6s ease;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes costPulse {
      0% { transform: scale(1); color: #fff; }
      30% { transform: scale(1.15); color: var(--primary-color, #F14E95); }
      100% { transform: scale(1); color: #fff; }
    }

    @media screen and (max-width: 600px) {
      .tutorial-text {
        display: none;
      }
      .tutorial-link {
        padding: 6px 10px;
        margin-left: 5px;
      }
      .cost-right {
        gap: 10px;
      }
    }

    @media screen and (max-width: 480px) {
      .cost-bar {
        padding: 8px 15px;
      }
      .cost-label {
        font-size: 10px;
        letter-spacing: 0.5px;
      }
      .cost-amount {
        font-size: 20px;
      }
      .loading-text {
        display: none;
      }
    }
    `]
})
export class CostBarComponent implements OnInit, OnDestroy {
  @Input() isReadOnly: boolean = false;
  cost: EventCostResponse | null = null;
  displayCost: number = 999;
  costChanged = false;
  isLoading = true; // Starts as loading
  private sub: Subscription | null = null;
  private loadingSub: Subscription | null = null;
  private previousCost: number | null = null;

  constructor(private pricingService: PricingService) { }

  ngOnInit(): void {
    // Subscribe to loading state from PricingService
    this.loadingSub = this.pricingService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    // When cost arrives, update display
    this.sub = this.pricingService.cost$.subscribe(cost => {
      if (cost && this.previousCost !== null && cost.totalCost !== this.previousCost) {
        this.costChanged = true;
        setTimeout(() => this.costChanged = false, 700);
      }
      this.cost = cost;
      this.displayCost = cost?.totalCost ?? 999;
      this.previousCost = cost?.totalCost ?? null;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.loadingSub?.unsubscribe();
  }
}
