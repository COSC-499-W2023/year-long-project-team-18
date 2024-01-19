// video-list.component.ts
import { Component, OnInit } from '@angular/core';
import { VideoListingService } from '../video-listing.service';
import { VideoMetadata } from '../video-metadata.model';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss']
})
export class VideoListComponent implements OnInit {
  videos: VideoMetadata[] = [];

  constructor(private videoListingService: VideoListingService) { }

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.videoListingService.getVideos().subscribe(
      (videos: VideoMetadata[]) => {
        console.log('Videos:', videos);
        this.videos = videos;
      },
      error => {
        console.error('Error fetching videos:', error);
      }
    );
  }  

  getVideoUrl(videoKey: string): string {
    return `https://prvcy-storage-ba20e15b50619-staging.s3.amazonaws.com/${videoKey}`;
  }
}
