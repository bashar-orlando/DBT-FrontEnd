import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialoglayerComponent } from './dialoglayer.component';

describe('DialoglayerComponent', () => {
  let component: DialoglayerComponent;
  let fixture: ComponentFixture<DialoglayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialoglayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialoglayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
