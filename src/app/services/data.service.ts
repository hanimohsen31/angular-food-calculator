import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private _HttpClienttp: HttpClient) {}

  getData(): Observable<any> {
    const url = 'https://food-calculator-300-default-rtdb.firebaseio.com/data.json';
    return this._HttpClienttp.get(url);
  }

  addNewFood(formData: any) {
    let url = 'https://food-calculator-300-default-rtdb.firebaseio.com/data.json';
    return this._HttpClienttp.post(url, formData);
  }

  getNotes(): Observable<any> {
    const url = 'https://food-calculator-300-default-rtdb.firebaseio.com/notes.json';
    return this._HttpClienttp.get(url);
  }
}
