import { SignInComponent } from '../src/app/sign-in/sign-in.component';
import { Router } from '@angular/router';
import { CognitoService, IUser } from '../src/app/cognito.service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Signin Component', () => {

  let component: SignInComponent;
  let router: Router;
  let cognitoService: CognitoService;

  beforeEach(() => {
    component = new SignInComponent(router, cognitoService);
  });

  describe('Signin: No data', () => {
    it('should display an error message when logging in without any information', async () => {
      // Calling the signIn function without any user data being entered
      component.signIn();
      expect(component.errorMessage).toBe('Email and password are required');
    });
  });
  
  //describe('Signin: With wrong data', () => {
  //  
  //});

}); 