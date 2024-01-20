import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DeitService {
  constructor(private HttpClient: HttpClient) {}
  url = environment.database.url;
  userStringToken: any = localStorage.getItem('user');
  userParsed = JSON.parse(this.userStringToken)

  saveDeit(element: any) {
    let signature = this.userParsed.uid || 'undefined'
    return this.HttpClient.put(`${this.url}/deit/${signature}.json`, element);
  }

  getDeitList(){
    let signature = this.userParsed.uid || 'undefined'
    return this.HttpClient.get(`${this.url}/deit/${signature}.json`);
  }
}
