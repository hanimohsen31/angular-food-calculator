import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})

export class FoodDataService {
  constructor(private HttpClient: HttpClient) {}
  url = environment.database.url;

  getFoodData(): Observable<any> {
    const url = `${this.url}/data.json`;
    return this.HttpClient.get(url);
  }

  addNewFood(formData: any) {
    let url = `${this.url}/data.json`;
    return this.HttpClient.post(url, formData);
  }

  getGeneralNotes(): Observable<any> {
    const url = `${this.url}/notes.json`;
    console.log(url);
    return this.HttpClient.get(url);
  }

  getUserTrackingData() {
    const user: any = localStorage.getItem('user');
    const uid = JSON.parse(user).uid;
    const url = `${this.url}/tracking/${uid}.json`;
    return this.HttpClient.get(url);
  }

  getUserAddedFoodList() {
    const user: any = localStorage.getItem('user');
    const uid = JSON.parse(user).uid;
    const url = `${this.url}/users/${uid}/addedFoodList.json`;
    return this.HttpClient.get(url);
  }
}
