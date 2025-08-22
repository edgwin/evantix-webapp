import { ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { InvitationService } from '../../services/invitation.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-invitaciones',
  templateUrl: './invitaciones.component.html',
  styleUrl: './invitaciones.component.css'
})

export class InvitacionesComponent implements OnInit {
  loading: boolean = true;
  saveBtnDisabled: boolean = false;
  loggedUser: any;
  rowData:any;
  eventList:any = null;
  selectedElement: any = null;
  codigosPais = [
    { name: 'México', dialCode: '+52' },
    { name: 'Estados Unidos', dialCode: '+1' },
    { name: 'Colombia', dialCode: '+57' },
    { name: 'Argentina', dialCode: '+54' },
    { name: 'España', dialCode: '+34' },
    { name: 'Chile', dialCode: '+56' },
    { name: 'Perú', dialCode: '+51' },
    { name: 'Ecuador', dialCode: '+593' },
    // agrega los que necesites
  ];
  indicaciones: { titulo: string; descripcion: string }[] = [
    { titulo: '', descripcion: '' }
  ];
  dondeCuando: {
    actividad: string;
    lugar: string;
    ubicacion: string;
    fechaHora: string;
    direccion: string;
    imagen: any;
  }[] = [
    { actividad: '', lugar: '', ubicacion: '', fechaHora: '', direccion: '', imagen: null }
  ];
  intinerario: {
    actividad: string;    
    fecha: string;
  }[] = [
    { actividad: '', fecha: '' }
  ];
  mesaRegalos: { opcion: string; descripcion: string; imagen: any }[] = [
    { opcion: '', descripcion: '', imagen: null }
  ];  
  personaFavorita: { imagen: any; nombre: string; parentesco: string }[] = [
    { imagen: null, nombre: '', parentesco: '' }
  ];
  video: any = null;
  socialNetwork: { red: string; url: string }[] = [
    { red: '', url: '' }
  ];
  
  hospedajes: {
    nombreLugar: string;
    direccion: string;
    url: string;
    telefono: string;
  }[] = [
    { nombreLugar: '', direccion: '', url: '', telefono: ''}
  ];

  contactos: { nombre: string; codigoPais:string; whatsapp: string }[] = [
    { nombre: '', codigoPais: '', whatsapp: '' }
  ];

  festejados: { imagen: any; nombre: string; frase: string } = { imagen: null, nombre: '', frase: '' };
  imagenPortada: { imagen: any; } = { imagen: null };
  imagenHospedaje: { imagen: any; } = { imagen: null };

