import { SignUpComponent } from '../src/app/sign-up/sign-up.component';
import { describe, it, expect, beforeEach, vi} from 'vitest';

describe('OrganizationPageComponent', () => {

  let component: SignUpComponent;
  let mockRouter = { navigate: vi.fn() };
  let mockCognitoService = { signUp: vi.fn() };
  let mockSnackBar = {};
  let mockSignupService = {};

  beforeEach(() => {
    mockRouter.navigate.mockReset();
    mockCognitoService.signUp.mockReset();
    component = new SignUpComponent(mockRouter as any, mockCognitoService as any, mockSnackBar as any, mockSignupService as any);
  });

  describe('Sign up', () => {
    it('should call signUpService and cognitoService on successful signup', async () => {
      const testUser = {
        email: "test@example.com",
        username: "testUser",
        password: "Password1!",
        firstname: "Test",
        lastname: "User",
        birthdate: "2000-01-01",
        'custom:organization': "123",
        'custom:account_type': "Personal"
      };
    
      component.user = testUser;

      await component.signUp(testUser.username, testUser['custom:organization'], { valid: true } as any);

    });
  });
}); 