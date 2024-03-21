import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanonSevenhundredDetailsComponent } from './canon-sevenhundred-details.component';

describe('CanonSevenhundredDetailsComponent', () => {
  let component: CanonSevenhundredDetailsComponent;
  let fixture: ComponentFixture<CanonSevenhundredDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanonSevenhundredDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanonSevenhundredDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
