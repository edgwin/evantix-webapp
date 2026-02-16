import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HistoriaComponent } from './historia.component';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HistoriaComponent', () => {
  let component: HistoriaComponent;
  let fixture: ComponentFixture<HistoriaComponent>;
  let mockInvitationService: jasmine.SpyObj<InvitationService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const mockData = {
    titulo: 'Nuestra Historia',
    details: [
      { id: '1', fecha: '2020-01-01', descripcion: 'Nos conocimos', imagen: 'historia1.jpg' },
      { id: '2', fecha: '2021-06-15', descripcion: 'Comenzamos a salir', imagen: 'historia2.jpg' }
    ]
  };

  beforeEach(async () => {
    mockInvitationService = jasmine.createSpyObj('InvitationService', [
      'updateTableField',
      'updateTableFieldImagen',
      'getHistoria',
      'postNewHistoria',
      'deleteHistoria'
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['show']);

    mockInvitationService.updateTableField.and.returnValue(of({}));
    mockInvitationService.updateTableFieldImagen.and.returnValue(of('new-image.jpg'));
    mockInvitationService.getHistoria.and.returnValue(of(mockData));
    mockInvitationService.postNewHistoria.and.returnValue(of({}));
    mockInvitationService.deleteHistoria.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [HistoriaComponent],
      providers: [
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: NotificationService, useValue: mockNotificationService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoriaComponent);
    component = fixture.componentInstance;
    component.dataHistoria = JSON.parse(JSON.stringify(mockData));
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

    it('should accept dataHistoria input', () => {
      expect(component.dataHistoria.details.length).toBe(2);
    });
  });

  describe('cargarDatosHistoria', () => {
    it('should load data successfully', fakeAsync(() => {
      component.cargarDatosHistoria();
      tick();

      expect(mockInvitationService.getHistoria).toHaveBeenCalledWith('test-event-id');
      expect(component.loading).toBeFalse();
    }));

    it('should show error on load failure', fakeAsync(() => {
      mockInvitationService.getHistoria.and.returnValue(
        throwError(() => ({ message: 'Load failed' }))
      );

      component.cargarDatosHistoria();
      tick();

      expect(mockNotificationService.show).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Hubo un error')
      );
    }));

    it('should not load if eventId is empty', () => {
      component.eventId = '';
      component.cargarDatosHistoria();
      expect(mockInvitationService.getHistoria).not.toHaveBeenCalled();
    });
  });

  describe('Title editing', () => {
    it('should enable titulo editing on click', () => {
      component.onClickTituloHistoria();
      expect(component.editingTituloHistoria).toBeTrue();
      expect(component.tempTituloHistoria).toBe('Nuestra Historia');
    });

    it('should update titulo on blur if changed', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Nuevo Título';
      const event = { target: mockElement } as unknown as Event;

      component.onTituloHistoriaBlur(event);

      expect(component.dataHistoria.titulo).toBe('Nuevo Título');
      expect(mockInvitationService.updateTableField).toHaveBeenCalledWith(
        'HistoriaMaster', 'IdEvento', 'test-event-id', 'Titulo', 'Nuevo Título'
      );
    });

    it('should not update titulo if not changed', () => {
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Nuestra Historia';
      const event = { target: mockElement } as unknown as Event;

      component.onTituloHistoriaBlur(event);

      expect(mockInvitationService.updateTableField).not.toHaveBeenCalled();
    });

    it('should restore titulo correctly', () => {
      component.editingTituloHistoria = true;
      component.tempTituloHistoria = 'Original Title';
      
      const mockElement = document.createElement('div');
      mockElement.innerText = 'Changed Title';

      component.restoreTituloHistoria(mockElement);

      expect(mockElement.innerText).toBe('Original Title');
      expect(component.editingTituloHistoria).toBeFalse();
    });
  });

  describe('Fecha editing', () => {
    it('should enable fecha editing on click', () => {
      component.onClickFechaHistoria('1');
      expect(component.editingFechaHistoriaId).toBe('1');
      expect(component.tempFechaHistoriaMap['1']).toBe('2020-01-01');
    });
  });

  describe('Description editing', () => {
    it('should have editingDescHistoriaId null by default', () => {
      expect(component.editingDescHistoriaId).toBeNull();
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

  describe('ReadOnly mode', () => {
    it('should accept isReadOnly input', () => {
      component.isReadOnly = true;
      expect(component.isReadOnly).toBeTrue();
    });
  });
});
