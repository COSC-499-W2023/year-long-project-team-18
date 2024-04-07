import { DashboardComponent } from '../src/app/dashboard/dashboard.component';
import { describe, it, expect, beforeEach, vi} from 'vitest';

describe('OrganizationPageComponent', () => {

  let component: DashboardComponent;
  let mockRouter;
  let mockCognitoService;
  let mockMatDialog: any;

  beforeEach(() => {
    vi.resetAllMocks();

    mockRouter = {
    };

    mockCognitoService = {
      getUser: vi.fn().mockResolvedValue({}),
      updateUserAttribute: vi.fn().mockResolvedValue({})
    };

    vi.spyOn(console, 'log');
    component = new DashboardComponent(mockRouter as any, mockCognitoService as any, mockMatDialog as any);
  });

  describe('joinCode Function', () => {
    it('should succesfully join an org', () => {
      component.joinOrg("test");
      expect(console.log).toHaveBeenCalledWith("joinCode Success")
    });
  });

});
