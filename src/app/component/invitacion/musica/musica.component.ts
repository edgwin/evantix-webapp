import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { InvitationService } from '../../../services/invitation.service';
import { FormsModule } from '@angular/forms';
import { TemplateService } from '../../../services/template.service';

interface MusicTag {
  label: string;
  value: string;
}

@Component({
    selector: 'app-musica',
    imports: [FormsModule],
    templateUrl: './musica.component.html',
    styleUrls: ['./musica.component.css']
})
export class MusicaComponent implements OnInit, OnChanges, OnDestroy {

  @Input() eventId: string = '';
  @Input() trackId: string = '';
  @Input() isReadOnly: boolean = false;
  @Output() trackChanged = new EventEmitter<string>();
  availableTags: MusicTag[] = [
    { label: 'Ambiente', value: 'ambient' },
    { label: 'Soundtrack', value: 'soundtrack' },
    { label: 'Piano', value: 'piano' },
    { label: 'Cinemática', value: 'cinematic' },
    { label: 'Bodas', value: 'wedding' }
  ];
  selectedTags: MusicTag[] = [];

  tracks: any[] = [];
  selectedTrackId: string | null = null;
  selectedTrack: any = null;

  audio!: HTMLAudioElement;
  isPlaying = false;
  saved = this.trackId !== "";
  isLoading = true;
  private pendingAutoplay = false;
  private autoplayListener: (() => void) | null = null;

  constructor(
    private invitationService: InvitationService,
    public templateService: TemplateService
  ) { }

  ngOnInit() {
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.volume = 0.6;

    this.audio.onended = () => this.isPlaying = false;
    if (this.trackId) {
      if (this.isReadOnly) {
        this.loadAndAutoPlay();
      } else {
        this.restoreSavedTrack();
      }
    }
  }

