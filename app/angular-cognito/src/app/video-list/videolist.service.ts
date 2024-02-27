import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs';
import { videolist } from './videolist'; 


@Injectable({
  providedIn: 'root'
})
export class VideoListService {
  baseUrl = 'http://localhost/api';

  constructor(private http: HttpClient) { }

  getAll(videolist: videolist){
    return this.http.get('http://localhost/api/listOrg.php').pipe(
      map((res: any)=>{
        return res['data'];
      })
    )
  }

//   store(signup: signup){
//     return this.http.post('http://localhost/api/store.php', {data: signup}).pipe(
//       map((res: any)=>{
//         return res['data'];
//       })
//     )
//   }

}
