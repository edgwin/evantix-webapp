import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InvitationService } from './invitation.service';
import { environment } from '../../environments/environment';

describe('InvitationService', () => {
  let service: InvitationService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.coreApiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InvitationService]
    });
    service = TestBed.inject(InvitationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ─── getAssetImages ──────────────────────────────────────────────────────

  it('getAssetImages should GET from correct endpoint', () => {
    const mockImages = [
      'assets/RedesSociales/Instagram.png',
      'assets/RedesSociales/Facebook.png'
    ];

    service.getAssetImages('RedesSociales').subscribe(images => {
      expect(images.length).toBe(2);
      expect(images[0]).toContain('RedesSociales');
    });

    const req = httpMock.expectOne(`${baseUrl}/api/assets/images/RedesSociales`);
    expect(req.request.method).toBe('GET');
    req.flush(mockImages);
  });

  // ─── getSocialNetworks ───────────────────────────────────────────────────

  it('getSocialNetworks should GET and return social network data', () => {
    const mockData = {
      imagen: '',
      details: [
        { id: '1', red: 'Instagram', url: 'https://instagram.com', imagen: 'assets/RedesSociales/Instagram.png' }
      ]
    };

    service.getSocialNetworks('evt1').subscribe((data: any) => {
      expect(data.details.length).toBe(1);
      expect(data.details[0].red).toBe('Instagram');
    });

    const req = httpMock.expectOne(`${baseUrl}/api/Invitacion/SocialNetworks/evt1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  // ─── postNewSocialNetwork ────────────────────────────────────────────────

  it('postNewSocialNetwork should POST to correct endpoint', () => {
    service.postNewSocialNetwork('evt1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/api/Invitacion/SocialNetwork/evt1`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  // ─── deleteSocialNetwork ─────────────────────────────────────────────────

  it('deleteSocialNetwork should DELETE with correct id', () => {
    service.deleteSocialNetwork('sn-123').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/api/Invitacion/SocialNetwork/sn-123`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  // ─── updateTableField ────────────────────────────────────────────────────

  it('updateTableField should PUT with correct payload', () => {
    service.updateTableField('SocialNetworkDetail', 'Id', 'sn-1', 'Imagen', 'assets/RedesSociales/TikTok.png').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/api/Invitacion/UpdateField/sn-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.tableName).toBe('SocialNetworkDetail');
    expect(req.request.body.fieldName).toBe('Imagen');
    req.flush({});
  });

  // ─── getInvitacion (datos completos de la invitacion) ───────────────────

  it('getInvitacion should GET invitation by eventId', () => {
    const mockInvitation = {
      portada: {},
      festejados: {},
      redesSociales: { imagen: '', details: [] }
    };

    service.getInvitacion('evt1').subscribe((data: any) => {
      expect(data).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/api/Invitacion/evt1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockInvitation);
  });
});
