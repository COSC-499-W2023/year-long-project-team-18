import { ProfileComponent } from '../src/app/profile/profile.component';
import { describe, it, expect, beforeEach, vi} from 'vitest';

describe('OrganizationPageComponent', () => {
  
  let component: ProfileComponent;
  let mockProfileService;
  let mockCognitoService;

  beforeEach(() => {
    vi.resetAllMocks();
    
     // Mocking CognitoService methods
     mockCognitoService = {
      getUser: vi.fn().mockResolvedValue({
        username: 'testUser',
        attributes: {},
        'custom:organization': ''
      }),
      updateUser: vi.fn().mockResolvedValue({})
    };

    // Mocking ProfileUpdateService methods
    mockProfileService = {
      update: vi.fn().mockReturnValue({
        subscribe: (successCallback: (arg0: {}) => void) => {
          successCallback({});
        }
      })
    };

    // Spying on console.log
    vi.spyOn(console, 'log');

    component = new ProfileComponent(mockCognitoService as any, mockProfileService as any);
  });

  describe('Update database succesfully', () => {
    it('should return success message when database is updated', async() => {

      await component.updateDb('123');

      // Assert: Check if console.log was called with 'Success'
      expect(console.log).toHaveBeenCalledWith('Success');

    });
  });

});
