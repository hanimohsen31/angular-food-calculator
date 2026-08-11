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

  // a recipe is stored inside the shared food list, so it shows in the food table
  addNewRecipe(recipe: any) {
    let url = `${this.url}/data.json`;
    return this.HttpClient.post(url, recipe);
  }

  updateRecipe(key: string, recipe: any) {
    let url = `${this.url}/data/${key}.json`;
    return this.HttpClient.put(url, recipe);
  }

  deleteRecipe(key: string) {
    let url = `${this.url}/data/${key}.json`;
    return this.HttpClient.delete(url);
  }

  getGeneralNotes(): Observable<any> {
    const url = `${this.url}/notes.json`;
    console.log(url);
    return this.HttpClient.get(url);
  }

  // '' when nobody is signed in, so a guest never builds a user url
  private getUserId(): string {
    const user = localStorage.getItem('user');
    if (!user) {
      return '';
    }
    try {
      return JSON.parse(user)?.uid || '';
    } catch (error) {
      return '';
    }
  }

  getUserTrackingData() {
    const url = `${this.url}/tracking/${this.getUserId()}.json`;
    return this.HttpClient.get(url);
  }

  // a day is stored under the date it was saved for, which is its id
  deleteUserTrackingDay(id: string) {
    const url = `${this.url}/tracking/${this.getUserId()}/${id}.json`;
    return this.HttpClient.delete(url);
  }

  getUserAddedFoodList() {
    const url = `${this.url}/users/${this.getUserId()}/addedFoodList.json`;
    return this.HttpClient.get(url);
  }
}
