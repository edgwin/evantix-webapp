import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GaleriaComponent } from './galeria.component';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('GaleriaComponent', () => {
  let component: GaleriaComponent;
  let fixture: ComponentFixture<GaleriaComponent>;
  let mockInvitationService: jasmine.SpyObj<InvitationService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const mockData = [
    { id: '1', imagen: 'foto1.jpg' },
    { id: '2', imagen: 'foto2.jpg' },
    { id: '3', imagen: 'foto3.jpg' }
  ];

  beforeEach(async () => {
    mockInvitationService = jasmine.createSpyObj('InvitationService', [
      'updateTableFieldImagen',
      'getGaleria',
      'postNewGaleria',
      'deleteGaleria'
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['show']);

    mockInvitationService.updateTableFieldImagen.and.returnValue(of('new-image.jpg'));
    mockInvitationService.getGaleria.and.returnValue(of(mockData));
    mockInvitationService.postNewGaleria.and.returnValue(of({}));
    mockInvitationService.deleteGaleria.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [GaleriaComponent],
      providers: [
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: NotificationService, useValue: mockNotificationService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(GaleriaComponent);
    component = fixture.componentInstance;
    component.data = JSON.parse(JSON.stringify(mockData));
    component.eventId = 'test-event-id';
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
      expect(component.data.length).toBe(3);
    });
  });

  describe('ngOnInit', () => {
    it('should initialize images from data', () => {
      component.ngOnInit();
      expect(component.images.length).toBe(3);
      expect(component.showGallery).toBeTrue();
    });

    it('should hide gallery if no images', () => {
      component.data = [];
      component.ngOnInit();
      expect(component.showGallery).toBeFalse();
    });
  });

  describe('cargarDatos', () => {
    it('should load data successfully', fakeAsync(() => {
      component.cargarDatos();
      tick();

      expect(mockInvitationService.getGaleria).toHaveBeenCalledWith('test-event-id');
      expect(component.loading).toBeFalse();
    }));

    it('should show error on load failure', fakeAsync(() => {
      mockInvitationService.getGaleria.and.returnValue(
        throwError(() => ({ message: 'Load failed' }))
      );

      component.cargarDatos();
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Hubo un error')
      );
    }));

    it('should not load if eventId is empty', () => {
      component.eventId = '';
      component.cargarDatos();
      expect(mockInvitationService.getGaleria).not.toHaveBeenCalled();
    });

    it('should show gallery if data has images', fakeAsync(() => {
      component.showGallery = false;
      component.cargarDatos();
      tick();

      expect(component.showGallery).toBeTrue();
    }));

    it('should hide gallery if no images returned', fakeAsync(() => {
      mockInvitationService.getGaleria.and.returnValue(of([]));
      component.cargarDatos();
      tick();

      expect(component.showGallery).toBeFalse();
    }));
  });

  describe('Autoplay', () => {
    it('should have autoplay enabled by default', () => {
      expect(component.autoplayEnabled).toBeTrue();
    });

    it('should have default autoplay delay of 3000ms', () => {
      expect(component.autoplayDelay).toBe(3000);
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
});
