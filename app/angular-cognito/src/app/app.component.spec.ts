import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import {expect, jest, test} from '@jest/globals';

beforeEach(()=>{
  let component: AppComponent
})

test('app is created',()=>{
  expect(component).toBeTruthy

})

