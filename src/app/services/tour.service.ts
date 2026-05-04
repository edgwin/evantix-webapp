import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export type TourContext = 'invitacion' | 'dashboard' | 'invitados' | 'mesas';

const TOUR_STEPS: Record<TourContext, TourStep[]> = {
  invitacion: [
    {
      targetSelector: '.edit-imagePortada-btn',
      title: '📷 Cambiar Imagen de Fondo',
      description: 'Haz clic aquí para cambiar la imagen de fondo. Puedes subir varias imágenes y se mostrarán como carrusel.',
      position: 'bottom'
    },
    {
      targetSelector: '.position-adjust-btn',
      title: '⊕ Centrar Imagen',
      description: 'Ajusta el punto focal de tu imagen. Al activarlo, haz clic en el lugar exacto donde quieres que se centre la imagen. Esto es útil cuando tu foto se recorta y quieres asegurarte de que las caras o elementos importantes se vean correctamente.',
      position: 'bottom'
    },
    {
      targetSelector: '.editablePortadaTitulo',
      title: '✏️ Textos Editables',
      description: 'Los elementos con el ícono de lápiz son editables. Haz clic sobre el texto para modificarlo directamente.',
      position: 'bottom'
    },
    {
      targetSelector: '.edit-imageIndicaciones-btn',
      title: '🖼️ Imagen de Sección',
      description: 'Usa este botón para cambiar la imagen de fondo de esta sección. Cada sección puede tener su propia imagen.',
      position: 'bottom'
    },
    {
      targetSelector: '#tour-add-indicacion',
      title: '➕ Agregar Elementos',
      description: 'Puedes agregar más elementos a cada sección con estos botones.',
      position: 'bottom'
    },
    {
      targetSelector: '#tour-ver-ubicacion',
      title: '📍 Ver Ubicación',
      description: 'Tus invitados podrán ver la ubicación directamente en el mapa al hacer clic en este botón.',
      position: 'bottom'
    },
    {
      targetSelector: '#tour-editar-mapa',
      title: '🗺️ Editar Mapa',
      description: 'Usa este botón para editar la ubicación en el mapa. Puedes buscar una dirección o mover el marcador.',
      position: 'bottom'
    },
    {
      targetSelector: '#tour-ir-mesa',
      title: '🎁 Ir a la Mesa',
      description: 'Agrega el enlace a tu mesa de regalos para que tus invitados puedan acceder directamente.',
      position: 'bottom'
    },
    {
      targetSelector: '#tour-edit-data',
      title: '📝 Editar Información',
      description: 'Haz clic aquí para editar la información de cada persona: nombre, parentesco e imagen.',
      position: 'bottom'
    },
    {
      targetSelector: '#tour-agregar-fotos',
      title: '📸 Agregar Fotos',
      description: 'Selecciona múltiples fotos al mismo tiempo para agregarlas a tu galería. Mantén presionado Ctrl (o Cmd) para seleccionar varias.',
      position: 'bottom'
    },
    {
      targetSelector: '.musica-section',
      title: '🎵 Música de Fondo',
      description: 'Selecciona una categoría musical y elige la canción de fondo que sonará cuando tus invitados abran la invitación. Puedes previsualizarla con el botón Reproducir.',
      position: 'bottom'
    }
  ],

  dashboard: [
    {
      targetSelector: '#tour-nuevo-evento',
      title: '🎉 Crear un Evento',
      description: 'Haz clic aquí para crear un nuevo evento. Podrás configurar el nombre, fecha, tipo de evento y más.',
      position: 'bottom'
    },
    {
      targetSelector: '#tour-refresh-eventos',
      title: '🔄 Refrescar Lista',
      description: 'Usa este botón para actualizar la lista de eventos y ver los cambios más recientes.',
      position: 'bottom'
    },
    {
      targetSelector: '.eventos-grid',
      title: '📋 Tus Eventos',
      description: 'Aquí puedes ver todos tus eventos. Cada fila muestra el nombre, fecha, estatus de pago y el PIN de check-in.',
      position: 'top'
    },
    {
      targetSelector: '.pin-cell',
      title: '🔑 PIN de Check-In',
      description: 'Este PIN es necesario para registrar la asistencia de tus invitados el día del evento. Puedes copiarlo con el botón 📋.',
      position: 'top'
    },
    {
      targetSelector: '.actions-cell',
      title: '⚙️ Opciones del Evento',
      description: 'Desde aquí puedes: ✏️ Editar, 👁️ Ver Invitación, 🌐 Dominio Personalizado, 💳 Pagar y 🗑️ Eliminar tu evento.',
      position: 'top'
    }
  ],

  invitados: [
    {
      targetSelector: '#tour-event-selector',
      title: '📋 Seleccionar Evento',
      description: 'Selecciona el evento para el cual deseas gestionar invitados. Solo se muestran eventos con pago completado.',
      position: 'bottom'
    },
    {
      targetSelector: '#tour-alta-invitados',
      title: '👥 Alta de Invitados',
      description: 'Haz clic aquí para dar de alta un nuevo grupo de invitados. Puedes elegir entre invitación Familiar o Individual.',
      position: 'bottom'
    },
    {
      targetSelector: '#tour-exportar-csv',
      title: '📥 Exportar CSV',
      description: 'Descarga la lista completa de invitados en formato CSV. Incluye nombre, estatus, mesa asignada y notas especiales.',
      position: 'bottom'
    },
    {
      targetSelector: '.invitados-grid',
      title: '📊 Lista de Invitados',
      description: 'Aquí puedes ver todos los grupos de invitados. Haz clic en el botón + para expandir y ver a cada invitado del grupo.',
      position: 'top'
    }
  ],

  mesas: [
    {
      targetSelector: '#tour-mesa-event-selector',
      title: '📋 Seleccionar Evento',
      description: 'Selecciona el evento para configurar las mesas. Solo se muestran eventos con invitados confirmados.',
      position: 'bottom'
    },
    {
      targetSelector: '#tour-nueva-mesa',
      title: '🪑 Crear Mesa',
      description: 'Haz clic aquí para crear una nueva mesa. Define el nombre, cantidad de lugares y el orden de la mesa.',
      position: 'bottom'
    },
    {
      targetSelector: '.mesa-card',
      title: '📐 Tarjeta de Mesa',
      description: 'Cada tarjeta muestra los lugares ocupados, los invitados asignados y permite editar o eliminar la mesa.',
      position: 'top'
    },
    {
      targetSelector: '.invitado-dropdown',
      title: '➕ Asignar Invitados',
      description: 'Usa el desplegable para asignar invitados confirmados a cada mesa. Solo se muestran invitados no asignados a otra mesa.',
      position: 'top'
    }
  ]
};

