import { SignUpComponent } from '../src/app/sign-up/sign-up.component';
import { describe, it, expect, beforeEach, vi} from 'vitest';

describe('OrganizationPageComponent', () => {

  let component: SignUpComponent;
  let mockRouter = { navigate: vi.fn() };
  let mockCognitoService = { signUp: vi.fn() };
  let mockSignupService = {  };
  let mockSnackBar = {};

  beforeEach(() => {
    mockRouter.navigate.mockReset();
    mockCognitoService.signIn.mockReset();
    
    component = new SignUpComponent(mockRouter as any, mockCognitoService as any, mockSnackBar as any, mockSignupService as any);
  });

  describe('Sign up', () => {
    
  });

});
