import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {Amplify, Auth } from 'aws-amplify';
import { Router } from '@angular/router';

import { environment } from '../environments/environment';

export interface IUser {
  email: string;
  username: string;
  password: string;
  showPassword: boolean;
  code: string;
  given_name: string;
  family_name: string;
  birthdate: string;
  'custom:account_type': string;
  'custom:organization': string;
}



@Injectable({
  providedIn: 'root'
})
export class CognitoService {
  private authenticationSubject: BehaviorSubject<any>;
  

  constructor(private router: Router) {
    Amplify.configure({
      Auth: environment.cognito
    });

    this.authenticationSubject = new BehaviorSubject<boolean>(false);

   }

   public signIn(user: IUser): Promise<any> {
    return Auth.signIn(user.email, user.password)
    .then(() => {
      this.authenticationSubject.next(true);
    });
  }

  public signUp(user: IUser): Promise<any> {
    return Auth.signUp({
      username: user.username,
      password: user.password,
      attributes: {
        email: user.email,
        given_name: user.given_name,
        family_name: user.family_name,
        birthdate: user.birthdate,
        'custom:account_type': user['custom:account_type']
      }
    })
    .then((signUpResult) => {
      // Log the verification code here
      console.log('User confirmed:', signUpResult.userConfirmed);
  
      // Continue with other processing
    })
    .catch((error) => {
      console.error('Sign Up Error:', error);
      throw error; // Propagate the error
    });
  }
  
  

   public confirmSignUp(user: IUser): Promise<any>{
    return Auth.confirmSignUp(user.email, user.code);
   }

   public signOut(): Promise<any>{
    return Auth.signOut().then(()=>{
      this.authenticationSubject.next(false);
    }).then(() => {
      this.router.navigate(['/signIn']);
    }).then(()=>{
      window.location.reload();
    });
   }

   public isAuthenticated(): Promise<boolean> {
    return Auth.currentAuthenticatedUser()
      .then(() => {
        this.authenticationSubject.next(true);
        return true;
      })
      .catch(() => {
        this.authenticationSubject.next(false);
        return false;
      });
  }


   public getUser(): Promise<any>{
    return Auth.currentUserInfo();
   }

   public updateUser(user: IUser): Promise<any>{
    return Auth.currentUserPoolUser().then((cognitoUser: any)=>{
      return Auth.updateUserAttributes(cognitoUser, user);
    })
   }

}
