import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IndicacionesComponent } from './indicaciones.component';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { TemplateService } from '../../../services/template.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('IndicacionesComponent', () => {
  let component: IndicacionesComponent;
  let fixture: ComponentFixture<IndicacionesComponent>;
  let mockInvitationService: jasmine.SpyObj<InvitationService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockTemplateService: jasmine.SpyObj<TemplateService>;

  const mockData = {
    imagen: 'indicaciones.jpg',
    details: [
      { id: '1', titulo: 'Dress Code', descripcion: 'Formal' },
      { id: '2', titulo: 'Regalos', descripcion: 'No niños' }
    ]
  };

  beforeEach(async () => {
    mockInvitationService = jasmine.createSpyObj('InvitationService', [
      'updateTableField',
      'updateTableFieldImagen',
      'getInvitacionIndicaciones',
      'postNewIndicacion',
      'deleteIndicacion'
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['show']);
    mockTemplateService = jasmine.createSpyObj('TemplateService', ['getIconForSection']);

    mockInvitationService.updateTableField.and.returnValue(of({}));
    mockInvitationService.updateTableFieldImagen.and.returnValue(of('new-image.jpg'));
    mockInvitationService.getInvitacionIndicaciones.and.returnValue(of(mockData));
    mockInvitationService.postNewIndicacion.and.returnValue(of({}));
    mockInvitationService.deleteIndicacion.and.returnValue(of({}));
    mockTemplateService.getIconForSection.and.returnValue('../../../../assets/Indicaciones.png');

    await TestBed.configureTestingModule({
      imports: [IndicacionesComponent],
      providers: [
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TemplateService, useValue: mockTemplateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(IndicacionesComponent);
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

    it('should accept data input', () => {
      expect(component.data.details.length).toBe(2);
    });
  });

  describe('cargarDatos', () => {
    it('should load data successfully', fakeAsync(() => {
      component.cargarDatos();
      tick();

      expect(mockInvitationService.getInvitacionIndicaciones).toHaveBeenCalledWith('test-event-id');
      expect(component.loading).toBeFalse();
    }));

    it('should show error on load failure', fakeAsync(() => {
      mockInvitationService.getInvitacionIndicaciones.and.returnValue(
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
      expect(mockInvitationService.getInvitacionIndicaciones).not.toHaveBeenCalled();
    });
  });

  describe('Title editing', () => {
    it('should enable title editing on click', () => {
      component.onClickTitulo('1');
      expect(component.valor).toBe('1');
      expect(component.tempTituloMap['1']).toBe('Dress Code');
    });

    it('should restore title correctly', () => {
      const item = { id: '1', titulo: 'Dress Code' };
      component.tempTituloMap['1'] = 'Original Title';
      
      const mockElement = document.createElement('div');
      mockElement.innerHTML = 'Changed Title';

      component.restoreTitulo(item, mockElement);

      expect(mockElement.innerHTML).toBe('Original Title');
    });
  });

  describe('Description editing', () => {
    it('should enable description editing on click', () => {
      component.onClickDescripcion('1');
      expect(component.editingDescripcionId).toBe('1');
      expect(component.tempDescripcionMap['1']).toBe('Formal');
    });

    it('should restore description correctly', () => {
      const item = { id: '1', descripcion: 'Formal' };
      component.tempDescripcionMap['1'] = 'Original Desc';
      
      const mockElement = document.createElement('div');
      mockElement.innerHTML = 'Changed Desc';

      component.restoreDescripcion(item, mockElement);

      expect(mockElement.innerHTML).toBe('Original Desc');
    });
  });

  describe('Key handling', () => {
    it('should prevent description typing beyond max length', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'a'.repeat(150);
      
      const event = {
        key: 'a',
        target: mockElement,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.onDescKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should prevent title typing beyond max length', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'a'.repeat(22);
      
      const event = {
        key: 'a',
        target: mockElement,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.onTituloKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should allow control keys even at max length', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'a'.repeat(150);
      
      const event = {
        key: 'Backspace',
        target: mockElement,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.onDescKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('CRUD operations', () => {
    it('should add new indicacion', fakeAsync(() => {
      component.nuevaIndicacion();
      tick();

      expect(mockInvitationService.postNewIndicacion).toHaveBeenCalledWith('test-event-id');
    }));

    it('should show error on add failure', fakeAsync(() => {
      mockInvitationService.postNewIndicacion.and.returnValue(
        throwError(() => ({ message: 'Add failed' }))
      );

      component.nuevaIndicacion();
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Hubo un error')
      );
    }));

    it('should delete indicacion', fakeAsync(() => {
      component.triggerElementDelete('1');
      tick();

      expect(mockInvitationService.deleteIndicacion).toHaveBeenCalledWith('1');
    }));

    it('should show error on delete failure', fakeAsync(() => {
      mockInvitationService.deleteIndicacion.and.returnValue(
        throwError(() => ({ message: 'Delete failed' }))
      );

      component.triggerElementDelete('1');
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Error al subir imagen')
      );
    }));
  });

  describe('saveContent', () => {
    it('should save title content when changed', () => {
      component.tempTituloMap['1'] = 'Old Title';
      
      const mockElement = document.createElement('div');
      mockElement.innerText = 'New Title';
      const event = { target: mockElement } as unknown as Event;

      component.saveContent(event, '1', 'titulo');

      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'IndicacionesDetail', 'Id', '1', 'Titulo', 'New Title'
      );
    });

    it('should save description content when changed', () => {
      component.tempTituloMap['1'] = 'Old Desc';
      
      const mockElement = document.createElement('div');
      mockElement.innerText = 'New Desc';
      const event = { target: mockElement } as unknown as Event;

      component.saveContent(event, '1', 'descripcion');

      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'IndicacionesDetail', 'Id', '1', 'Descripcion', 'New Desc'
      );
    });

    it('should not save if content unchanged', () => {
      component.tempTituloMap['1'] = 'Same Title';
      
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Same Title';
      const event = { target: mockElement } as unknown as Event;

      component.saveContent(event, '1', 'titulo');

      expect(mockInvitationService.updateTableField).not.toHaveBeenCalled();
    });
  });

  describe('Image upload', () => {
    it('should upload image successfully', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      component.uploadImage('IndicacionesMaster', 'IdEvento', 'test-event-id', 'Imagen', mockFile);
      tick();

      expect(component.data.imagen).toBe('new-image.jpg');
      expect(component.loadingImg).toBeFalse();
    }));

    it('should show error on image upload failure', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      mockInvitationService.updateTableFieldImagen.and.returnValue(
        throwError(() => ({ message: 'Upload failed' }))
      );

      component.uploadImage('IndicacionesMaster', 'IdEvento', 'test-event-id', 'Imagen', mockFile);
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Error al subir imagen')
      );
    }));
  });

  describe('Template service integration', () => {
    it('should have templateService available', () => {
      expect(component.templateService).toBeDefined();
    });

    it('should call getIconForSection from templateService', () => {
      const icon = component.templateService.getIconForSection('indicaciones');
      expect(icon).toBe('../../../../assets/Indicaciones.png');
    });
  });

  describe('ReadOnly mode', () => {
    it('should be false by default', () => {
      expect(component.isReadOnly).toBeFalse();
    });

    it('should accept isReadOnly input', () => {
      component.isReadOnly = true;
      expect(component.isReadOnly).toBeTrue();
    });
  });
});
