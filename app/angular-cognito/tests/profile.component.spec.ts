import { ProfileComponent } from '../src/app/profile/profile.component';
import { describe, it, expect, beforeEach, vi} from 'vitest';

describe('OrganizationPageComponent', () => {
  
  let component: ProfileComponent;
  let mockProfileService;
  let mockCognitoService;

  beforeEach(() => {
    vi.resetAllMocks();
     
    mockCognitoService = {
      getUser: vi.fn().mockResolvedValue({}),
      updateUser: vi.fn().mockResolvedValue({})
    };

    mockProfileService = {
      update: vi.fn().mockReturnValue({
        subscribe: (successCallback: (arg0: {}) => void) => {
          successCallback({});
        }
      })
    };

    vi.spyOn(console, 'log');
    component = new ProfileComponent(mockCognitoService as any, mockProfileService as any);
  });

  describe('Update database succesfully', () => {
    it('should return success message when database is updated', async() => {
      component.updateDb('123');
      expect(console.log).toHaveBeenCalledWith('Test Case 1: Success');
    });
  });

  describe('Update database unsuccesfully', () => {
    it('should return an empty string message when no org code is input', async() => {
      component.updateDb('');
      expect(console.log).toHaveBeenCalledWith('Test Case 2: Empty String');
    });
  });

});
