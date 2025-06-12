import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitacionesComponent } from './invitaciones.component';

describe('InvitacionesComponent', () => {
  let component: InvitacionesComponent;
  let fixture: ComponentFixture<InvitacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvitacionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InvitacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
