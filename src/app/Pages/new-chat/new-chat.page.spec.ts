import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewChatPage } from './new-chat.page';

describe('NewChatPage', () => {
  let component: NewChatPage;
  let fixture: ComponentFixture<NewChatPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NewChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
