import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs';
import { signup } from './signup'; 


@Injectable({
  providedIn: 'root'
})
export class SignupService {
  baseUrl = 'http://localhost/api';

  constructor(private http: HttpClient) { }

  getAll(){
    return this.http.get('http://localhost/api/list.php').pipe(
      map((res: any)=>{
        return res['data'];
      })
    )
  }

}
