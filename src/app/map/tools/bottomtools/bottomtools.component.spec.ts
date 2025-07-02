import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomtoolsComponent } from './bottomtools.component';

describe('BottomtoolsComponent', () => {
  let component: BottomtoolsComponent;
  let fixture: ComponentFixture<BottomtoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomtoolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomtoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
