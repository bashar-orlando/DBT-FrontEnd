import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInstitutionsComponent } from './dialog-institutions.component';

describe('DialogInstitutionsComponent', () => {
  let component: DialogInstitutionsComponent;
  let fixture: ComponentFixture<DialogInstitutionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogInstitutionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogInstitutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
