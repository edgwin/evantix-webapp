import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntinerarioComponent } from './intinerario.component';

describe('IntinerarioComponent', () => {
  let component: IntinerarioComponent;
  let fixture: ComponentFixture<IntinerarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntinerarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IntinerarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
