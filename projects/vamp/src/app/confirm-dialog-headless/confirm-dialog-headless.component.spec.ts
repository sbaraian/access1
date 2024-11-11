import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogHeadlessComponent } from './confirm-dialog-headless.component';

describe('ConfirmDialogHeadlessComponent', () => {
  let component: ConfirmDialogHeadlessComponent;
  let fixture: ComponentFixture<ConfirmDialogHeadlessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogHeadlessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogHeadlessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
