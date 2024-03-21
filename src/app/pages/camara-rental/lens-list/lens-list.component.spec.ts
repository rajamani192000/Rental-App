import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LensListComponent } from './lens-list.component';

describe('LensListComponent', () => {
  let component: LensListComponent;
  let fixture: ComponentFixture<LensListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LensListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LensListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
