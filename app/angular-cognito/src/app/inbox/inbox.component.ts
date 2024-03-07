import { Component, OnInit } from '@angular/core';
import { CognitoService } from '../cognito.service';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit {
  pendingRequests: any[] = [];

  constructor(private cognitoService: CognitoService) { }

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.cognitoService.fetchPendingShareRequests().subscribe({
      next: (requests) => {
        this.pendingRequests = requests;
      },
      error: (error) => console.error('Error fetching pending share requests:', error)
    });
  }

  respondToRequest(requestId: string, action: 'accept' | 'deny'): void {
    this.cognitoService.respondToShareRequest(requestId, action).subscribe({
      next: () => {
        console.log(`Request ${action} successfully.`);
        this.loadPendingRequests();
      },
      error: (error) => console.error(`Error responding to request:`, error)
    });
  }
}
