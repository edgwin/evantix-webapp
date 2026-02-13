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

  private widgetRef: ComponentRef<AiTextWidgetComponent> | null = null;

  constructor(
    private el: ElementRef,
    private viewContainer: ViewContainerRef,
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.aiReadOnly) return;
    event.stopPropagation();
    this.showWidget();
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
    const currentText = element.textContent || element.value || '';

    this.widgetRef.instance.section = this.aiSection;
    this.widgetRef.instance.currentText = currentText;
    this.widgetRef.instance.eventType = this.aiEventType;
    this.widgetRef.instance.maxLength = this.maxLength;
    this.widgetRef.instance.position = {
      top: rect.bottom + window.scrollY + 10,
      left: rect.left + rect.width / 2 + window.scrollX
    };

    // Escuchar eventos
    this.widgetRef.instance.textGenerated.subscribe((newText: string) => {
      this.updateElementText(newText);
      this.focusElement(); // NUEVO: enfocar después de actualizar
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

  // NUEVO: Método para enfocar el elemento y colocar el cursor al final
  private focusElement(): void {
    const element = this.el.nativeElement;
    
    // Pequeño delay para asegurar que el DOM se haya actualizado
    setTimeout(() => {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        // Para inputs y textareas
        element.focus();
        // Colocar el cursor al final
        const length = element.value.length;
        element.setSelectionRange(length, length);
      } else if (element.isContentEditable) {
        // Para elementos contenteditable (div, h1, h2, etc.)
        element.focus();
        
        // Colocar el cursor al final del contenido
        const range = document.createRange();
        const selection = window.getSelection();
        
        // Seleccionar todo el contenido del elemento
        range.selectNodeContents(element);
        // Colapsar la selección al final
        range.collapse(false);
        
        // Aplicar la selección
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        // Para otros elementos, simplemente enfocar
        element.focus();
      }
      
      // Hacer scroll suave hacia el elemento si está fuera de la vista
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
  }
}