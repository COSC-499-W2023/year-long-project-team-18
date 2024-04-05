import { SignUpComponent } from '../src/app/sign-up/sign-up.component';
import { describe, it, expect, beforeEach, vi, Mock} from 'vitest';

describe('OrganizationPageComponent', () => {

  let component: SignUpComponent;
  let mockRouter: { navigate: any; };
  let mockCognitoService;
  let mockSnackBar;
  let mockSignupService;

  beforeEach(() => {
    vi.resetAllMocks();

    mockCognitoService = {
      signUp: vi.fn().mockResolvedValue({}),
      checkS3UserFolder: vi.fn().mockResolvedValue(false),
      createS3UserFolder: vi.fn().mockResolvedValue({}),
      checkS3CaptionsFolder: vi.fn().mockResolvedValue(false),
      createS3CaptionsFolder: vi.fn().mockResolvedValue({}),
      subscribeUserToSnsTopic: vi.fn().mockResolvedValue({}),
    };

    mockRouter = {
      navigate: vi.fn().mockResolvedValue({}),
    };

    mockSnackBar = {
      open: vi.fn(),
    };

    mockSignupService = {
      getAll: vi.fn().mockResolvedValue([]),
      store: vi.fn().mockResolvedValue({})
    };

    vi.spyOn(console, 'log');

    component = new SignUpComponent(mockRouter as any, mockCognitoService as any, mockSnackBar as any, mockSignupService as any);
  });

  describe('Sign up', () => {
    it('should call signUpService and cognitoService on successful signup', async () => {

    });
  });
}); 