import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

import { IUser, CognitoService} from '../cognito.service';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  loading: boolean;
  user: IUser;

  constructor(private router: Router, private cognitoService: CognitoService){
    this.loading = false;
    this.user = {} as IUser;
  }

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  isEmailValid(): boolean {
    return this.emailFormControl.valid;
  }


  public signUp(organization: string): void {
      this.loading = true;
      
    if(organization == null){
      this.user['custom:organization'] = 'default';
    }

    this.cognitoService.signUp(this.user)
    .then(()=>{
      window.location.reload();
    }).then(()=>{
      this.router.navigate(['/signIn']);
    })
    .catch((error) => {
      console.error('Sign Up Error:', error);
      this.loading = false;
  });

}
  
  
  public confirmSignUp(): void {
    this.loading = true;
    
    this.cognitoService.confirmSignUp(this.user)
      .then((confirmationResult) => {
        // Confirmation was successful
        console.log('Confirmation result:', confirmationResult);
        this.router.navigate(['/signIn']);
      })
      .catch((error) => {
        console.error('Confirm Sign Up Error:', error);
        this.loading = false;
  
      });
  }
  

  
  

}
