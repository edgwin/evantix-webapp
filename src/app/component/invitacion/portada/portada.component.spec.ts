import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PortadaComponent } from './portada.component';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PortadaComponent', () => {
  let component: PortadaComponent;
  let fixture: ComponentFixture<PortadaComponent>;
  let mockInvitationService: jasmine.SpyObj<InvitationService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const mockData = {
    titulo: 'Boda de Juan y María',
    subTitulo: 'Te invitamos a celebrar',
    imagen: 'test-image.jpg',
    fecha: '2025-12-01T18:00:00',
    date: new Date('2025-12-01T18:00:00')
  };

  beforeEach(async () => {
    mockInvitationService = jasmine.createSpyObj('InvitationService', [
      'updateTableField',
      'updateTableFieldImagen'
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['show']);

    mockInvitationService.updateTableField.and.returnValue(of({}));
    mockInvitationService.updateTableFieldImagen.and.returnValue(of('new-image.jpg'));

    await TestBed.configureTestingModule({
      imports: [PortadaComponent, NoopAnimationsModule],
      providers: [
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: NotificationService, useValue: mockNotificationService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PortadaComponent);
    component = fixture.componentInstance;
    component.data = { ...mockData };
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

    it('should accept eventId input', () => {
      component.eventId = 'new-event-id';
      expect(component.eventId).toBe('new-event-id');
    });

    it('should accept data input', () => {
      expect(component.data.titulo).toBe('Boda de Juan y María');
    });

    it('should accept eventType input', () => {
      expect(component.eventType).toBe('Boda');
    });
  });

  describe('Title editing', () => {
    it('should enable title editing on click', () => {
      component.onClickTitulo();
      expect(component.editingTitle).toBeTrue();
      expect(component.tempTitle).toBe(mockData.titulo);
    });

    it('should update title on blur if changed', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Nuevo Título';
      const event = { target: mockElement } as unknown as Event;

      component.onTituloBlur(event);

      expect(component.data.titulo).toBe('Nuevo Título');
      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'Portada', 'IdEvento', 'test-event-id', 'Titulo', 'Nuevo Título'
      );
    });

    it('should not update title if not changed', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = mockData.titulo;
      const event = { target: mockElement } as unknown as Event;

      component.onTituloBlur(event);

      expect(mockInvitationService.updateTableField).not.toHaveBeenCalled();
    });

    it('should restore title on escape', () => {
      component.editingTitle = true;
      component.tempTitle = 'Original Title';
      
      const mockElement = document.createElement('div');
      mockElement.classList.add('text-center', 'fh5co-heading', 'editablePortadaTitulo');
      mockElement.innerText = 'Changed Title';
      document.body.appendChild(mockElement);

      component.restoreTitulo(mockElement);

      expect(mockElement.innerText).toBe('Original Title');
      expect(component.editingTitle).toBeFalse();
      
      document.body.removeChild(mockElement);
    });
  });

  describe('Subtitle editing', () => {
    it('should enable subtitle editing on click', () => {
      component.onClickSubtitulo();
      expect(component.editingSubtitle).toBeTrue();
      expect(component.tempSubtitle).toBe(mockData.subTitulo);
    });

    it('should update subtitle on blur if changed', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Nuevo Subtítulo';
      const event = { target: mockElement } as unknown as Event;

      component.onSubtitleBlur(event);

      expect(component.data.subTitulo).toBe('Nuevo Subtítulo');
      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'Portada', 'IdEvento', 'test-event-id', 'Subtitulo', 'Nuevo Subtítulo'
      );
    });

    it('should restore subtitle correctly', () => {
      component.editingSubtitle = true;
      component.tempSubtitle = 'Original Subtitle';
      
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Changed Subtitle';

      component.restoreSubtitulo(mockElement);

      expect(mockElement.innerText).toBe('Original Subtitle');
      expect(component.editingSubtitle).toBeFalse();
    });
  });

  describe('Date editing', () => {
    it('should enable date edit mode', () => {
      component.enableDateEdit();
      expect(component.editingDate).toBeTrue();
    });

    it('should cancel date editing', () => {
      component.editingDate = true;
      component.cancelDate();
      expect(component.editingDate).toBeFalse();
    });

    it('should format date correctly', () => {
      const result = component.formatearFecha('2025-12-01');
      expect(result).toContain('Diciembre');
      expect(result).toContain('2025');
    });
  });

  describe('Image upload', () => {
    it('should upload image successfully', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      component.uploadImage('Portada', 'IdEvento', 'test-event-id', 'Imagen', mockFile);
      tick();

      expect(component.data.imagen).toBe('new-image.jpg');
      expect(component.loadingImg).toBeFalse();
    }));

    it('should show error on image upload failure', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      mockInvitationService.updateTableFieldImagen.and.returnValue(
        throwError(() => ({ message: 'Upload failed' }))
      );

      component.uploadImage('Portada', 'IdEvento', 'test-event-id', 'Imagen', mockFile);
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Error al subir imagen')
      );
      expect(component.loadingImg).toBeFalse();
    }));
  });

  describe('Key handling', () => {
    it('should prevent typing beyond max length', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'a'.repeat(35);
      
      const event = {
        key: 'a',
        target: mockElement,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should allow control keys even at max length', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'a'.repeat(35);
      
      const event = {
        key: 'Backspace',
        target: mockElement,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.onKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should blur on Enter key', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Test';
      spyOn(mockElement, 'blur');
      
      const event = {
        key: 'Enter',
        shiftKey: false,
        target: mockElement,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockElement.blur).toHaveBeenCalled();
    });
  });

  describe('ReadOnly mode', () => {
    it('should not show edit button when isReadOnly is true', () => {
      component.isReadOnly = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const editButton = compiled.querySelector('.edit-image-btn');
      expect(editButton).toBeNull();
    });
  });

  describe('Backend updates', () => {
    it('should call updateTableField correctly', () => {
      component.updateBackend('Portada', 'IdEvento', 'test-id', 'Titulo', 'Test');
      
      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'Portada', 'IdEvento', 'test-id', 'Titulo', 'Test'
      );
    });

    it('should show error notification on backend update failure', fakeAsync(() => {
      mockInvitationService.updateTableField.and.returnValue(
        throwError(() => ({ message: 'Update failed' }))
      );

      component.updateBackend('Portada', 'IdEvento', 'test-id', 'Titulo', 'Test');
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Error al actualizar')
      );
    }));
  });

  describe('Escape key handler', () => {
    it('should handle escape key when editing title', () => {
      component.editingTitle = true;
      component.tempTitle = 'Original';
      
      const mockElement = document.createElement('div');
      mockElement.classList.add('text-center', 'fh5co-heading', 'editablePortadaTitulo');
      document.body.appendChild(mockElement);

      component.onEscape();

      expect(component.editingTitle).toBeFalse();
      
      document.body.removeChild(mockElement);
    });
  });
});
