import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoDialogComponent } from './pago-dialog.component';

describe('PagoDialogComponent', () => {
  let component: PagoDialogComponent;
  let fixture: ComponentFixture<PagoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PagoDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PagoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