  @ViewChildren('festejadoInput') festejadoInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('indicacionesInput') indicacionesInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('actividadInput') actividadInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('dondeCuandoInput') dondeCuandoInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('intinerarioInput') intinerarioInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('mesaRegalosInputs') mesaRegalosInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('personaFavoritaInputs') personaFavoritaInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('socialNetworks') socialNetworksInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('hospedajeInputs') hospedajeInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('contactoInputs') contactoInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('portadaFileInput') portadaFileInput!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('dondeYCuandoFileInput') dondeYCuandoFileInput!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('festejadosFileInput') festejadosFileInput!: QueryList<ElementRef<HTMLInputElement>>;  
  @ViewChildren('hospedajeFileInput') hospedajeFileInput!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChild('galleryFileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(private eventService: EventService, private invitationService: InvitationService, private route: ActivatedRoute, private router: Router, private notificationService: NotificationService){
    const localUser = localStorage.getItem('loggedUser');
    if(localUser != null) {
      this.loggedUser = JSON.parse(localUser);
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const eventId: any = params['id'];
      this.eventService.getEventsById(eventId).subscribe({
        next: (res) => {
          this.rowData = res;
          this.loading = false;
          if (this.rowData !== null) {
            this.eventList = this.rowData.id;
            this.selectedElement = this.rowData;
        }
        },
        error: (err) => {
          console.log(err);
          this.notificationService.show('error',`Hubo un error al obtener los eventos del usuario ${err.message}`);
          this.loading = false;
        }
      });
    });
  }

  agregarIndicaciones(): void {
    if (this.indicaciones.length >= 3) return;

    this.indicaciones = [...this.indicaciones, { titulo: '', descripcion: '' }];

    setTimeout(() => {
      const lastInput = this.indicacionesInputs.last;
      if (lastInput) {
        lastInput.nativeElement.focus();
      }
    }, 0);
  }

  eliminarIndicaciones(index: number): void {
    const nuevaLista = [...this.indicaciones];
    nuevaLista.splice(index, 1);
    this.indicaciones = nuevaLista;
  } 

  trackByIndex(index: number, item: any): number {
    return index;
  }  

  onIndicacionEnter(event: any): void {
    event.preventDefault();
    this.agregarIndicaciones();
  } 

  agregarDondeCuando(hacerFocus: boolean = true): void {
    if (this.dondeCuando.length >= 5) return;

    this.dondeCuando = [
      ...this.dondeCuando,
      { actividad: '', lugar: '', fechaHora: '', direccion: '', ubicacion: '', imagen: null }
    ];

    if (hacerFocus) {
      setTimeout(() => {
        const lastInput = this.dondeCuandoInputs?.last;
        if (lastInput) {
          lastInput.nativeElement.focus();
        }
      }, 0);
    }
  }

  eliminarDondeCuando(index: number): void {
    const lista = [...this.dondeCuando];
    lista.splice(index, 1);
    this.dondeCuando = lista;
  }

  agregarIntinerario(hacerFocus: boolean = true): void {
    if (this.intinerario.length >= 8) return;

    this.intinerario = [
      ...this.intinerario,
      { actividad: '', fecha: '' }
    ];

    if (hacerFocus) {
      setTimeout(() => {
        const lastInput = this.intinerarioInputs?.last;
        if (lastInput) {
          lastInput.nativeElement.focus();
        }
      }, 0);
    }
  }

  eliminarIntinerario(index: number): void {
    const lista = [...this.intinerario];
    lista.splice(index, 1);
    this.intinerario = lista;
  }

  agregarMesaRegalos(): void {
    if (this.mesaRegalos.length >= 3) return;

    this.mesaRegalos = [
      ...this.mesaRegalos,
      { opcion: '', descripcion: '', imagen: null}
    ];

    setTimeout(() => {
      const lastInput = this.mesaRegalosInputs?.last;
      if (lastInput) lastInput.nativeElement.focus();
    }, 0);
  }

  eliminarMesaRegalos(index: number): void {
    const nuevaLista = [...this.mesaRegalos];
    nuevaLista.splice(index, 1);
    this.mesaRegalos = nuevaLista;
  }

  agregarPersonaFavorita(): void {
    if (this.personaFavorita.length >= 8) return;
    this.personaFavorita = [
      ...this.personaFavorita,
      { imagen: '', nombre: '', parentesco: ''}
    ];

    setTimeout(() => {
      const lastInput = this.personaFavoritaInputs?.last;
      if (lastInput) lastInput.nativeElement.focus();
    }, 0);
  }

  eliminarPersonaFavorita(index: number): void {
    const nuevaLista = [...this.personaFavorita];
    nuevaLista.splice(index, 1);
    this.personaFavorita = nuevaLista;
  }

  agregarSocialNetwork(): void {
    if (this.socialNetwork.length >= 5) return;

    this.socialNetwork = [...this.socialNetwork, { red: '', url: '' }];

    setTimeout(() => {
      const lastInput = this.socialNetworksInputs?.last;
      if (lastInput) {
        lastInput.nativeElement.focus();
      }
    }, 0);
  }

  eliminarSocialNetwork(index: number): void {
    const nuevaLista = [...this.socialNetwork];
    nuevaLista.splice(index, 1);
    this.socialNetwork = nuevaLista;
  }

  agregarHospedaje(): void {
    if (this.hospedajes.length >= 3) return;

    this.hospedajes = [...this.hospedajes, { nombreLugar: '', url: '', direccion: '', telefono: ''}];

    setTimeout(() => {
      const lastInput = this.hospedajeInputs?.last;
      if (lastInput) {
        lastInput.nativeElement.focus();
      }
    }, 0);
  }

  eliminarHospedaje(index: number): void {
    const lista = [...this.hospedajes];
    lista.splice(index, 1);
    this.hospedajes = lista;
  }

  agregarContacto(): void {
    if (this.contactos.length >= 2) return;

    this.contactos = [...this.contactos, { nombre: '', codigoPais: '', whatsapp: '' }];

    setTimeout(() => {
      const lastInput = this.contactoInputs.last;
      if (lastInput) {
        lastInput.nativeElement.focus();
      }
    }, 0);
  }

  eliminarContacto(index: number): void {
    const nuevaLista = [...this.contactos];
    nuevaLista.splice(index, 1);
    this.contactos = nuevaLista;
  } 

  sincronizarInput(index: number, valor: string, destino: any[], propiedad: string): void {
    if (destino && destino[index] && propiedad in destino[index]) {
      destino[index][propiedad] = valor;
    }
  }
  
  reordenarIntinerario(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.intinerario, event.previousIndex, event.currentIndex);
  }


  //******************************************************/

  imagenPersonaFavNames: string[] = [];

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.imagenPersonaFavNames[index] = file.name;
      this.personaFavorita[index].imagen = file;
    } else {
      this.imagenPersonaFavNames[index] = '';
      this.personaFavorita[index].imagen = null;
    }
  }

  imagenFestejados: string = '';

  onFileSelectedFestejados(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.imagenFestejados = file.name;
      this.festejados.imagen = file;
    } else {
      this.imagenFestejados = '';
      this.festejados.imagen = null;
    }
  }

  imagenPortadaSelected: string = '';
  onFileSelectedPortada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.imagenPortadaSelected = file.name;
      this.imagenPortada.imagen = file;
    } else {
      this.imagenPortadaSelected = '';
      this.imagenPortada.imagen = null;
    }
  }

  imagenDondeYCuandoSelected: string[] = [];
  onFileSelectedDondeYCuando(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.imagenDondeYCuandoSelected[index] = file.name;
      this.dondeCuando[index].imagen = file;
    } else {
      this.imagenDondeYCuandoSelected[index] = '';
      this.dondeCuando[index].imagen = null;
    }
  }

  imagenHospedajeSelected: string = '';
  onFileSelectedHospedaje(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.imagenHospedajeSelected = file.name;
      this.imagenHospedaje.imagen = file;
    } else {
      this.imagenHospedajeSelected = '';
      this.imagenHospedaje.imagen = null;
    }
  }

  isHovering = false;
  previewImages: string[] = [];
  selectedFiles: File[] = [];

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isHovering = true;
  }

  onDragLeave(event: DragEvent) {
    this.isHovering = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isHovering = false;
    if (event.dataTransfer?.files) {
      this.processFiles(event.dataTransfer.files);
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
    }
  }

  processFiles(files: FileList) {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => this.previewImages.push(e.target.result);
        reader.readAsDataURL(file);
      }
    });
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewImages.splice(index, 1);

    // Si ya no hay archivos, resetea el input
    if (this.selectedFiles.length === 0 && this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  videoUrl: string = '';
  urlPattern: string =
    '^(https?:\\/\\/)?' + // http:// o https://
    '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})' + // dominio
    '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + // puerto y ruta
    '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-zA-Z\\d_]*)?$'; // fragmento

  submitForm() {
    this.loading = true;
    this.saveBtnDisabled = true;  
    const formData = new FormData();
    formData.append('eventoId', this.eventList);
    formData.append('videoUrl', this.videoUrl);
    formData.append('portadaImg', this.imagenPortada.imagen);
    formData.append('hospedajeImg', this.imagenHospedaje.imagen);
    formData.append(`festejados.nombre`, this.festejados.nombre);
    formData.append(`festejados.frase`, this.festejados.frase);

    // Festejados
    if (this.festejados.imagen instanceof File) {
      formData.append(`festejados.imagen`, this.festejados.imagen);
    }
    // 📋 Indicaciones
    this.indicaciones.forEach((item, index) => {
      formData.append(`indicaciones[${index}][titulo]`, item.titulo);
      formData.append(`indicaciones[${index}][descripcion]`, item.descripcion);
    });   

    // 📍 Donde y Cuándo
    this.dondeCuando.forEach((item, index) => {
      formData.append(`DondeCuando[${index}].Actividad`, item.actividad);
      formData.append(`DondeCuando[${index}].Lugar`, item.lugar);
      formData.append(`DondeCuando[${index}].Ubicacion`, item.ubicacion);
      formData.append(`DondeCuando[${index}].FechaHora`, item.fechaHora);
      formData.append(`DondeCuando[${index}].Direccion`, item.direccion);

      if (item.imagen) {
        formData.append(`DondeCuando[${index}].Imagen`, item.imagen);
      }
    });

    // 📍 Intinerario
    this.intinerario.forEach((item, index) => {
      formData.append(`intinerario[${index}][actividad]`, item.actividad);            
      formData.append(`intinerario[${index}][fecha]`, item.fecha);      
    });

    // 🎁 Mesa de Regalos
    this.mesaRegalos.forEach((item, index) => {
      formData.append(`mesaRegalos[${index}][opcion]`, item.opcion);
      formData.append(`mesaRegalos[${index}][descripcion]`, item.descripcion);      
      formData.append(`mesaRegalos[${index}][imagen]`, item.imagen);      
    });    

    // Personas Favoritas
    this.personaFavorita.forEach((p, i) => {
      formData.append(`personaFavorita[${i}].nombre`, p.nombre);
      formData.append(`personaFavorita[${i}].parentesco`, p.parentesco);
      if (p.imagen instanceof File) {
        formData.append(`personaFavorita[${i}].imagen`, p.imagen);
      }
    });

    // 📷 Galería
    this.selectedFiles.forEach((file, index) => {
      formData.append(`galeriaFotos`, file);
    });

    // 🌐 Redes Sociales
    this.socialNetwork.forEach((item, index) => {
      formData.append(`socialNetwork[${index}][red]`, item.red);
      formData.append(`socialNetwork[${index}][url]`, item.url);
    });

    // 🏨 Hospedajes
    this.hospedajes.forEach((item, index) => {
      formData.append(`hospedajes[${index}][nombreLugar]`, item.nombreLugar);
      formData.append(`hospedajes[${index}][direccion]`, item.direccion);
      formData.append(`hospedajes[${index}][url]`, item.url);
      formData.append(`hospedajes[${index}][telefono]`, item.telefono);
    });

    // ☎ Contactos
    this.contactos.forEach((item, index) => {
      formData.append(`contactos[${index}][nombre]`, item.nombre);
      formData.append(`contactos[${index}][codigoPais]`, item.codigoPais);
      formData.append(`contactos[${index}][whatsapp]`, item.whatsapp);
    });

    // 🌐 Llamar a servicio que conecta con el backend
    this.invitationService.guardarInvitacion(formData).subscribe({
      next: () => {
        this.loading = false;
        this.saveBtnDisabled = false;
        this.notificationService.show('info',`Se cargo la informacion de su invitacion con exito`);
        this.router.navigateByUrl('/dashboard'); 
      },
      error: (err) => {
        this.loading = false;
        this.saveBtnDisabled = false;
        this.notificationService.show('error',`Hubo un error al cargar la informacion del usuario, intente mas tarde`); 
      }
    });
  } 
}
