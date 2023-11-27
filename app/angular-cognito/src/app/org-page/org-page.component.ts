import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { IUser, CognitoService} from '../cognito.service';

@Component({
  selector: 'app-org-page',
  templateUrl: './org-page.component.html',
  styleUrls: ['./org-page.component.scss']
})
export class OrgPageComponent implements OnInit {
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


  public joinOrg(orgCode: string): void{
    this.loading = true;
    this.cognitoService.updateUserAttribute(orgCode)    
    .then(() => {
      this.router.navigate(['/dashboard']);
    }).then(()=>{
      window.location.reload();
    }).catch(()=>{
      this.loading = false;
    })
  
  }

  public skip(): void{
    this.loading = true;
    this.router.navigate(['/dashboard']);
  }

}