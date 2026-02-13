import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TemplateTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    backgroundAlt: string;
    text: string;
    textLight: string;
    accent: string;
    overlay: string;
  };
  fonts: {
    title: string;
    body: string;
  };
  borderRadius: string;
  iconStyle: 'classic' | 'modern' | 'minimal' | 'vintage';
  icons: {
    indicaciones: string;
    hospedaje: string;
    mesaRegalos: string;
    intinerario: string;
  };
}

export interface Template {
  id: string;
  name: string;
  category: 'boda' | 'xv' | 'bautizo' | 'general';
  style: 'moderno' | 'vintage' | 'elegante' | 'romantico' | 'minimalista';
  theme: TemplateTheme;
  preview?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private currentTemplateSubject = new BehaviorSubject<Template | null>(null);
  public currentTemplate$: Observable<Template | null> = this.currentTemplateSubject.asObservable();

  private templates: Template[] = [
    {
      id: 'elegant_gold',
      name: 'Elegante Dorado',
      category: 'boda',
      style: 'elegante',
      theme: {
        colors: {
          primary: '#C9A24D',
          secondary: '#2B2B2B',
          background: '#FFFFFF',
          backgroundAlt: '#F8F5F0',
          text: '#1A1A1A',
          textLight: '#828282',
          accent: '#D4AF37',
          overlay: 'rgba(0, 0, 0, 0.5)'
        },
        fonts: {
          title: "'Playfair Display', serif",
          body: "'Montserrat', sans-serif"
        },
        borderRadius: '12px',
        iconStyle: 'classic',
        icons: {
          indicaciones: '../../../../assets/templates/elegant/indicaciones.png',
          hospedaje: '../../../../assets/templates/elegant/hospedaje.png',
          mesaRegalos: '../../../../assets/templates/elegant/mesa-regalos.png',
          intinerario: '../../../../assets/templates/elegant/intinerario.png'
        }
      },
      preview: '../../../../assets/templates/previews/elegant_gold.jpg'
    },
    {
      id: 'romantic_pink',
      name: 'Romántico Rosa',
      category: 'boda',
      style: 'romantico',
      theme: {
        colors: {
          primary: '#F14E95',
          secondary: '#5d5d5d',
          background: '#FFFFFF',
          backgroundAlt: '#FFF5F8',
          text: '#000000',
          textLight: '#828282',
          accent: '#FF6B9D',
          overlay: 'rgba(241, 78, 149, 0.3)'
        },
        fonts: {
          title: "'Sacramento', cursive",
          body: "'Work Sans', sans-serif"
        },
        borderRadius: '8px',
        iconStyle: 'classic',
        icons: {
          indicaciones: '../../../../assets/Indicaciones.png',
          hospedaje: '../../../../assets/Hospedaje.png',
          mesaRegalos: '../../../../assets/MesaRegalos.png',
          intinerario: '../../../../assets/Intinerario.png'
        }
      },
      preview: '../../../../assets/templates/previews/romantic_pink.jpg'
    },
    {
      id: 'vintage_green',
      name: 'Vintage Verde',
      category: 'boda',
      style: 'vintage',
      theme: {
        colors: {
          primary: '#6B8E6B',
          secondary: '#8B7355',
          background: '#FAF8F5',
          backgroundAlt: '#F0EDE8',
          text: '#3D3D3D',
          textLight: '#6B6B6B',
          accent: '#A4C49A',
          overlay: 'rgba(107, 142, 107, 0.4)'
        },
        fonts: {
          title: "'Cormorant Garamond', serif",
          body: "'Lato', sans-serif"
        },
        borderRadius: '4px',
        iconStyle: 'vintage',
        icons: {
          indicaciones: '../../../../assets/templates/vintage/indicaciones.png',
          hospedaje: '../../../../assets/templates/vintage/hospedaje.png',
          mesaRegalos: '../../../../assets/templates/vintage/mesa-regalos.png',
          intinerario: '../../../../assets/templates/vintage/intinerario.png'
        }
      },
      preview: '../../../../assets/templates/previews/vintage_green.jpg'
    },
    {
      id: 'modern_minimalist',
      name: 'Moderno Minimalista',
      category: 'general',
      style: 'minimalista',
      theme: {
        colors: {
          primary: '#1A1A1A',
          secondary: '#666666',
          background: '#FFFFFF',
          backgroundAlt: '#F5F5F5',
          text: '#1A1A1A',
          textLight: '#999999',
          accent: '#333333',
          overlay: 'rgba(0, 0, 0, 0.6)'
        },
        fonts: {
          title: "'Poppins', sans-serif",
          body: "'Inter', sans-serif"
        },
        borderRadius: '0px',
        iconStyle: 'minimal',
        icons: {
          indicaciones: '../../../../assets/templates/minimal/indicaciones.png',
          hospedaje: '../../../../assets/templates/minimal/hospedaje.png',
          mesaRegalos: '../../../../assets/templates/minimal/mesa-regalos.png',
          intinerario: '../../../../assets/templates/minimal/intinerario.png'
        }
      },
      preview: '../../../../assets/templates/previews/modern_minimalist.jpg'
    },
    {
      id: 'xv_princess',
      name: 'Princesa XV',
      category: 'xv',
      style: 'elegante',
      theme: {
        colors: {
          primary: '#9B59B6',
          secondary: '#8E44AD',
          background: '#FFFFFF',
          backgroundAlt: '#F8F4FC',
          text: '#2C2C2C',
          textLight: '#777777',
          accent: '#E74C3C',
          overlay: 'rgba(155, 89, 182, 0.4)'
        },
        fonts: {
          title: "'Great Vibes', cursive",
          body: "'Quicksand', sans-serif"
        },
        borderRadius: '16px',
        iconStyle: 'classic',
        icons: {
          indicaciones: '../../../../assets/templates/xv/indicaciones.png',
          hospedaje: '../../../../assets/templates/xv/hospedaje.png',
          mesaRegalos: '../../../../assets/templates/xv/mesa-regalos.png',
          intinerario: '../../../../assets/templates/xv/intinerario.png'
        }
      },
      preview: '../../../../assets/templates/previews/xv_princess.jpg'
    },
    {
      id: 'bautizo_celestial',
      name: 'Bautizo Celestial',
      category: 'bautizo',
      style: 'romantico',
      theme: {
        colors: {
          primary: '#87CEEB',
          secondary: '#4A90A4',
          background: '#FFFFFF',
          backgroundAlt: '#F0F8FF',
          text: '#2C3E50',
          textLight: '#7F8C8D',
          accent: '#5DADE2',
          overlay: 'rgba(135, 206, 235, 0.3)'
        },
        fonts: {
          title: "'Dancing Script', cursive",
          body: "'Open Sans', sans-serif"
        },
        borderRadius: '20px',
        iconStyle: 'classic',
        icons: {
          indicaciones: '../../../../assets/templates/bautizo/indicaciones.png',
          hospedaje: '../../../../assets/templates/bautizo/hospedaje.png',
          mesaRegalos: '../../../../assets/templates/bautizo/mesa-regalos.png',
          intinerario: '../../../../assets/templates/bautizo/intinerario.png'
        }
      },
      preview: '../../../../assets/templates/previews/bautizo_celestial.jpg'
    }
  ];

