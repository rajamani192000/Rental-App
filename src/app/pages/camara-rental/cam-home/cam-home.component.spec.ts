import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamHomeComponent } from './cam-home.component';

describe('CamHomeComponent', () => {
  let component: CamHomeComponent;
  let fixture: ComponentFixture<CamHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CamHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CamHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
