import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FestejadosComponent } from './festejados.component';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { TemplateService } from '../../../services/template.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FestejadosComponent', () => {
  let component: FestejadosComponent;
  let fixture: ComponentFixture<FestejadosComponent>;
  let mockInvitationService: jasmine.SpyObj<InvitationService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockTemplateService: jasmine.SpyObj<TemplateService>;

  const mockData = {
    titulo: 'Los Novios',
    frase: 'El amor nos une para siempre',
    imagen: 'festejados.jpg'
  };

  beforeEach(async () => {
    mockInvitationService = jasmine.createSpyObj('InvitationService', [
      'updateTableField',
      'updateTableFieldImagen'
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['show']);
    mockTemplateService = jasmine.createSpyObj('TemplateService', ['getBackgroundImage']);

    mockInvitationService.updateTableField.and.returnValue(of({}));
    mockInvitationService.updateTableFieldImagen.and.returnValue(of('new-image.jpg'));
    mockTemplateService.getBackgroundImage.and.returnValue('../../../../assets/background.jpg');

    await TestBed.configureTestingModule({
      imports: [FestejadosComponent, NoopAnimationsModule],
      providers: [
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TemplateService, useValue: mockTemplateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FestejadosComponent);
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
      expect(component.eventId).toBe('test-event-id');
    });

    it('should accept data input', () => {
      expect(component.data.titulo).toBe('Los Novios');
    });

    it('should have loading default to false', () => {
      expect(component.loading).toBeFalse();
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
      mockElement.innerText = 'Los Festejados';
      const event = { target: mockElement } as unknown as Event;

      component.onTituloBlur(event);

      expect(component.data.titulo).toBe('Los Festejados');
      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'Festejados', 'IdEvento', 'test-event-id', 'Titulo', 'Los Festejados'
      );
    });

    it('should not update title if not changed', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = mockData.titulo;
      const event = { target: mockElement } as unknown as Event;

      component.onTituloBlur(event);

      expect(mockInvitationService.updateTableField).not.toHaveBeenCalled();
    });

    it('should restore title correctly', () => {
      component.editingTitle = true;
      component.tempTitle = 'Original Title';
      
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Changed Title';

      component.restoreTitulo(mockElement);

      expect(mockElement.innerText).toBe('Original Title');
      expect(component.editingTitle).toBeFalse();
    });
  });

  describe('Frase editing', () => {
    it('should enable frase editing on click', () => {
      component.onClickFrase();
      expect(component.editingFrase).toBeTrue();
      expect(component.tempFrase).toBe(mockData.frase);
    });

    it('should update frase on blur if changed', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Nueva frase emotiva';
      const event = { target: mockElement } as unknown as Event;

      component.onFraseBlur(event);

      expect(component.data.frase).toBe('Nueva frase emotiva');
      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'Festejados', 'IdEvento', 'test-event-id', 'Frase', 'Nueva frase emotiva'
      );
    });

    it('should not update frase if not changed', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = mockData.frase;
      const event = { target: mockElement } as unknown as Event;

      component.onFraseBlur(event);

      expect(mockInvitationService.updateTableField).not.toHaveBeenCalled();
    });

    it('should restore frase correctly', () => {
      component.editingFrase = true;
      component.tempFrase = 'Original Frase';
      
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Changed Frase';

      component.restoreFrase(mockElement);

      expect(mockElement.innerText).toBe('Original Frase');
      expect(component.editingFrase).toBeFalse();
    });
  });

  describe('Key handling', () => {
    it('should prevent typing beyond max length', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'a'.repeat(250);
      
      const event = {
        key: 'a',
        target: mockElement,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.onKeyDown(event, 250);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should allow control keys even at max length', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'a'.repeat(250);
      
      const event = {
        key: 'Backspace',
        target: mockElement,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.onKeyDown(event, 250);

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

      component.onKeyDown(event, 250);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockElement.blur).toHaveBeenCalled();
    });
  });

  describe('Image upload', () => {
    it('should upload image successfully', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      component.uploadImage('Festejados', 'IdEvento', 'test-event-id', 'Imagen', mockFile);
      tick();

      expect(component.data.imagen).toBe('new-image.jpg');
      expect(component.loadingImg).toBeFalse();
    }));

    it('should show error on image upload failure', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      mockInvitationService.updateTableFieldImagen.and.returnValue(
        throwError(() => ({ message: 'Upload failed' }))
      );

      component.uploadImage('Festejados', 'IdEvento', 'test-event-id', 'Imagen', mockFile);
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Error al subir imagen')
      );
      expect(component.loadingImg).toBeFalse();
    }));
  });

  describe('Backend updates', () => {
    it('should show error notification on backend update failure', fakeAsync(() => {
      mockInvitationService.updateTableField.and.returnValue(
        throwError(() => ({ message: 'Update failed' }))
      );

      component.updateBackend('Festejados', 'IdEvento', 'test-id', 'Titulo', 'Test');
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Error al actualizar')
      );
    }));
  });

  describe('Template service integration', () => {
    it('should have templateService available', () => {
      expect(component.templateService).toBeDefined();
    });

    it('should call getBackgroundImage from templateService', () => {
      const bgImage = component.templateService.getBackgroundImage();
      expect(bgImage).toBe('../../../../assets/background.jpg');
    });
  });

  describe('ReadOnly mode', () => {
    it('should not show edit button when isReadOnly is true', () => {
      component.isReadOnly = true;
      component.loadingImg = false;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const editButton = compiled.querySelector('.edit-image-btn');
      expect(editButton).toBeNull();
    });
  });

  describe('Escape key handler', () => {
    it('should handle escape when editing title', () => {
      component.editingTitle = true;
      component.tempTitle = 'Original';
      
      const mockElement = document.createElement('div');
      mockElement.id = 'TituloFestejados';
      document.body.appendChild(mockElement);

      component.onEscape();

      expect(component.editingTitle).toBeFalse();
      
      document.body.removeChild(mockElement);
    });

    it('should handle escape when editing frase', () => {
      component.editingFrase = true;
      component.tempFrase = 'Original Frase';
      
      const mockElement = document.createElement('div');
      mockElement.id = 'FraseFestejados';
      document.body.appendChild(mockElement);

      component.onEscape();

      expect(component.editingFrase).toBeFalse();
      
      document.body.removeChild(mockElement);
    });
  });
});