@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly STORAGE_PREFIX = 'evantix_tour_dismissed_';

  private steps: TourStep[] = [];
  private activeContext: TourContext | null = null;

  private _currentStep = new BehaviorSubject<number>(-1);
  private _isActive = new BehaviorSubject<boolean>(false);
  private _dontShowAgain = false;

  currentStep$ = this._currentStep.asObservable();
  isActive$ = this._isActive.asObservable();

  get totalSteps(): number {
    return this.steps.length;
  }

  get currentStepIndex(): number {
    return this._currentStep.value;
  }

  get currentStepData(): TourStep | null {
    const idx = this._currentStep.value;
    return idx >= 0 && idx < this.steps.length ? this.steps[idx] : null;
  }

  get dontShowAgain(): boolean {
    return this._dontShowAgain;
  }

  set dontShowAgain(val: boolean) {
    this._dontShowAgain = val;
  }

  private storageKey(ctx: TourContext): string {
    return `${this.STORAGE_PREFIX}${ctx}`;
  }

  shouldShowTour(context?: TourContext): boolean {
    const ctx = context || this.activeContext;
    if (!ctx) return false;
    return localStorage.getItem(this.storageKey(ctx)) !== 'true';
  }

  /** Set up the tour for a specific page context and auto-start if not dismissed */
  startIfNeeded(context?: TourContext): void {
    const ctx = context || 'invitacion';
    this.setContext(ctx);
    if (this.shouldShowTour(ctx)) {
      this.start();
    }
  }

  /** Manually set the context and load its steps */
  setContext(context: TourContext): void {
    this.activeContext = context;
    this.steps = TOUR_STEPS[context] || [];
  }

  start(): void {
    this._currentStep.next(0);
    this._isActive.next(true);
    this._dontShowAgain = false;
  }

  next(): void {
    const nextIdx = this._currentStep.value + 1;
    if (nextIdx < this.steps.length) {
      this._currentStep.next(nextIdx);
    } else {
      this.complete();
    }
  }

  prev(): void {
    const prevIdx = this._currentStep.value - 1;
    if (prevIdx >= 0) {
      this._currentStep.next(prevIdx);
    }
  }

  skip(): void {
    this.complete();
  }

  private complete(): void {
    this._isActive.next(false);
    this._currentStep.next(-1);
    if (this._dontShowAgain && this.activeContext) {
      localStorage.setItem(this.storageKey(this.activeContext), 'true');
    }
  }
}
