import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TemplateSelectorComponent } from './template-selector.component';
import { TemplateService, Template } from '../../../services/template.service';
import { InvitationService } from '../../../services/invitation.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('TemplateSelectorComponent', () => {
  let component: TemplateSelectorComponent;
  let fixture: ComponentFixture<TemplateSelectorComponent>;
  let mockTemplateService: jasmine.SpyObj<TemplateService>;
  let mockInvitationService: jasmine.SpyObj<InvitationService>;

  const mockTemplates: Template[] = [
    {
      id: 'elegant_gold',
      name: 'Elegante Dorado',
      category: 'boda',
      style: 'elegante',
      theme: {
        colors: {
          primary: '#C9A24D',
          primaryDark: '#A07B2E',
          secondary: '#2B2B2B',
          background: '#FFFFFF',
          backgroundAlt: '#F8F5F0',
          text: '#1A1A1A',
          textLight: '#828282',
          accent: '#D4AF37',
          overlay: 'rgba(0, 0, 0, 0.5)',
          shadow: 'rgba(201, 162, 77, 0.3)'
        },
        fonts: {
          title: "'Playfair Display', serif",
          body: "'Montserrat', sans-serif"
        },
        borderRadius: '12px',
        iconStyle: 'classic',
        icons: {
          indicaciones: 'icon1.png',
          hospedaje: 'icon2.png'
        },
        backgroundImage: 'bg.jpg',
        marbleBackground: 'marble.svg'
      }
    },
    {
      id: 'romantic_pink',
      name: 'Romántico Rosa',
      category: 'boda',
      style: 'romantico',
      theme: {
        colors: {
          primary: '#F14E95',
          primaryDark: '#C13A75',
          secondary: '#5d5d5d',
          background: '#FFFFFF',
          backgroundAlt: '#FFF5F8',
          text: '#000000',
          textLight: '#828282',
          accent: '#FF6B9D',
          overlay: 'rgba(241, 78, 149, 0.3)',
          shadow: 'rgba(241, 78, 149, 0.3)'
        },
        fonts: {
          title: "'Sacramento', cursive",
          body: "'Work Sans', sans-serif"
        },
        borderRadius: '8px',
        iconStyle: 'classic',
        icons: {
          indicaciones: 'icon1.png',
          hospedaje: 'icon2.png'
        },
        backgroundImage: 'bg.jpg',
        marbleBackground: 'marble.svg'
      }
    },
    {
      id: 'xv_princess',
      name: 'Princesa XV',
      category: 'xv',
      style: 'elegante',
      theme: {
        colors: {
          primary: '#9B59B6',
          primaryDark: '#7D3C98',
          secondary: '#8E44AD',
          background: '#FFFFFF',
          backgroundAlt: '#F8F4FC',
          text: '#2C2C2C',
          textLight: '#777777',
          accent: '#E74C3C',
          overlay: 'rgba(155, 89, 182, 0.4)',
          shadow: 'rgba(155, 89, 182, 0.3)'
        },
        fonts: {
          title: "'Great Vibes', cursive",
          body: "'Quicksand', sans-serif"
        },
        borderRadius: '16px',
        iconStyle: 'classic',
        icons: {
          indicaciones: 'icon1.png',
          hospedaje: 'icon2.png'
        },
        backgroundImage: 'bg.jpg',
        marbleBackground: 'marble.svg'
      }
    },
    {
      id: 'modern_minimalist',
      name: 'Moderno Minimalista',
      category: 'general',
      style: 'minimalista',
      theme: {
        colors: {
          primary: '#1A1A1A',
          primaryDark: '#000000',
          secondary: '#666666',
          background: '#FFFFFF',
          backgroundAlt: '#F5F5F5',
          text: '#1A1A1A',
          textLight: '#999999',
          accent: '#333333',
          overlay: 'rgba(0, 0, 0, 0.6)',
          shadow: 'rgba(0, 0, 0, 0.2)'
        },
        fonts: {
          title: "'Poppins', sans-serif",
          body: "'Inter', sans-serif"
        },
        borderRadius: '0px',
        iconStyle: 'minimal',
        icons: {
          indicaciones: 'icon1.png',
          hospedaje: 'icon2.png'
        },
        backgroundImage: 'bg.jpg',
        marbleBackground: 'marble.svg'
      }
    }
  ];

  beforeEach(async () => {
    mockTemplateService = jasmine.createSpyObj('TemplateService', [
      'getCurrentTemplate',
      'setTemplate',
      'applyTemplateToDOM'
    ]);
    mockInvitationService = jasmine.createSpyObj('InvitationService', [
      'getTemplates',
      'updateEventTemplate'
    ]);

    mockInvitationService.getTemplates.and.returnValue(of(mockTemplates));
    mockInvitationService.updateEventTemplate.and.returnValue(of({}));
    mockTemplateService.getCurrentTemplate.and.returnValue(mockTemplates[0]);

    await TestBed.configureTestingModule({
      imports: [TemplateSelectorComponent],
      providers: [
        { provide: TemplateService, useValue: mockTemplateService },
        { provide: InvitationService, useValue: mockInvitationService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TemplateSelectorComponent);
    component = fixture.componentInstance;
    component.eventId = 'test-event-id';
    component.eventType = 'Boda';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should accept eventId input', () => {
      expect(component.eventId).toBe('test-event-id');
    });

    it('should accept eventType input', () => {
      expect(component.eventType).toBe('Boda');
    });
  });

  describe('ngOnInit', () => {
    it('should load templates on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(mockInvitationService.getTemplates).toHaveBeenCalled();
      expect(component.templates.length).toBe(4);
    }));

    it('should set selected template id from current template', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(component.selectedTemplateId).toBe('elegant_gold');
    }));

    it('should map event type to category', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(component.selectedCategory).toBe('boda');
    }));
  });

  describe('filterTemplates', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should show all templates when category is all', () => {
      component.selectedCategory = 'all';
      component.filterTemplates();
      expect(component.filteredTemplates.length).toBe(4);
    });

    it('should filter by boda category including general', () => {
      component.selectedCategory = 'boda';
      component.filterTemplates();
      // Should include boda templates + general templates
      expect(component.filteredTemplates.length).toBe(3);
    });

    it('should filter by xv category including general', () => {
      component.selectedCategory = 'xv';
      component.filterTemplates();
      // Should include xv templates + general templates
      expect(component.filteredTemplates.length).toBe(2);
    });
  });

  describe('onCategoryChange', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should update selected category', () => {
      component.onCategoryChange('xv');
      expect(component.selectedCategory).toBe('xv');
    });

    it('should filter templates after category change', () => {
      component.onCategoryChange('all');
      expect(component.filteredTemplates.length).toBe(4);
    });
  });

  describe('selectTemplate', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should set selected template id', () => {
      const template = mockTemplates[1];
      component.selectTemplate(template);
      expect(component.selectedTemplateId).toBe('romantic_pink');
    });

    it('should call templateService.setTemplate with template object', () => {
      const template = mockTemplates[1];
      component.selectTemplate(template);
      expect(mockTemplateService.setTemplate).toHaveBeenCalledWith(template);
    });

    it('should emit templateSelected event', fakeAsync(() => {
      spyOn(component.templateSelected, 'emit');
      const template = mockTemplates[1];
      component.selectTemplate(template);
      tick();
      expect(component.templateSelected.emit).toHaveBeenCalledWith(template);
    }));
  });

  describe('previewTemplate', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should call applyTemplateToDOM', () => {
      const template = mockTemplates[1];
      component.previewTemplate(template);
      expect(mockTemplateService.applyTemplateToDOM).toHaveBeenCalledWith(template);
    });

    it('should store original template before preview', () => {
      const template = mockTemplates[1];
      component.previewTemplate(template);
      expect(component.originalTemplate).toBeTruthy();
    });
  });

  describe('toggleSelector', () => {
    it('should toggle isOpen state', () => {
      expect(component.isOpen).toBeFalse();
      component.toggleSelector();
      expect(component.isOpen).toBeTrue();
      component.toggleSelector();
      expect(component.isOpen).toBeFalse();
    });
  });

  describe('getStyleLabel', () => {
    it('should return correct label for moderno', () => {
      expect(component.getStyleLabel('moderno')).toBe('Moderno');
    });

    it('should return correct label for vintage', () => {
      expect(component.getStyleLabel('vintage')).toBe('Vintage');
    });

    it('should return correct label for elegante', () => {
      expect(component.getStyleLabel('elegante')).toBe('Elegante');
    });

    it('should return correct label for romantico', () => {
      expect(component.getStyleLabel('romantico')).toBe('Romántico');
    });

    it('should return correct label for minimalista', () => {
      expect(component.getStyleLabel('minimalista')).toBe('Minimalista');
    });

    it('should return original value for unknown style', () => {
      expect(component.getStyleLabel('unknown')).toBe('unknown');
    });
  });

  describe('categories', () => {
    it('should have categories defined', () => {
      expect(component.categories.length).toBeGreaterThan(0);
    });

    it('should include boda category', () => {
      const values = component.categories.map(c => c.value);
      expect(values).toContain('boda');
    });

    it('should include xv category', () => {
      const values = component.categories.map(c => c.value);
      expect(values).toContain('xv');
    });
  });
});
