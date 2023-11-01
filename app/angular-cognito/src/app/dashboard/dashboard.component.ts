import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';

import { Router } from '@angular/router';

import { IUser, CognitoService} from '../cognito.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading: boolean;
  user: IUser;
  isAuthenticated: boolean;

  constructor(private router: Router, private cognitoService: CognitoService) {
    this.loading = false;
    this.user = {} as IUser;
    this.isAuthenticated = true;
  }

  public ngOnInit(): void {
    this.cognitoService.getUser()
    .then((user: any) => {
      this.user = user.attributes;
    });
  }

  public update(): void {
    this.loading = true;

    this.cognitoService.updateUser(this.user)
    .then(() => {
      this.loading = false;
    }).catch(() => {
      this.loading = false;
    });
  }

}