  constructor() {
    this.loadSavedTemplate();
  }

  getTemplates(): Template[] {
    return this.templates;
  }

  getTemplatesByCategory(category: string): Template[] {
    if (category === 'all') return this.templates;
    return this.templates.filter(t => t.category === category);
  }

  getTemplateById(id: string): Template | undefined {
    return this.templates.find(t => t.id === id);
  }

  setTemplate(templateId: string, eventId?: string): void {
    const template = this.getTemplateById(templateId);
    if (template) {
      this.currentTemplateSubject.next(template);
      this.applyTemplateToDOM(template);
      if (eventId) {
        localStorage.setItem(`template_${eventId}`, templateId);
      }
    }
  }

  getCurrentTemplate(): Template | null {
    return this.currentTemplateSubject.getValue();
  }

  private loadSavedTemplate(): void {
    const defaultTemplate = this.getTemplateById('romantic_pink');
    if (defaultTemplate) {
      this.currentTemplateSubject.next(defaultTemplate);
      this.applyTemplateToDOM(defaultTemplate);
    }
  }

  loadTemplateForEvent(eventId: string): void {
    const savedTemplateId = localStorage.getItem(`template_${eventId}`);
    if (savedTemplateId) {
      this.setTemplate(savedTemplateId);
    } else {
      this.loadSavedTemplate();
    }
  }

  applyTemplateToDOM(template: Template): void {
    const root = document.documentElement;
    const { colors, fonts, borderRadius } = template.theme;

    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--bg-color', colors.background);
    root.style.setProperty('--bg-alt-color', colors.backgroundAlt);
    root.style.setProperty('--text-color', colors.text);
    root.style.setProperty('--text-light-color', colors.textLight);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--overlay-color', colors.overlay);

    root.style.setProperty('--title-font', fonts.title);
    root.style.setProperty('--body-font', fonts.body);

    root.style.setProperty('--border-radius', borderRadius);
  }

  getIconForSection(section: keyof TemplateTheme['icons']): string {
    const template = this.getCurrentTemplate();
    if (template && template.theme.icons[section]) {
      return template.theme.icons[section];
    }
    switch(section) {
      case 'indicaciones': return '../../../../assets/Indicaciones.png';
      case 'hospedaje': return '../../../../assets/Hospedaje.png';
      case 'mesaRegalos': return '../../../../assets/MesaRegalos.png';
      case 'intinerario': return '../../../../assets/Intinerario.png';
      default: return '';
    }
  }

  // Ejemplo de objeto JSON para el backend
  getTemplateConfigExample(): object {
    return {
      id: "elegant_gold",
      name: "Elegante Dorado",
      category: "boda",
      style: "elegante",
      theme: {
        colors: {
          primary: "#C9A24D",
          secondary: "#2B2B2B",
          background: "#FFFFFF",
          backgroundAlt: "#F8F5F0",
          text: "#1A1A1A",
          textLight: "#828282",
          accent: "#D4AF37",
          overlay: "rgba(0, 0, 0, 0.5)"
        },
        fonts: {
          title: "'Playfair Display', serif",
          body: "'Montserrat', sans-serif"
        },
        borderRadius: "12px",
        iconStyle: "classic",
        icons: {
          indicaciones: "url-to-icon",
          hospedaje: "url-to-icon",
          mesaRegalos: "url-to-icon",
          intinerario: "url-to-icon"
        }
      },
      preview: "url-to-preview-image"
    };
  }
}
