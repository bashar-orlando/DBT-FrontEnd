import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RighttoolsComponent } from './righttools.component';

describe('RighttoolsComponent', () => {
  let component: RighttoolsComponent;
  let fixture: ComponentFixture<RighttoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RighttoolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RighttoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