  ngOnDestroy() {
    this.removeAutoplayListener();
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isReadOnly'] && !changes['isReadOnly'].firstChange) {
      const isNowReadOnly = changes['isReadOnly'].currentValue;
      if (isNowReadOnly && this.trackId) {
        // Cambió a ReadOnly, auto-reproducir
        if (this.selectedTrack && this.audio.src) {
          this.tryPlay();
        } else {
          this.loadAndAutoPlay();
        }
      } else if (!isNowReadOnly) {
        // Cambió a modo edición, pausar
        this.audio.pause();
        this.isPlaying = false;
        this.removeAutoplayListener();
      }
    }
  }

  /**
   * Intenta reproducir el audio. Si el navegador lo bloquea por falta de
   * interacción del usuario (autoplay policy), registra un listener de
   * un solo uso en click/touchstart para reintentar en cuanto el usuario
   * toque la pantalla.
   */
  private tryPlay() {
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.pendingAutoplay = false;
      this.removeAutoplayListener();
    }).catch(() => {
      // El navegador bloqueó el autoplay — esperar interacción del usuario
      this.isPlaying = false;
      this.pendingAutoplay = true;
      this.registerAutoplayListener();
    });
  }

  private registerAutoplayListener() {
    if (this.autoplayListener) return; // ya registrado
    this.autoplayListener = () => {
      // Si no hay src todavía, ignoramos esta interacción pero mantenemos el listener 
      // (no llamamos a removeAutoplayListener aquí si no hay src)
      if (!this.audio.src) return;

      this.audio.play().then(() => {
        this.isPlaying = true;
        this.pendingAutoplay = false;
        this.removeAutoplayListener();
      }).catch(() => {
        this.isPlaying = false;
        // Si falla con interacción, removemos para evitar reintentos infinitos, 
        // pero el usuario podrá dar play manual.
        this.removeAutoplayListener();
      });
    };
    
    const events = ['click', 'touchstart', 'mousedown', 'pointerdown'];
    events.forEach(e => document.addEventListener(e, this.autoplayListener!, { once: true }));
  }

  private removeAutoplayListener() {
    if (this.autoplayListener) {
      const events = ['click', 'touchstart', 'mousedown', 'pointerdown'];
      events.forEach(e => document.removeEventListener(e, this.autoplayListener!));
      this.autoplayListener = null;
    }
    this.pendingAutoplay = false;
  }

  loadAndAutoPlay() {
    this.invitationService.getTrackById(this.trackId)
      .subscribe(track => {
        this.selectedTrack = track;
        if (track && track.audio) {
          this.audio.src = track.audio;
          this.audio.load();
          this.tryPlay();
        }
        this.isLoading = false;
      });
  }

  restoreSavedTrack() {
    this.invitationService.getTrackById(this.trackId)
      .subscribe(track => {
        this.selectedTrack = track;
        this.saved = true;

        const matchedTags = this.availableTags.filter(t =>
          track.tags?.includes(t.value)
        );

        this.selectedTags = matchedTags;

        if (!this.selectedTags.length) return;

        this.loadMusic(true); // aquí entra la magia
      });
  }

  toggleTag(tag: MusicTag) {
    const exists = this.selectedTags.find(t => t.value === tag.value);

    if (exists) {
      this.selectedTags = this.selectedTags.filter(t => t.value !== tag.value);
    } else {
      this.selectedTags.push(tag);
    }

    if (this.selectedTags.length) {
      this.loadMusic();
    } else {
      this.tracks = [];
    }
  }

  loadMusic(restoreSelection = false) {
    const tagValues = this.selectedTags.map(t => t.value);

    this.invitationService.getTracks(tagValues)
      .subscribe(async res => {
        this.tracks = res ?? [];
        this.isLoading = false;
        if (restoreSelection && this.trackId) {
          await this.ensureSavedTrackExists();
          this.applySavedSelection();
        }
      });
  }

  async ensureSavedTrackExists() {
    if (!this.trackId) return;

    const exists = this.tracks.some(t => t.id === this.trackId);
    if (exists) return;

    try {
      const track = await this.invitationService
        .getTrackById(this.trackId)
        .toPromise();

      if (track) {
        // lo inyectamos manualmente
        this.tracks.unshift(track);
      }
    } catch {
      // si Jamendo no responde, no rompemos la app
    }
  }


  applySavedSelection() {
    const found = this.tracks.find(t => t.id === this.trackId);
    if (!found) return;

    this.selectedTrack = found;
    this.selectedTrackId = found.id;

    this.audio.src = found.audio;
    this.audio.load();
  }

  onTrackChange() {
    this.selectedTrack = this.tracks.find(t => t.id === this.selectedTrackId) ?? null;
    if (!this.selectedTrack) return;

    this.audio.pause();
    this.audio.src = this.selectedTrack.audio;
    this.audio.load();

    this.audio.play();
    this.isPlaying = true;

    // Auto-guardar la selección en la BD
    this.invitationService.addTrack(this.eventId, this.selectedTrack.id)
      .subscribe({
        next: () => {
          this.saved = true;
          this.trackId = this.selectedTrack.id;
          this.trackChanged.emit(this.selectedTrack.id);
        },
        error: () => { }
      });
  }

  togglePlayPause() {
    if (!this.audio.src) return;

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    } else {
      this.audio.play();
      this.isPlaying = true;
    }
  }

  saveTrack() {
    if (!this.selectedTrack) return;

    this.invitationService.addTrack(this.eventId, this.selectedTrack.id)
      .subscribe(
        {
          next: () => {
            this.saved = true;
            this.trackId = this.selectedTrack.id;
          },
          error: (err) => {
          }
        }
      );
  }

  deleteTrack() {
    if (!this.selectedTrack) return;

    this.invitationService.deleteTrack(this.eventId)
      .subscribe(
        {
          next: () => {
            this.saved = false;
          },
          error: () => {
          }
        }
      );
  }

  reset() {
    this.tracks = [];
    this.selectedTrack = null;
    this.audio.pause();
    this.audio.src = '';
    this.isPlaying = false;
  }
}
