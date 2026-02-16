import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MesaRegalosComponent } from './mesa-regalos.component';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MesaRegalosComponent', () => {
  let component: MesaRegalosComponent;
  let fixture: ComponentFixture<MesaRegalosComponent>;
  let mockInvitationService: jasmine.SpyObj<InvitationService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const mockData = {
    imagen: 'mesa-regalos.jpg',
    details: [
      { id: '1', titulo: 'Liverpool', descripcion: 'Mesa de regalos', url: 'https://liverpool.com' },
      { id: '2', titulo: 'Amazon', descripcion: 'Lista de deseos', url: 'https://amazon.com' }
    ]
  };

  beforeEach(async () => {
    mockInvitationService = jasmine.createSpyObj('InvitationService', [
      'updateTableField',
      'updateTableFieldImagen',
      'getMesaRegalos',
      'postNewMesaRegalos',
      'deleteMesaRegalos'
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['show']);

    mockInvitationService.updateTableField.and.returnValue(of({}));
    mockInvitationService.updateTableFieldImagen.and.returnValue(of('new-image.jpg'));
    mockInvitationService.getMesaRegalos.and.returnValue(of(mockData));
    mockInvitationService.postNewMesaRegalos.and.returnValue(of({}));
    mockInvitationService.deleteMesaRegalos.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [MesaRegalosComponent],
      providers: [
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: NotificationService, useValue: mockNotificationService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MesaRegalosComponent);
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

      expect(mockInvitationService.getMesaRegalos).toHaveBeenCalledWith('test-event-id');
      expect(component.loading).toBeFalse();
    }));

    it('should show error on load failure', fakeAsync(() => {
      mockInvitationService.getMesaRegalos.and.returnValue(
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
      expect(mockInvitationService.getMesaRegalos).not.toHaveBeenCalled();
    });
  });

  describe('gotoUrl', () => {
    it('should open URL in new tab', () => {
      spyOn(window, 'open');
      component.gotoUrl('https://example.com');
      expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
    });
  });

  describe('Image upload', () => {
    it('should upload image successfully', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      component.uploadImage('MesaRegalosMaster', 'IdEvento', 'test-event-id', 'Imagen', mockFile);
      tick();

      expect(component.data.imagen).toBe('new-image.jpg');
      expect(component.loadingImg).toBeFalse();
    }));

    it('should show error on image upload failure', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      mockInvitationService.updateTableFieldImagen.and.returnValue(
        throwError(() => ({ message: 'Upload failed' }))
      );

      component.uploadImage('MesaRegalosMaster', 'IdEvento', 'test-event-id', 'Imagen', mockFile);
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Error al subir imagen')
      );
    }));
  });

  describe('Key handling', () => {
    it('should prevent typing beyond max length', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'a'.repeat(100);
      
      const event = {
        key: 'a',
        target: mockElement,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.onKeyDown(event, 100);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should allow control keys even at max length', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'a'.repeat(100);
      
      const event = {
        key: 'Backspace',
        target: mockElement,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.onKeyDown(event, 100);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
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
