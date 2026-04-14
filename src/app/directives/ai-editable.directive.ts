import { Directive, ElementRef, HostListener, Input, ComponentRef, ViewContainerRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { AiTextWidgetComponent } from '../component/ai-text-widget/ai-text-widget.component';

@Directive({
  selector: '[appAiEditable]',
  standalone: true
})
export class AiEditableDirective {
  @Input() aiSection: string = '';
  @Input() aiEventType: string = 'boda';
  @Input() maxLength: number = 50;
  @Input() aiReadOnly: boolean = false;
  @Input() aiEnabled: boolean = false;
  @Input() aiEventId: string = '';

  private widgetRef: ComponentRef<AiTextWidgetComponent> | null = null;
  private lockedTooltip: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private viewContainer: ViewContainerRef,
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) { }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.aiReadOnly) return;
    event.stopPropagation();

    if (!this.aiEnabled) {
      this.showLockedTooltip();
      return;
    }

    this.showWidget();
  }

  private showLockedTooltip(): void {
    // Si ya existe, cerrarlo
    if (this.lockedTooltip) {
      this.removeLockedTooltip();
      return;
    }

    const rect = this.el.nativeElement.getBoundingClientRect();

    this.lockedTooltip = document.createElement('div');
    this.lockedTooltip.innerHTML = '🔒 Habilita <b>"Sugerencias con IA"</b> para usar esta función<br>al final de la página';
    this.lockedTooltip.style.cssText = `
      position: absolute;
      top: ${rect.bottom + window.scrollY + 8}px;
      left: ${rect.left + rect.width / 2 + window.scrollX}px;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.85);
      color: #fff;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      z-index: 1050;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      pointer-events: none;
      animation: fadeIn 0.2s ease;
    `;
    document.body.appendChild(this.lockedTooltip);

    // Auto cerrar después de 3 segundos
    setTimeout(() => this.removeLockedTooltip(), 3000);
  }

  private removeLockedTooltip(): void {
    if (this.lockedTooltip) {
      this.lockedTooltip.remove();
      this.lockedTooltip = null;
    }
  }

  private showWidget(): void {
    // Si ya existe un widget, cerrarlo primero
    if (this.widgetRef) {
      this.closeWidget();
      return;
    }

    // Crear el componente
    this.widgetRef = createComponent(AiTextWidgetComponent, {
      environmentInjector: this.injector,
      elementInjector: this.viewContainer.injector
    });

    // Configurar el componente
    const element = this.el.nativeElement;
    const rect = element.getBoundingClientRect();
    const tituloEl = element.closest('.card-content')?.querySelector('.card-title');
    const currentText = tituloEl?.textContent?.trim() || element.textContent || element.value || '';

    this.widgetRef.instance.section = this.aiSection;
    this.widgetRef.instance.currentText = currentText;
    this.widgetRef.instance.eventType = this.aiEventType;
    this.widgetRef.instance.maxLength = this.maxLength;
    this.widgetRef.instance.eventId = this.aiEventId;
    this.widgetRef.instance.position = {
      top: rect.bottom + window.scrollY + 10,
      left: rect.left + rect.width / 2 + window.scrollX
    };

    // Escuchar eventos
    this.widgetRef.instance.textGenerated.subscribe((newText: string) => {
      this.updateElementText(newText);
      this.focusElement();
    });

    this.widgetRef.instance.close.subscribe(() => {
      this.closeWidget();
    });

    // Agregar al DOM
    document.body.appendChild(this.widgetRef.location.nativeElement);
    this.appRef.attachView(this.widgetRef.hostView);
  }

  private updateElementText(newText: string): void {
    const element = this.el.nativeElement;

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.value = newText;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      element.textContent = newText;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  private focusElement(): void {
    const element = this.el.nativeElement;

    setTimeout(() => {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.focus();
        const length = element.value.length;
        element.setSelectionRange(length, length);
      } else if (element.isContentEditable) {
        element.focus();

        const range = document.createRange();
        const selection = window.getSelection();

        range.selectNodeContents(element);
        range.collapse(false);

        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        element.focus();
      }

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }, 100);
  }

  private closeWidget(): void {
    if (this.widgetRef) {
      this.appRef.detachView(this.widgetRef.hostView);
      this.widgetRef.destroy();
      this.widgetRef = null;
    }
  }

  ngOnDestroy(): void {
    this.closeWidget();
    this.removeLockedTooltip();
  }
}