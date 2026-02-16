import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IntinerarioComponent } from './intinerario.component';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('IntinerarioComponent', () => {
  let component: IntinerarioComponent;
  let fixture: ComponentFixture<IntinerarioComponent>;
  let mockInvitationService: jasmine.SpyObj<InvitationService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const mockData = {
    titulo: 'Itinerario del Evento',
    descripcion: 'Programa de actividades',
    details: [
      { id: '1', actividad: 'Llegada', hora: '18:00', fecha: '2025-12-01' },
      { id: '2', actividad: 'Cena', hora: '20:00', fecha: '2025-12-01' }
    ]
  };

  beforeEach(async () => {
    mockInvitationService = jasmine.createSpyObj('InvitationService', [
      'updateTableField',
      'updateTableFieldImagen',
      'getInvitacionIntinerario',
      'postNewIntinerario',
      'deleteIntinerario'
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['show']);

    mockInvitationService.updateTableField.and.returnValue(of({}));
    mockInvitationService.getInvitacionIntinerario.and.returnValue(of(mockData));
    mockInvitationService.postNewIntinerario.and.returnValue(of({}));
    mockInvitationService.deleteIntinerario.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [IntinerarioComponent],
      providers: [
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: NotificationService, useValue: mockNotificationService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(IntinerarioComponent);
    component = fixture.componentInstance;
    component.dataIntinerario = JSON.parse(JSON.stringify(mockData));
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

    it('should accept dataIntinerario input', () => {
      expect(component.dataIntinerario.details.length).toBe(2);
    });
  });

  describe('cargarDatosIntinerario', () => {
    it('should load data successfully', fakeAsync(() => {
      component.cargarDatosIntinerario();
      tick();

      expect(mockInvitationService.getInvitacionIntinerario).toHaveBeenCalledWith('test-event-id');
      expect(component.loading).toBeFalse();
    }));

    it('should show error on load failure', fakeAsync(() => {
      mockInvitationService.getInvitacionIntinerario.and.returnValue(
        throwError(() => ({ message: 'Load failed' }))
      );

      component.cargarDatosIntinerario();
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Hubo un error')
      );
    }));

    it('should not load if eventId is empty', () => {
      component.eventId = '';
      component.cargarDatosIntinerario();
      expect(mockInvitationService.getInvitacionIntinerario).not.toHaveBeenCalled();
    });
  });

  describe('Actividad editing', () => {
    it('should restore actividad correctly', () => {
      const item = { id: '1' };
      component.tempActividadIntMap['1'] = 'Original Actividad';
      
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Changed';

      component.restoreActividadInt(item, mockElement);

      expect(mockElement.innerText).toBe('Original Actividad');
      expect(component.editingActividadIntId).toBeNull();
    });
  });

  describe('Hora editing', () => {
    it('should restore hora correctly', () => {
      const item = { id: '1' };
      component.tempHoraIntMap['1'] = '18:00';
      
      const mockElement = document.createElement('div');
      mockElement.innerText = '19:00';

      component.restoreHoraInt(item, mockElement);

      expect(mockElement.innerText).toBe('18:00');
      expect(component.editingHoraIntId).toBeNull();
    });
  });

  describe('Fecha editing', () => {
    it('should restore fecha correctly', () => {
      const item = { id: '1' };
      component.tempFechaIntMap['1'] = '2025-12-01';
      
      const mockElement = document.createElement('div');
      mockElement.innerText = '2025-12-25';

      component.restoreFechaInt(item, mockElement);

      expect(mockElement.innerText).toBe('2025-12-01');
      expect(component.editingFechaIntId).toBeNull();
    });
  });

  describe('Backend updates', () => {
    it('should update backend successfully', fakeAsync(() => {
      component.updateBackend('IntinerarioDetails', 'Id', '1', 'Actividad', 'Test');
      tick();

      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'IntinerarioDetails', 'Id', '1', 'Actividad', 'Test'
      );
    }));

    it('should reload data after update when loadData is true', fakeAsync(() => {
      component.updateBackend('IntinerarioDetails', 'Id', '1', 'Actividad', 'Test', true);
      tick();

      expect(mockInvitationService.getInvitacionIntinerario).toHaveBeenCalled();
    }));

    it('should show error on backend update failure', fakeAsync(() => {
      mockInvitationService.updateTableField.and.returnValue(
        throwError(() => ({ message: 'Update failed' }))
      );

      component.updateBackend('IntinerarioDetails', 'Id', '1', 'Actividad', 'Test');
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Error al actualizar')
      );
    }));
  });

  describe('Key handling', () => {
    it('should blur on Enter key', () => {
      const mockElement = document.createElement('div');
      spyOn(mockElement, 'blur');
      
      const event = {
        key: 'Enter',
        shiftKey: false,
        target: mockElement,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.onKeyDown(event, {});

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockElement.blur).toHaveBeenCalled();
    });
  });

  describe('ReadOnly mode', () => {
    it('should accept isReadOnly input', () => {
      component.isReadOnly = true;
      expect(component.isReadOnly).toBeTrue();
    });
  });

  describe('Popup', () => {
    it('should have showPopup default to false', () => {
      expect(component.showPopup).toBeFalse();
    });
  });
});
