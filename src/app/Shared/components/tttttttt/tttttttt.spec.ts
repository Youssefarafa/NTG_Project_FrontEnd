import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tttttttt } from './tttttttt';

describe('Tttttttt', () => {
  let component: Tttttttt;
  let fixture: ComponentFixture<Tttttttt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tttttttt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tttttttt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
