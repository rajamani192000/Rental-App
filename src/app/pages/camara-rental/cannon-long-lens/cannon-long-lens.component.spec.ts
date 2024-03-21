import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CannonLongLensComponent } from './cannon-long-lens.component';

describe('CannonLongLensComponent', () => {
  let component: CannonLongLensComponent;
  let fixture: ComponentFixture<CannonLongLensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CannonLongLensComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CannonLongLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
