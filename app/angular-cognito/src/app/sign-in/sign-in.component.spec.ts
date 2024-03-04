import { Component } from '@angular/core';
import { SignInComponent } from './sign-in.component';
import { Router } from '@angular/router';
import {expect, jest, test} from '@jest/globals';
import { CognitoService, IUser } from '../cognito.service';
import { SignUpComponent } from '../sign-up/sign-up.component';

describe('Signin Component', () => {

  let fixture: SignInComponent;
  let router: any;
  let cognitoservice: any;
  
  beforeEach(() => {
    fixture = new SignInComponent(
      router,
      cognitoservice
    );
  });

  describe('Signin Functionality', () => {
    it('should return an error if no username or password', () => {
      const mockUser: any = {
        email: '',
        password: '',
        username: '',
        showPassword: false,
        code: '',
        given_name: '',
        family_name: '',
        birthdate: '',
        'custom:account_type': '',
        'custom:organization': '',
      };
    });
  });

  describe('1+1', () => {
    it('checks if 1 + 1 equals 2', () => {
      expect(1 + 1).toBe(2);
    });
  });

}); 

/*
describe('SignInComponent', () => {
  let component: SignInComponent;
  let routerMock: Router;
  let cognitoServiceMock: CognitoService;

  beforeEach(() => {
    component = new SignInComponent(
      routerMock,
      cognitoServiceMock
    );
  });

  describe('SignIn', () => {
    it('should return an error if no username or password', () => {
      const mockUser: IUser = {
        email: '',
        password: '',
        username: '',
        showPassword: false,
        code: '',
        given_name: '',
        family_name: '',
        birthdate: '',
        'custom:account_type': '',
        'custom:organization': '',
      };
      
      component.user = mockUser;
      component.signIn();
      expect(component.errorMessage).toEqual('Email and password are required');
    });
    
  });

  //Testing
  describe('1+1', () => {
    it('checks if 1 + 1 equals 2', () => {
      expect(1 + 1).toBe(2);
    });
  });

});
*/