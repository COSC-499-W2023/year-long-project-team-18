import { InboxComponent } from '../src/app/inbox/inbox.component';
import { describe, it, expect, beforeEach, vi, afterEach} from 'vitest';

describe('InboxComponent', () => {
  let component: InboxComponent;
  let mockRouter: any;
  let mockCognitoService: any;

  beforeEach(() => {
    vi.resetAllMocks();

    mockCognitoService = {
      respondToShareRequest: vi.fn().mockReturnValue({
        subscribe: vi.fn((handlers) => handlers.next())
      }),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    vi.spyOn(console, 'log');
    component = new InboxComponent(mockRouter as any, mockCognitoService as any);
  });

  afterEach(() =>{
    vi.restoreAllMocks();
  });

  describe('removeFolderName Function', () => {
    it('should succesfully call the removeFolderName function', () => {
      component.removeFolderName("test");
      expect(console.log).toHaveBeenCalledWith("removeFolderName Success");
    });
  });

  describe('respondToRequest Function', () => {
    it('should succesfully call the fucntion', () => {
      component.respondToRequest("test","accept");
      expect(console.log).toHaveBeenCalledWith("respondtoRequest Success");
    });
  });

});
