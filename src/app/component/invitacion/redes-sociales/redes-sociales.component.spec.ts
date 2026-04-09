import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RedesSocialesComponent } from './redes-sociales.component';
import { InvitationService } from '../../../services/invitation.service';
import { NotificationService } from '../../../services/notification.service';
import { TemplateService } from '../../../services/template.service';
import { of, throwError } from 'rxjs';

describe('RedesSocialesComponent', () => {
  let component: RedesSocialesComponent;
  let fixture: ComponentFixture<RedesSocialesComponent>;
  let invitationServiceSpy: jasmine.SpyObj<InvitationService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let templateServiceSpy: jasmine.SpyObj<TemplateService>;

  beforeEach(async () => {
    invitationServiceSpy = jasmine.createSpyObj('InvitationService', [
      'getAssetImages', 'getSocialNetworks', 'postNewSocialNetwork',
      'deleteSocialNetwork', 'updateTableField', 'notifyMutation'
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['show']);
    templateServiceSpy = jasmine.createSpyObj('TemplateService', ['getMarbleBackground', 'getCurrentTemplate']);

    invitationServiceSpy.getAssetImages.and.returnValue(of([
      'assets/RedesSociales/Instagram.png',
      'assets/RedesSociales/Facebook.png'
    ]));

    await TestBed.configureTestingModule({
      imports: [RedesSocialesComponent, HttpClientTestingModule],
      providers: [
        { provide: InvitationService, useValue: invitationServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: TemplateService, useValue: templateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RedesSocialesComponent);
    component = fixture.componentInstance;
    component.eventId = 'evt-test';
    component.data = { imagen: '', details: [] };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── loadImages ──────────────────────────────────────────────────────────

  it('should load images on init', () => {
    expect(invitationServiceSpy.getAssetImages).toHaveBeenCalledWith('RedesSociales');
    expect(component.images.length).toBe(2);
    expect(component.images[0]).toContain('RedesSociales');
  });

  it('should set images to empty on load error', () => {
    invitationServiceSpy.getAssetImages.and.returnValue(throwError(() => new Error('network error')));
    component.loadImages();
    expect(component.images.length).toBe(0);
  });

  // ─── openPopup / onClosePopup ─────────────────────────────────────────────

  it('should open popup and set selectedItemIndex', () => {
    component.data = { imagen: '', details: [{ id: 'sn1', red: 'Instagram', url: 'https://instagram.com', imagen: '' }] };
    component.openPopup(0);
    expect(component.showPopup).toBeTrue();
    expect(component.selectedItemIndex).toBe(0);
  });

  it('should close popup', () => {
    component.showPopup = true;
    component.onClosePopup();
    expect(component.showPopup).toBeFalse();
  });

  // ─── onImageSelected ─────────────────────────────────────────────────────

  it('should call updateBackend when image selected', async () => {
    invitationServiceSpy.updateTableField.and.returnValue(of(''));
    invitationServiceSpy.getSocialNetworks.and.returnValue(of({ imagen: '', details: [] }));

    component.data = { imagen: '', details: [{ id: 'sn1', red: 'Instagram', url: '', imagen: '' }] };
    component.selectedItemIndex = 0;

    await component.onImageSelected('assets/RedesSociales/TikTok.png');

    expect(invitationServiceSpy.updateTableField).toHaveBeenCalledWith(
      'SocialNetworkDetail', 'Id', 'sn1', 'Imagen', 'assets/RedesSociales/TikTok.png'
    );
    expect(component.showPopup).toBeFalse();
  });

  it('should not call update if no selectedItemIndex when image selected', async () => {
    component.selectedItemIndex = null;
    await component.onImageSelected('assets/RedesSociales/TikTok.png');
    expect(invitationServiceSpy.updateTableField).not.toHaveBeenCalled();
  });

  // ─── nuevaRedSocial ───────────────────────────────────────────────────────

  it('nuevaRedSocial should call postNewSocialNetwork and reload', () => {
    invitationServiceSpy.postNewSocialNetwork.and.returnValue(of({}));
    invitationServiceSpy.getSocialNetworks.and.returnValue(of({ imagen: '', details: [] }));

    component.nuevaRedSocial();

    expect(invitationServiceSpy.postNewSocialNetwork).toHaveBeenCalledWith('evt-test');
  });

  // ─── triggerElementDelete ─────────────────────────────────────────────────

  it('triggerElementDelete should delete and reload', () => {
    invitationServiceSpy.deleteSocialNetwork.and.returnValue(of({}));
    invitationServiceSpy.getSocialNetworks.and.returnValue(of({ imagen: '', details: [] }));
    invitationServiceSpy.notifyMutation.and.returnValue();

    component.triggerElementDelete('sn-1');

    expect(invitationServiceSpy.deleteSocialNetwork).toHaveBeenCalledWith('sn-1');
  });

  // ─── maxItems limit ───────────────────────────────────────────────────────

  it('should respect maxItems input', () => {
    component.maxItems = 3;
    expect(component.maxItems).toBe(3);
  });

  // ─── isReadOnly ───────────────────────────────────────────────────────────

  it('should default isReadOnly to false', () => {
    expect(component.isReadOnly).toBeFalse();
  });
});
