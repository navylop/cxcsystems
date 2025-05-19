import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaModalComponent } from './cita-modal.component';

describe('CitaModalComponent', () => {
  let component: CitaModalComponent;
  let fixture: ComponentFixture<CitaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitaModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CitaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
