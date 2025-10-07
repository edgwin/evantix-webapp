import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesaRegalosComponent } from './mesa-regalos.component';

describe('MesaRegalosComponent', () => {
  let component: MesaRegalosComponent;
  let fixture: ComponentFixture<MesaRegalosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesaRegalosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MesaRegalosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
