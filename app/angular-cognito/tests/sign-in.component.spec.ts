import { SignInComponent } from '../src/app/sign-in/sign-in.component';
import { describe, it, expect, beforeEach, vi} from 'vitest';

describe('Signin Component', () => {

  let component: SignInComponent;
  let mockRouter = { navigate: vi.fn() };
  let mockCognitoService = { signIn: vi.fn() };

  beforeEach(() => {
    mockRouter.navigate.mockReset();
    mockCognitoService.signIn.mockReset();
    
    component = new SignInComponent(mockRouter as any, mockCognitoService as any);
  });

  describe('Signin: No data', () => {
    it('should display an error message when logging in without any information', async () => {
      component.signIn();
      expect(component.errorMessage).toEqual('Email and password are required');
    });
  });
  
  describe('Signin: Incorrect email and password', () => {
    it('should display a user not found error', async () => {
      mockCognitoService.signIn.mockRejectedValue(new Error('Incorrect email or password'));
      component.user.email = "invalid@email.com";
      component.user.password = "invalid";
      
      //Waiting for the signin function to be complete, in order to receive the error from the catch block
      await component.signIn();
      expect(component.errorMessage).toBe('Incorrect email or password');
    });
  });

  describe('Signin: Correct email and password', () => {
    it('should succesfully log the user in', async () => {

    });
  });

}); 