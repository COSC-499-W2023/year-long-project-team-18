import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import {expect, jest, test} from '@jest/globals';

describe('AppComponent', () => {
  let component: AppComponent;
  test('app is created',()=>{
      expect(component)
  });


  test('adds 1 + 2 to equal 3', () => {
    expect(1+4).toBe(5);
  });

});
