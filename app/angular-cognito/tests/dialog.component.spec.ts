import { DialogComponent } from '../src/app/dialog/dialog.component';
import { describe, it, expect, beforeEach, vi} from 'vitest';

describe('OrganizationPageComponent', () => {
  let component: DialogComponent;
  let mockRouter: any;
  let mockCognitoService: any;
  let mockMatDialog: any;

  beforeEach(() => {
    vi.resetAllMocks();

    mockCognitoService = {
      updateUserAttribute: vi.fn().mockResolvedValue({}),
    }

    vi.spyOn(console, 'log');
    component = new DialogComponent(mockRouter as any, mockCognitoService as any, mockMatDialog as any);
  });

  describe('joinOrg Function', () => {
    it('should join and organization succesfully', () => {
      component.joinOrg("test");
      expect(console.log).toHaveBeenLastCalledWith("joinOrg Success");
    });
  });

});
