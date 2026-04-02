import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourService } from '../../services/tour.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-tour-overlay',
    imports: [CommonModule, FormsModule],
    templateUrl: './tour-overlay.component.html',
    styleUrls: ['./tour-overlay.component.css']
})
export class TourOverlayComponent implements OnInit, OnDestroy {
  isActive = false;
  currentStep = -1;
  totalSteps = 0;
  title = '';
  description = '';
  tooltipStyle: { [key: string]: string } = {};
  spotlightStyle: { [key: string]: string } = {};
  arrowClass = '';
  showSpotlight = false;

  private subs: Subscription[] = [];

  constructor(public tourService: TourService) {}

  ngOnInit(): void {
    this.totalSteps = this.tourService.totalSteps;

    this.subs.push(
      this.tourService.isActive$.subscribe(active => {
        this.isActive = active;
        if (active) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      })
    );

    this.subs.push(
      this.tourService.currentStep$.subscribe(stepIdx => {
        this.currentStep = stepIdx;
        if (stepIdx >= 0) {
          this.positionTooltip();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    document.body.style.overflow = '';
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isActive && this.currentStep >= 0) {
      this.positionTooltip();
    }
  }

  private positionTooltip(): void {
    const step = this.tourService.currentStepData;
    if (!step) return;

    this.title = step.title;
    this.description = step.description;

    // Find target element
    const target = document.querySelector(step.targetSelector) as HTMLElement;
    if (!target || !this.isElementVisible(target)) {
      // Element not found or inside a disabled section — skip to next step
      this.showSpotlight = false;
      this.tourService.next();
      return;
    }

    // Temporarily allow scrolling so scrollIntoView works
    document.body.style.overflow = '';

    // Scroll element into view with offset based on where tooltip will appear
    // If tooltip goes above → scroll element to lower part of viewport
    // If tooltip goes below → scroll element to upper part of viewport
    const elementRect = target.getBoundingClientRect();
    const elementAbsoluteTop = elementRect.top + window.scrollY;
    const vh = window.innerHeight;
    let scrollTarget: number;

    if (step.position === 'top') {
      // Tooltip above: place element at ~65% of viewport height
      scrollTarget = elementAbsoluteTop - vh * 0.65;
    } else {
      // Tooltip below: place element at ~25% of viewport height
      scrollTarget = elementAbsoluteTop - vh * 0.25;
    }

    window.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });

    // Wait for scroll to settle, then position
    this.waitForScrollEnd(() => {
      // Re-lock scroll
      document.body.style.overflow = 'hidden';
      this.applyPosition(target, step.position);
    });
  }

  private waitForScrollEnd(callback: () => void): void {
    let lastScrollY = window.scrollY;
    let stableCount = 0;
    const check = () => {
      if (window.scrollY === lastScrollY) {
        stableCount++;
        if (stableCount >= 3) {
          // Scroll has settled
          callback();
          return;
        }
      } else {
        stableCount = 0;
        lastScrollY = window.scrollY;
      }
      requestAnimationFrame(check);
    };
    // Start checking after a brief delay to let scroll begin
    setTimeout(() => check(), 100);
  }

  private applyPosition(target: HTMLElement, preferredPosition: 'top' | 'bottom' | 'left' | 'right'): void {
    const rect = target.getBoundingClientRect();
    const padding = 8;

    // Spotlight
    this.showSpotlight = true;
    this.spotlightStyle = {
      'top': (rect.top - padding) + 'px',
      'left': (rect.left - padding) + 'px',
      'width': (rect.width + padding * 2) + 'px',
      'height': (rect.height + padding * 2) + 'px'
    };

    // Tooltip position
    const tooltipWidth = 340;
    const tooltipHeight = 260;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = 0;
    let left = 0;
    let arrow = '';

    const spaceBelow = vh - rect.bottom - padding;
    const spaceAbove = rect.top - padding;

    // Decide placement: prefer the requested position, but flip if not enough room
    let placeBelow: boolean;
    if (preferredPosition === 'bottom') {
      placeBelow = spaceBelow >= tooltipHeight + 20 || spaceBelow >= spaceAbove;
    } else {
      placeBelow = spaceAbove < tooltipHeight + 20;
    }

    if (placeBelow) {
      top = rect.bottom + padding + 12;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      arrow = 'arrow-top';
    } else {
      top = rect.top - padding - tooltipHeight - 12;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      arrow = 'arrow-bottom';
    }

    // Clamp to viewport
    if (left < 10) left = 10;
    if (left + tooltipWidth > vw - 10) left = vw - tooltipWidth - 10;
    if (top < 10) top = 10;
    if (top + tooltipHeight > vh - 10) top = vh - tooltipHeight - 10;

    this.tooltipStyle = {
      'top': top + 'px',
      'left': left + 'px',
      'transform': 'none'
    };
    this.arrowClass = arrow;
  }

  onNext(): void {
    this.tourService.next();
  }

  onPrev(): void {
    this.tourService.prev();
  }

  onSkip(): void {
    this.tourService.skip();
  }

  onOverlayClick(event: MouseEvent): void {
    // Don't close on overlay click — user must use buttons
    event.stopPropagation();
  }

  private isElementVisible(el: HTMLElement): boolean {
    // Check if element or any ancestor has the disabled-blur class (section-toggle disabled)
    let current: HTMLElement | null = el;
    while (current) {
      if (current.classList.contains('disabled-blur')) {
        return false;
      }
      current = current.parentElement;
    }
    // Also check if element has zero dimensions (hidden)
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }
}
