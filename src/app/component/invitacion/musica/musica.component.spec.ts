import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MusicaComponent } from './musica.component';
import { InvitationService } from '../../../services/invitation.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';

describe('MusicaComponent', () => {
  let component: MusicaComponent;
  let fixture: ComponentFixture<MusicaComponent>;
  let mockInvitationService: jasmine.SpyObj<InvitationService>;

  const mockTrack = {
    id: '123',
    name: 'Wedding Song',
    audio: 'https://example.com/song.mp3',
    tags: ['wedding', 'ambient']
  };

  const mockTracks = [
    { id: '1', name: 'Track 1', audio: 'audio1.mp3' },
    { id: '2', name: 'Track 2', audio: 'audio2.mp3' }
  ];

  beforeEach(async () => {
    mockInvitationService = jasmine.createSpyObj('InvitationService', [
      'getTrackById',
      'getTracks',
      'updateTableField'
    ]);

    mockInvitationService.getTrackById.and.returnValue(of(mockTrack));
    mockInvitationService.getTracks.and.returnValue(of(mockTracks));
    mockInvitationService.updateTableField.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [MusicaComponent],
      providers: [
        { provide: InvitationService, useValue: mockInvitationService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MusicaComponent);
    component = fixture.componentInstance;
    component.eventId = 'test-event-id';
    component.trackId = '';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should have isReadOnly default to false', () => {
      expect(component.isReadOnly).toBeFalse();
    });

    it('should have empty trackId by default', () => {
      component.trackId = '';
      expect(component.trackId).toBe('');
    });
  });

  describe('ngOnInit', () => {
    it('should initialize audio element', () => {
      component.ngOnInit();
      expect(component.audio).toBeDefined();
      expect(component.audio.loop).toBeTrue();
      expect(component.audio.volume).toBe(0.6);
    });

    it('should restore saved track if trackId exists and not readOnly', fakeAsync(() => {
      component.trackId = '123';
      component.isReadOnly = false;
      component.ngOnInit();
      tick();

      expect(mockInvitationService.getTrackById).toHaveBeenCalledWith('123');
    }));

    it('should auto-play if readOnly and trackId exists', fakeAsync(() => {
      component.trackId = '123';
      component.isReadOnly = true;
      component.ngOnInit();
      tick();

      expect(mockInvitationService.getTrackById).toHaveBeenCalledWith('123');
    }));
  });

  describe('ngOnChanges', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.trackId = '123';
    });

    it('should auto-play when switching to readOnly', fakeAsync(() => {
      component.selectedTrack = mockTrack;
      component.audio.src = 'test.mp3';
      
      spyOn(component.audio, 'play').and.returnValue(Promise.resolve());

      component.ngOnChanges({
        isReadOnly: new SimpleChange(false, true, false)
      });
      tick();

      expect(component.audio.play).toHaveBeenCalled();
    }));

    it('should pause when switching to edit mode', () => {
      spyOn(component.audio, 'pause');
      
      component.ngOnChanges({
        isReadOnly: new SimpleChange(true, false, false)
      });

      expect(component.audio.pause).toHaveBeenCalled();
      expect(component.isPlaying).toBeFalse();
    });

    it('should not trigger on first change', () => {
      spyOn(component.audio, 'play');
      spyOn(component.audio, 'pause');

      component.ngOnChanges({
        isReadOnly: new SimpleChange(undefined, false, true)
      });

      expect(component.audio.play).not.toHaveBeenCalled();
      expect(component.audio.pause).not.toHaveBeenCalled();
    });
  });

  describe('Available tags', () => {
    it('should have predefined tags', () => {
      expect(component.availableTags.length).toBe(5);
      expect(component.availableTags[0].label).toBe('Ambiente');
    });

    it('should have empty selected tags by default', () => {
      expect(component.selectedTags.length).toBe(0);
    });
  });

  describe('loadAndAutoPlay', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.trackId = '123';
    });

    it('should load track and setup audio', fakeAsync(() => {
      spyOn(component.audio, 'load');
      spyOn(component.audio, 'play').and.returnValue(Promise.resolve());

      component.loadAndAutoPlay();
      tick();

      expect(component.selectedTrack).toEqual(mockTrack);
      expect(component.audio.src).toContain(mockTrack.audio);
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle play failure gracefully', fakeAsync(() => {
      spyOn(component.audio, 'load');
      spyOn(component.audio, 'play').and.returnValue(Promise.reject('Autoplay blocked'));

      component.loadAndAutoPlay();
      tick();

      expect(component.isPlaying).toBeFalse();
    }));
  });

  describe('Playing state', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should have isPlaying false by default', () => {
      expect(component.isPlaying).toBeFalse();
    });

    it('should have isLoading true by default', () => {
      expect(component.isLoading).toBeTrue();
    });
  });

  describe('Tracks', () => {
    it('should have empty tracks array by default', () => {
      expect(component.tracks.length).toBe(0);
    });

    it('should have null selectedTrackId by default', () => {
      expect(component.selectedTrackId).toBeNull();
    });
  });

  describe('ReadOnly mode', () => {
    it('should accept isReadOnly input', () => {
      component.isReadOnly = true;
      expect(component.isReadOnly).toBeTrue();
    });
  });
});
