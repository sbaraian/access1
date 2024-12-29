import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayorsComponent } from './payors.component';

describe('PayorsComponent', () => {
  let component: PayorsComponent;
  let fixture: ComponentFixture<PayorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
