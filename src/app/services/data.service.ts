import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private _HttpClienttp: HttpClient) {}
  url = environment.database.url;

  getData(): Observable<any> {
    const url = `${this.url}/data.json`;
    return this._HttpClienttp.get(url);
  }

  addNewFood(formData: any) {
    let url = `${this.url}/data.json`
    return this._HttpClienttp.post(url, formData);
  }

  getNotes(): Observable<any> {
    const url = `${this.url}/notes.json`
    return this._HttpClienttp.get(url);
  }
}
