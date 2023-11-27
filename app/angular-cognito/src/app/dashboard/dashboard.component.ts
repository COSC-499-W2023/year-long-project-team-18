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
  showJoinForm = false;

  public ngOnInit(): void {
    this.cognitoService.getUser()
    .then((user: any) => {
      this.user = user.attributes;
    });
    this.checkOrganization();
    
  }


  checkOrganization() {
    if (this.user['custom:organization'] == null || this.user['custom:organization'] == 'default') {
      this.showJoinForm = true;
    } else {
      this.showJoinForm = false;
    }
  }
  
  public joinOrg(orgCode: string): void{
    this.loading = true;
    this.cognitoService.updateUserAttribute(orgCode)
    .then(() =>{
      this.loading=false
    }).then(()=>{
      window.location.reload();
    }).catch(()=>{
      this.loading = false;
    })
  
  }

}
