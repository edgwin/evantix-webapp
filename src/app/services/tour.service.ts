import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly STORAGE_KEY = 'evantix_tour_dismissed';

  private steps: TourStep[] = [
    {
      targetSelector: '.edit-imagePortada-btn',
      title: '📷 Cambiar Imagen de Fondo',
      description: 'Haz clic aquí para cambiar la imagen de fondo. Puedes subir varias imágenes y se mostrarán como carrusel.',
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
      description: 'Puedes agregar más elementos a cada sección con estos botones. La cantidad máxima depende de tu plan.',
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
  ];

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

  shouldShowTour(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== 'true';
  }

  startIfNeeded(): void {
    if (this.shouldShowTour()) {
      this.start();
    }
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
    if (this._dontShowAgain) {
      localStorage.setItem(this.STORAGE_KEY, 'true');
    }
  }
}
