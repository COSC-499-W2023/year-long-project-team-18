import {expect, jest, test} from '@jest/globals';
import { SignInComponent } from './sign-in.component';
import { Router } from '@angular/router';
import { CognitoService } from '../cognito.service';

describe('SignInComponent', () => {
  
    let component: SignInComponent;
    let routerMock: Partial<Router>;
    let cognitoServiceMock: Partial<CognitoService>;

    beforeEach(() => {
        // Setup mocks
        routerMock = {
        navigate: jest.fn(),
        };
        cognitoServiceMock = {
        signIn: jest.fn(),
        };

        // Create instance of SignInComponent with mocked dependencies
        component = new SignInComponent(routerMock as Router, cognitoServiceMock as CognitoService);
    });

    it('should set an error message for empty sign-in', () => {
    // Setup user with empty email and password
    component.user = { email: '', password: '' };

    // Call signIn method
    component.signIn();

    // Expect an error message to be set
    expect(component.errorMessage).toEqual('Email and password are required');

    // Ensure the signIn method of CognitoService was not called
    expect(cognitoServiceMock.signIn).not.toHaveBeenCalled();

    // Ensure loading is set to false
    expect(component.loading).toBe(false);
  });

});
