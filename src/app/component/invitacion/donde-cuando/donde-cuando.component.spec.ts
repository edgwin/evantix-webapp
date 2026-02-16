import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DondeCuandoComponent } from './donde-cuando.component';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { FechasHelper } from '../../../helpers/fechas';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DondeCuandoComponent', () => {
  let component: DondeCuandoComponent;
  let fixture: ComponentFixture<DondeCuandoComponent>;
  let mockInvitationService: jasmine.SpyObj<InvitationService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockFechasHelper: jasmine.SpyObj<FechasHelper>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockData = {
    imagen: 'donde-cuando.jpg',
    details: [
      { 
        id: '1', 
        actividad: 'Ceremonia', 
        hora: '18:00', 
        fecha: '2025-12-01',
        lugar: 'Iglesia',
        direccion: 'Calle Principal 123',
        ubicacion: '19.4326,-99.1332',
        imagen: 'ceremonia.jpg'
      },
      { 
        id: '2', 
        actividad: 'Recepción', 
        hora: '20:00', 
        fecha: '2025-12-01',
        lugar: 'Salón de Fiestas',
        direccion: 'Av. Reforma 456',
        ubicacion: '19.4326,-99.1332',
        imagen: 'recepcion.jpg'
      }
    ]
  };

  beforeEach(async () => {
    mockInvitationService = jasmine.createSpyObj('InvitationService', [
      'updateTableField',
      'updateTableFieldImagen',
      'getInvitacionDondeCuando',
      'postNewDondeCuando',
      'deleteDondeCuando'
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['show']);
    mockFechasHelper = jasmine.createSpyObj('FechasHelper', ['formatearFechaHora']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockInvitationService.updateTableField.and.returnValue(of({}));
    mockInvitationService.updateTableFieldImagen.and.returnValue(of('new-image.jpg'));
    mockInvitationService.getInvitacionDondeCuando.and.returnValue(of(mockData));
    mockInvitationService.postNewDondeCuando.and.returnValue(of({}));
    mockInvitationService.deleteDondeCuando.and.returnValue(of({}));
    mockFechasHelper.formatearFechaHora.and.returnValue('01 de Diciembre 2025');

    await TestBed.configureTestingModule({
      imports: [DondeCuandoComponent],
      providers: [
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: FechasHelper, useValue: mockFechasHelper },
        { provide: MatDialog, useValue: mockDialog }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DondeCuandoComponent);
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

    it('should accept data input with details', () => {
      expect(component.data.details.length).toBe(2);
    });
  });

  describe('cargarDatos', () => {
    it('should load data successfully', fakeAsync(() => {
      component.cargarDatos();
      tick();

      expect(mockInvitationService.getInvitacionDondeCuando).toHaveBeenCalledWith('test-event-id');
      expect(component.loading).toBeFalse();
    }));

    it('should show error on load failure', fakeAsync(() => {
      mockInvitationService.getInvitacionDondeCuando.and.returnValue(
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
      expect(mockInvitationService.getInvitacionDondeCuando).not.toHaveBeenCalled();
    });
  });

  describe('Actividad editing', () => {
    it('should enable actividad editing on click', () => {
      component.onClickActividad('1');
      expect(component.editingActividadId).toBe('1');
      expect(component.tempActividadMap['1']).toBe('Ceremonia');
    });

    it('should update actividad on blur if changed', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Nueva Actividad';
      const event = { target: mockElement } as unknown as Event;
      const item = component.data.details[0];

      component.onActividadBlur(event, item);

      expect(item.actividad).toBe('Nueva Actividad');
      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'DondeCuandoDetails', 'Id', '1', 'Actividad', 'Nueva Actividad'
      );
    });

    it('should restore actividad correctly', () => {
      const item = { id: '1', actividad: 'Ceremonia' };
      component.tempActividadMap['1'] = 'Original Actividad';
      
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Changed';

      component.restoreActividad(item, mockElement);

      expect(mockElement.innerText).toBe('Original Actividad');
      expect(component.editingActividadId).toBeNull();
    });
  });

  describe('Hora editing', () => {
    it('should enable hora editing on click', () => {
      component.onClickHora('1');
      expect(component.editingHoraId).toBe('1');
      expect(component.tempHoraMap['1']).toBe('18:00');
    });

    it('should save hora correctly', () => {
      component.tempHora = '19:30';
      component.saveHora('1');

      expect(component.data.details[0].hora).toBe('19:30');
      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'DondeCuandoDetails', 'Id', '1', 'Hora', '19:30'
      );
    });

    it('should cancel hora editing', () => {
      component.editingHoraId = '1';
      component.cancelHora();
      expect(component.editingHoraId).toBeNull();
    });
  });

  describe('Fecha editing', () => {
    it('should enable fecha editing', () => {
      component.enableFecha('1');
      expect(component.editingFechaId).toBe('1');
      expect(component.tempFecha).toBe('2025-12-01');
    });

    it('should save fecha correctly', () => {
      component.tempFecha = '2025-12-25';
      component.saveFecha('1');

      expect(component.data.details[0].fecha).toBe('2025-12-25');
      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'DondeCuandoDetails', 'Id', '1', 'Fecha', '2025-12-25'
      );
    });

    it('should cancel fecha editing', () => {
      component.editingFechaId = '1';
      component.cancelFecha();
      expect(component.editingFechaId).toBeNull();
    });
  });

  describe('Lugar editing', () => {
    it('should enable lugar editing', () => {
      component.enableLugar('1');
      expect(component.editingLugarId).toBe('1');
      expect(component.tempLugar).toBe('Iglesia');
    });

    it('should save lugar correctly', () => {
      component.tempLugar = 'Catedral';
      component.saveLugar('1');

      expect(component.data.details[0].lugar).toBe('Catedral');
      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'DondeCuandoDetails', 'Id', '1', 'Lugar', 'Catedral'
      );
    });

    it('should cancel lugar editing', () => {
      component.editingLugarId = '1';
      component.cancelLugar();
      expect(component.editingLugarId).toBeNull();
    });
  });

  describe('Direccion editing', () => {
    it('should enable direccion editing', () => {
      component.enableDireccion('1');
      expect(component.editingDireccionId).toBe('1');
      expect(component.tempDireccion).toBe('Calle Principal 123');
    });

    it('should save direccion correctly', () => {
      component.tempDireccion = 'Nueva Direccion 456';
      component.saveDireccion('1');

      expect(component.data.details[0].direccion).toBe('Nueva Direccion 456');
      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'DondeCuandoDetails', 'Id', '1', 'Direccion', 'Nueva Direccion 456'
      );
    });
  });

  describe('CRUD operations', () => {
    it('should add new donde-cuando', fakeAsync(() => {
      component.nuevoDondeCuando();
      tick();

      expect(mockInvitationService.postNewDondeCuando).toHaveBeenCalledWith('test-event-id');
    }));

    it('should show error on add failure', fakeAsync(() => {
      mockInvitationService.postNewDondeCuando.and.returnValue(
        throwError(() => ({ message: 'Add failed' }))
      );

      component.nuevoDondeCuando();
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Hubo un error')
      );
    }));

    it('should delete donde-cuando item', fakeAsync(() => {
      component.triggerImageDelete('1');
      tick();

      expect(mockInvitationService.deleteDondeCuando).toHaveBeenCalledWith('1');
    }));
  });

  describe('Image upload', () => {
    it('should upload item image successfully', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      component.uploadImage('DondeCuandoDetails', 'Id', '1', 'Imagen', mockFile, '1');
      tick();

      expect(component.data.details[0].imagen).toBe('new-image.jpg');
      expect(component.loadingImgs['1']).toBeFalse();
    }));

    it('should upload background image successfully', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      component.uploadBKImage('DondeCuandoMaster', 'IdEvento', 'test-event-id', 'Imagen', mockFile);
      tick();

      expect(component.data.imagen).toBe('new-image.jpg');
      expect(component.loadingImg).toBeFalse();
    }));

    it('should show error on image upload failure', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      mockInvitationService.updateTableFieldImagen.and.returnValue(
        throwError(() => ({ message: 'Upload failed' }))
      );

      component.uploadImage('DondeCuandoDetails', 'Id', '1', 'Imagen', mockFile, '1');
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Error al subir imagen')
      );
    }));
  });

  describe('Map dialog', () => {
    it('should open map dialog', () => {
      const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of('19.4326,-99.1332') });
      mockDialog.open.and.returnValue(dialogRefSpyObj);

      component.abrirMapa('1');

      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should update ubicacion after dialog closes', fakeAsync(() => {
      const newUbicacion = '20.0000,-100.0000';
      const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(newUbicacion) });
      mockDialog.open.and.returnValue(dialogRefSpyObj);

      component.abrirMapa('1');
      tick();

      expect(component.data.details[0].ubicacion).toBe(newUbicacion);
      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'DondeCuandoDetails', 'Id', '1', 'Ubicacion', newUbicacion
      );
    }));
  });

  describe('Drag and drop', () => {
    it('should reorder items on drop', () => {
      const event = {
        previousIndex: 0,
        currentIndex: 1
      } as any;

      component.drop(event);

      expect(mockInvitationService.updateTableField).toHaveBeenCalled();
    });
  });

  describe('Helper functions', () => {
    it('should convert date using fechasHelper', () => {
      const result = component.convertDate('2025-12-01');
      expect(result).toBe('01 de Diciembre 2025');
    });

    it('should track by id', () => {
      const item = { id: '123' };
      expect(component.trackById(0, item)).toBe('123');
    });
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
});
