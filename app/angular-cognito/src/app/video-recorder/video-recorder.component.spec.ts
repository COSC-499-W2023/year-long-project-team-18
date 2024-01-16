import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VideoRecorderComponent } from './video-recorder.component';

describe('VideoRecorderComponent', () => {
  let component: VideoRecorderComponent;
  let fixture: ComponentFixture<VideoRecorderComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [VideoRecorderComponent],
        // Add any necessary imports and providers here
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoRecorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should start recording', () => {
    const successCallbackSpy = spyOn<any>(component, 'successCallback');
    component.startRecording();
    expect(successCallbackSpy).toHaveBeenCalled();
  });

  it('should stop recording and upload to S3', () => {
    const uploadToS3Spy = spyOn<any>(component, 'uploadToS3');
    component.stopRecording();
    expect(uploadToS3Spy).toHaveBeenCalled();
  });

  // Add more test cases as needed

  afterEach(() => {
    // Clean up resources after each test if necessary
  });
});
