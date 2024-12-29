import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayorComponent } from './payor.component';

describe('PayorComponent', () => {
  let component: PayorComponent;
  let fixture: ComponentFixture<PayorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
