import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LefttoolsComponent } from './lefttools.component';

describe('LefttoolsComponent', () => {
  let component: LefttoolsComponent;
  let fixture: ComponentFixture<LefttoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LefttoolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LefttoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
