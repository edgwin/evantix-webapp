import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupHtmlComponent } from './popup-html.component';

describe('PopupHtmlComponent', () => {
  let component: PopupHtmlComponent;
  let fixture: ComponentFixture<PopupHtmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PopupHtmlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PopupHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
