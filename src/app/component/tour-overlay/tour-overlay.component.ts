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
  private activeScrollContainer: HTMLElement | null = null;

  constructor(public tourService: TourService) {}

  ngOnInit(): void {
    this.totalSteps = this.tourService.totalSteps;

    this.subs.push(
      this.tourService.isActive$.subscribe(active => {
        this.isActive = active;
        if (active) {
          this.totalSteps = this.tourService.totalSteps;
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

    // Find the scrollable container (e.g., .inv-scroll-container) or fall back to window
    const scrollContainer = this.getScrollableAncestor(target);
    this.activeScrollContainer = scrollContainer;

    // Temporarily allow scrolling so scrollTo works
    document.body.style.overflow = '';
    if (scrollContainer) {
      scrollContainer.style.overflow = 'auto';
    }

    // Calculate scroll position
    const vh = window.innerHeight;

    if (scrollContainer) {
      // Scroll inside the custom container
      const containerRect = scrollContainer.getBoundingClientRect();
      const elementRect = target.getBoundingClientRect();
      const elementOffsetInContainer = elementRect.top - containerRect.top + scrollContainer.scrollTop;
      let scrollTarget: number;

      if (step.position === 'top') {
        scrollTarget = elementOffsetInContainer - vh * 0.65;
      } else {
        scrollTarget = elementOffsetInContainer - vh * 0.25;
      }

      scrollContainer.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
    } else {
      // Fall back to window scroll
      const elementRect = target.getBoundingClientRect();
      const elementAbsoluteTop = elementRect.top + window.scrollY;
      let scrollTarget: number;

      if (step.position === 'top') {
        scrollTarget = elementAbsoluteTop - vh * 0.65;
      } else {
        scrollTarget = elementAbsoluteTop - vh * 0.25;
      }

      window.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
    }

    // Wait for scroll to settle, then position
    this.waitForScrollEnd(scrollContainer, () => {
      // Re-lock body scroll (the tour overlay prevents user interaction anyway)
      document.body.style.overflow = 'hidden';
      this.applyPosition(target, step.position);
    });
  }

  private waitForScrollEnd(scrollContainer: HTMLElement | null, callback: () => void): void {
    const getScrollY = () => scrollContainer ? scrollContainer.scrollTop : window.scrollY;
    let lastScrollY = getScrollY();
    let stableCount = 0;
    const check = () => {
      const currentY = getScrollY();
      if (currentY === lastScrollY) {
        stableCount++;
        if (stableCount >= 3) {
          // Scroll has settled
          callback();
          return;
        }
      } else {
        stableCount = 0;
        lastScrollY = currentY;
      }
      requestAnimationFrame(check);
    };
    // Start checking after a brief delay to let scroll begin
    setTimeout(() => check(), 100);
  }

  /** Find the nearest scrollable ancestor (e.g., .inv-scroll-container) */
  private getScrollableAncestor(el: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = el.parentElement;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      const overflowY = style.overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
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
