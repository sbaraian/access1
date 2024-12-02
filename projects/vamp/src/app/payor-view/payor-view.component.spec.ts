import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayorViewComponent } from './payor-view.component';

describe('PayorViewComponent', () => {
  let component: PayorViewComponent;
  let fixture: ComponentFixture<PayorViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayorViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
