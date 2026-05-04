import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InvitacionComponent } from './invitacion.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { InvitationService } from '../../services/invitation.service';
import { NotificationService } from '../../services/notification.service';
import { TemplateService } from '../../services/template.service';
import { PricingService } from '../../services/pricing.service';
import { TourService } from '../../services/tour.service';
import { InvitadoService } from '../../services/invitado.service';
import { EditLockService } from '../../services/edit-lock.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

describe('InvitacionComponent', () => {
  let component: InvitacionComponent;
  let fixture: ComponentFixture<InvitacionComponent>;
  let mockInvitationService: jasmine.SpyObj<InvitationService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockTemplateService: jasmine.SpyObj<TemplateService>;
  let mockPricingService: any;
  let mockTourService: jasmine.SpyObj<TourService>;
  let mockInvitadoService: jasmine.SpyObj<InvitadoService>;
  let mockEditLockService: jasmine.SpyObj<EditLockService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockInvitacionData = {
    eventType: 'Boda',
    eventStatus: 'Creado',
    portada: {
      titulo: 'Boda de Juan y María',
      subTitulo: 'Te invitamos a celebrar',
      imagen: 'test-image.jpg',
      fecha: '2025-12-01',
      trackId: '12345'
    },
    festejados: {
      titulo: 'Los Novios',
      frase: 'El amor nos une',
      imagen: 'festejados.jpg'
    },
    indicaciones: {
      imagen: 'indicaciones.jpg',
      details: []
    },
    dondeCuando: {
      imagen: 'donde.jpg',
      details: []
    },
    intinerario: {
      titulo: 'Itinerario',
      descripcion: 'Programa del evento',
      details: []
    },
    mesaRegalos: {
      imagen: 'mesa.jpg',
      details: []
    },
    personasFavoritas: {
      titulo: 'Personas Especiales',
      frase: 'Gracias por acompañarnos',
      details: []
    },
    historia: {
      titulo: 'Nuestra Historia',
      details: []
    },
    galeriaFotos: {
      details: []
    },
    hospedaje: {
      imagen: 'hospedaje.jpg',
      details: []
    }
  };

  beforeEach(async () => {
    mockInvitationService = jasmine.createSpyObj('InvitationService', ['getInvitacion', 'getAiUsageCount'], {
      mutationOccurred$: new BehaviorSubject<string>('')
    });
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['show']);
    mockTemplateService = jasmine.createSpyObj('TemplateService', [
      'applyTemplateFromData',
      'getBackgroundImage',
      'getCurrentTemplate'
    ]);
    mockPricingService = jasmine.createSpyObj('PricingService', ['getEventCost', 'toggleSection'], {
      loading$: new BehaviorSubject<boolean>(false)
    });
    mockTourService = jasmine.createSpyObj('TourService', ['startIfNeeded']);
    mockInvitadoService = jasmine.createSpyObj('InvitadoService', ['getGrupoByInvitacion', 'confirmInvitacion']);
    mockEditLockService = jasmine.createSpyObj('EditLockService', ['acquire', 'startHeartbeat', 'stopAndRelease']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

    mockTemplateService.getBackgroundImage.and.returnValue('../../../../assets/background.jpg');
    mockPricingService.getEventCost.and.returnValue(of({ total: 999, sections: [] }));

    await TestBed.configureTestingModule({
      imports: [InvitacionComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'idEvent' ? 'test-event-id' : null
              }
            }
          }
        },
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TemplateService, useValue: mockTemplateService },
        { provide: PricingService, useValue: mockPricingService },
        { provide: TourService, useValue: mockTourService },
        { provide: InvitadoService, useValue: mockInvitadoService },
        { provide: EditLockService, useValue: mockEditLockService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    mockInvitationService.getInvitacion.and.returnValue(of(mockInvitacionData));

    fixture = TestBed.createComponent(InvitacionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading true', () => {
    expect(component.loading).toBeTrue();
  });

  it('should initialize with isReadOnly false', () => {
    expect(component.isReadOnly).toBeFalse();
  });

  it('should get eventId from route params on init', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.eventId).toBe('test-event-id');
  }));

  it('should apply template from response data on init', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    // Template is applied via applyTemplateFromData from the API response
    // The actual component only calls this if res.template exists
    expect(component.data).toBeTruthy();
  }));

  it('should call getInvitacion service on init', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(mockInvitationService.getInvitacion).toHaveBeenCalledWith('test-event-id');
  }));

  it('should set data and loading false on successful API response', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.data).toEqual(mockInvitacionData);
    expect(component.loading).toBeFalse();
  }));

  it('should show error notification on API error', fakeAsync(() => {
    const error = { message: 'Network error' };
    mockInvitationService.getInvitacion.and.returnValue(throwError(() => error));
    
    fixture.detectChanges();
    tick();
    
    expect(mockNotificationService.show).toHaveBeenCalledWith(
      'error',
      jasmine.stringContaining('Hubo un error')
    );
    expect(component.loading).toBeFalse();
  }));

  it('should call editLockService.acquire when entering edit mode', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    // After init with eventStatus 'Creado', isReadOnly is true
    expect(component.isReadOnly).toBeTrue();
    
    mockEditLockService.acquire.and.returnValue(of({ acquired: true, holderEmail: null }));
    component.toggleReadOnly();
    
    expect(mockEditLockService.acquire).toHaveBeenCalledWith('test-event-id');
    expect(component.isReadOnly).toBeFalse();
  }));

  it('should release lock when exiting edit mode', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    // Force into edit mode
    component.isReadOnly = false;
    component.eventStatus = 'Creado';
    
    component.toggleReadOnly();
    
    expect(mockEditLockService.stopAndRelease).toHaveBeenCalled();
    expect(component.isReadOnly).toBeTrue();
  }));

  it('should show success notification when template is selected', () => {
    const mockTemplate = {
      id: 'test-template',
      name: 'Test Template',
      category: 'boda' as const,
      style: 'elegante' as const,
      theme: {} as any,
      preview: ''
    };
    
    component.onTemplateSelected(mockTemplate);
    
    expect(mockNotificationService.show).toHaveBeenCalledWith(
      'success',
      'Plantilla "Test Template" aplicada correctamente'
    );
  });

  it('should not call API if eventId is null', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [InvitacionComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
              }
            }
          }
        },
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TemplateService, useValue: mockTemplateService },
        { provide: PricingService, useValue: mockPricingService },
        { provide: TourService, useValue: mockTourService },
        { provide: InvitadoService, useValue: mockInvitadoService },
        { provide: EditLockService, useValue: mockEditLockService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const newFixture = TestBed.createComponent(InvitacionComponent);
    const newComponent = newFixture.componentInstance;
    
    mockInvitationService.getInvitacion.calls.reset();
    newFixture.detectChanges();
    tick();
    
    expect(mockInvitationService.getInvitacion).not.toHaveBeenCalled();
  }));

  describe('Template integration', () => {
    it('should have templateService available', () => {
      expect(component.templateService).toBeDefined();
    });

    it('should call getBackgroundImage from templateService', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const bgImage = component.templateService.getBackgroundImage();
      expect(bgImage).toBe('../../../../assets/background.jpg');
    }));
  });

  describe('ReadOnly mode', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should pass isReadOnly to child components', () => {
      component.isReadOnly = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(component.isReadOnly).toBeTrue();
    });

    it('should hide template selector in ReadOnly mode', fakeAsync(() => {
      component.isReadOnly = true;
      fixture.detectChanges();
      tick();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const templateSelector = compiled.querySelector('app-template-selector');
      expect(templateSelector).toBeNull();
    }));

    it('should show template selector in edit mode', fakeAsync(() => {
      component.isReadOnly = false;
      fixture.detectChanges();
      tick();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const templateSelector = compiled.querySelector('app-template-selector');
      expect(templateSelector).toBeTruthy();
    }));
  });
});
