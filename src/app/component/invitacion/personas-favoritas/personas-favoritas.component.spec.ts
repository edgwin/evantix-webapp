import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PersonasFavoritasComponent } from './personas-favoritas.component';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PersonasFavoritasComponent', () => {
  let component: PersonasFavoritasComponent;
  let fixture: ComponentFixture<PersonasFavoritasComponent>;
  let mockInvitationService: jasmine.SpyObj<InvitationService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const mockData = {
    titulo: 'Personas Especiales',
    frase: 'Gracias por acompañarnos',
    details: [
      { id: '1', nombre: 'Juan', parentesco: 'Padrino', imagen: 'juan.jpg' },
      { id: '2', nombre: 'María', parentesco: 'Madrina', imagen: 'maria.jpg' }
    ]
  };

  beforeEach(async () => {
    mockInvitationService = jasmine.createSpyObj('InvitationService', [
      'updateTableField',
      'updateTableFieldImagen',
      'getPersonasFavoritasData',
      'postNewPersonaFavorita',
      'deletePersonaFavorita'
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['show']);

    mockInvitationService.updateTableField.and.returnValue(of({}));
    mockInvitationService.updateTableFieldImagen.and.returnValue(of('new-image.jpg'));
    mockInvitationService.getPersonasFavoritasData.and.returnValue(of(mockData));
    mockInvitationService.postNewPersonaFavorita.and.returnValue(of({}));
    mockInvitationService.deletePersonaFavorita.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [PersonasFavoritasComponent],
      providers: [
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: NotificationService, useValue: mockNotificationService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonasFavoritasComponent);
    component = fixture.componentInstance;
    component.data = JSON.parse(JSON.stringify(mockData));
    component.eventId = 'test-event-id';
    component.eventType = 'Boda';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should have isReadOnly default to false', () => {
      expect(component.isReadOnly).toBeFalse();
    });

    it('should have loading default to false', () => {
      expect(component.loading).toBeFalse();
    });

    it('should have default height of 60vh', () => {
      expect(component.height).toBe('60vh');
    });

    it('should accept data input', () => {
      expect(component.data.details.length).toBe(2);
    });
  });

  describe('ngOnInit', () => {
    it('should initialize images from data details', () => {
      component.ngOnInit();
      expect(component.images.length).toBe(2);
      expect(component.showGallery).toBeTrue();
    });

    it('should hide gallery if no images', () => {
      component.data = { details: [] };
      component.ngOnInit();
      expect(component.showGallery).toBeFalse();
    });
  });

  describe('cargarDatosPF', () => {
    it('should load data successfully', fakeAsync(() => {
      component.cargarDatosPF();
      tick();

      expect(mockInvitationService.getPersonasFavoritasData).toHaveBeenCalledWith('test-event-id');
      expect(component.loading).toBeFalse();
    }));

    it('should show error on load failure', fakeAsync(() => {
      mockInvitationService.getPersonasFavoritasData.and.returnValue(
        throwError(() => ({ message: 'Load failed' }))
      );

      component.cargarDatosPF();
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Hubo un error')
      );
    }));

    it('should not load if eventId is empty', () => {
      component.eventId = '';
      component.cargarDatosPF();
      expect(mockInvitationService.getPersonasFavoritasData).not.toHaveBeenCalled();
    });
  });

  describe('Title editing', () => {
    it('should have editingTituloPF default to false', () => {
      expect(component.editingTituloPF).toBeFalse();
    });

    it('should store temp title', () => {
      component.tempTituloPF = 'Test Title';
      expect(component.tempTituloPF).toBe('Test Title');
    });
  });

  describe('Frase editing', () => {
    it('should have editingFrasePF default to false', () => {
      expect(component.editingFrasePF).toBeFalse();
    });

    it('should store temp frase', () => {
      component.tempFrasePF = 'Test Frase';
      expect(component.tempFrasePF).toBe('Test Frase');
    });
  });

  describe('Autoplay', () => {
    it('should have autoplay enabled by default', () => {
      expect(component.autoplayEnabled).toBeTrue();
    });

    it('should have default autoplay delay of 3000ms', () => {
      expect(component.autoplayDelay).toBe(3000);
    });
  });

  describe('Popup', () => {
    it('should have showPopup default to false', () => {
      expect(component.showPopup).toBeFalse();
    });

    it('should track current popup values', () => {
      component.currentImagen4Popup = 'test.jpg';
      component.currentNombre4Popup = 'Test Name';
      component.currentParentesco4Popup = 'Padrino';
      component.currentId4Popup = '123';

      expect(component.currentImagen4Popup).toBe('test.jpg');
      expect(component.currentNombre4Popup).toBe('Test Name');
      expect(component.currentParentesco4Popup).toBe('Padrino');
      expect(component.currentId4Popup).toBe('123');
    });
  });

  describe('Animation', () => {
    it('should have empty animation direction by default', () => {
      expect(component.animationDirection).toBe('');
    });
  });

  describe('ReadOnly mode', () => {
    it('should accept isReadOnly input', () => {
      component.isReadOnly = true;
      expect(component.isReadOnly).toBeTrue();
    });
  });

  describe('Loading images', () => {
    it('should track loading state per image', () => {
      component.loadingImgs['1'] = true;
      expect(component.loadingImgs['1']).toBeTrue();
      
      component.loadingImgs['1'] = false;
      expect(component.loadingImgs['1']).toBeFalse();
    });
  });
});
