import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HospedajeComponent } from './hospedaje.component';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { TemplateService } from '../../../services/template.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HospedajeComponent', () => {
  let component: HospedajeComponent;
  let fixture: ComponentFixture<HospedajeComponent>;
  let mockInvitationService: jasmine.SpyObj<InvitationService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockTemplateService: jasmine.SpyObj<TemplateService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockData = {
    imagen: 'hospedaje.jpg',
    details: [
      { id: '1', titulo: 'Hotel Principal', descripcion: 'Cerca del evento', ubicacion: '19.4326,-99.1332' },
      { id: '2', titulo: 'Hotel Alternativo', descripcion: 'Económico', ubicacion: '19.4400,-99.1400' }
    ]
  };

  beforeEach(async () => {
    mockInvitationService = jasmine.createSpyObj('InvitationService', [
      'updateTableField',
      'updateTableFieldImagen',
      'getHospedaje',
      'postNewHospedaje',
      'deleteHospedaje'
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['show']);
    mockTemplateService = jasmine.createSpyObj('TemplateService', ['getIconForSection']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockInvitationService.updateTableField.and.returnValue(of({}));
    mockInvitationService.updateTableFieldImagen.and.returnValue(of('new-image.jpg'));
    mockInvitationService.getHospedaje.and.returnValue(of(mockData));
    mockInvitationService.postNewHospedaje.and.returnValue(of({}));
    mockInvitationService.deleteHospedaje.and.returnValue(of({}));
    mockTemplateService.getIconForSection.and.returnValue('../../../../assets/Hospedaje.png');

    await TestBed.configureTestingModule({
      imports: [HospedajeComponent],
      providers: [
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TemplateService, useValue: mockTemplateService },
        { provide: MatDialog, useValue: mockDialog }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HospedajeComponent);
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

    it('should accept data input', () => {
      expect(component.data.details.length).toBe(2);
    });
  });

  describe('cargarDatos', () => {
    it('should load data successfully', fakeAsync(() => {
      component.cargarDatos();
      tick();

      expect(mockInvitationService.getHospedaje).toHaveBeenCalledWith('test-event-id');
      expect(component.loading).toBeFalse();
    }));

    it('should not load if eventId is empty', () => {
      component.eventId = '';
      component.cargarDatos();
      expect(mockInvitationService.getHospedaje).not.toHaveBeenCalled();
    });
  });

  describe('Image upload', () => {
    it('should upload image successfully', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      component.uploadImage('HospedajeMaster', 'IdEvento', 'test-event-id', 'Imagen', mockFile);
      tick();

      expect(component.data.imagen).toBe('new-image.jpg');
      expect(component.loadingImg).toBeFalse();
    }));

    it('should show error on image upload failure', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      mockInvitationService.updateTableFieldImagen.and.returnValue(
        throwError(() => ({ message: 'Upload failed' }))
      );

      component.uploadImage('HospedajeMaster', 'IdEvento', 'test-event-id', 'Imagen', mockFile);
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Error al subir imagen')
      );
    }));
  });

  describe('Delete hospedaje', () => {
    it('should delete hospedaje item', fakeAsync(() => {
      component.triggerElementDelete('1');
      tick();

      expect(mockInvitationService.deleteHospedaje).toHaveBeenCalledWith('1');
    }));

    it('should show error on delete failure', fakeAsync(() => {
      mockInvitationService.deleteHospedaje.and.returnValue(
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

  describe('Title editing', () => {
    it('should have editingTituloId null by default', () => {
      expect(component.editingTituloId).toBeNull();
    });
  });

  describe('Description editing', () => {
    it('should have editingDescripcionId null by default', () => {
      expect(component.editingDescripcionId).toBeNull();
    });
  });

  describe('Template service integration', () => {
    it('should have templateService available', () => {
      expect(component.templateService).toBeDefined();
    });

    it('should call getIconForSection from templateService', () => {
      const icon = component.templateService.getIconForSection('hospedaje');
      expect(icon).toBe('../../../../assets/Hospedaje.png');
    });
  });

  describe('ReadOnly mode', () => {
    it('should accept isReadOnly input', () => {
      component.isReadOnly = true;
      expect(component.isReadOnly).toBeTrue();
    });
  });
});
