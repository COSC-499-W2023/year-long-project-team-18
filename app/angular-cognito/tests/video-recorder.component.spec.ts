import { VideoRecorderComponent } from '../src/app/video-recorder/video-recorder.component';
import { describe, it, expect, beforeEach, vi} from 'vitest';

describe('OrganizationPageComponent', () => {
  
  let component: VideoRecorderComponent;
  let mockCognitoService;
  let mockKinesisVideoService: any;
  let mockDialog: any;
  let mockRouter: any;


  beforeEach(() => {
    vi.resetAllMocks();

    mockCognitoService = {
      getUsername: vi.fn().mockResolvedValue({}),
    };

    mockRouter = {
      navigate: vi.fn().mockResolvedValue({}),
    }
    
    component = new VideoRecorderComponent(mockRouter as any, mockRouter as any, mockDialog as any);
  });

  describe('Video recording button clicked', () => {
    it('should output success message upon video star button clicked', () => {
      component.startRecordingButtonClicked();
    });
  });

});