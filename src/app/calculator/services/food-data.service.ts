import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  foodFromApi,
  foodToApi,
  trackingDayFromApi,
} from './api-mapper';

// everything the shared food list and the tracked days are read and written
// through. the screens keep speaking in their own field names, the translation
// to the node server shape happens here
@Injectable({
  providedIn: 'root',
})
export class FoodDataService {
  constructor(private HttpClient: HttpClient) {}
  url = `${environment.baseUrl}${environment.apiPrefix}`;

  // ------------------------------ food ------------------------------
  // foods and recipes share one collection, the recipes carry isRecipe, which
  // is what the screens filter on
  getFoodData(): Observable<any[]> {
    return this.HttpClient.get(`${this.url}/data`).pipe(
      map((res: any) => (res?.data || []).map((elm: any) => foodFromApi(elm)))
    );
  }

  addNewFood(formData: any) {
    return this.HttpClient.post(`${this.url}/data`, foodToApi(formData));
  }

  updateFood(id: string, food: any) {
    return this.HttpClient.patch(`${this.url}/data/${id}`, foodToApi(food));
  }

  deleteFood(id: string) {
    return this.HttpClient.delete(`${this.url}/data/${id}`);
  }

  // ------------------------------ recipes ------------------------------
  getRecipes(): Observable<any[]> {
    return this.HttpClient.get(`${this.url}/recipes`).pipe(
      map((res: any) => (res?.data || []).map((elm: any) => foodFromApi(elm)))
    );
  }

  addNewRecipe(recipe: any) {
    return this.HttpClient.post(`${this.url}/recipes`, foodToApi({ ...recipe, isRecipe: true }));
  }

  updateRecipe(id: string, recipe: any) {
    return this.HttpClient.patch(`${this.url}/recipes/${id}`, foodToApi({ ...recipe, isRecipe: true }));
  }

  deleteRecipe(id: string) {
    return this.HttpClient.delete(`${this.url}/recipes/${id}`);
  }

  // ------------------------------ tracking ------------------------------
  // the token says whose days these are, nothing about the user is sent
  getUserTrackingData(): Observable<any[]> {
    return this.HttpClient.get(`${this.url}/tracking`).pipe(
      map((res: any) => (res?.data || []).map((elm: any) => trackingDayFromApi(elm)))
    );
  }

  // a day is stored under the date it was saved for, which is its id
  deleteUserTrackingDay(id: string) {
    return this.HttpClient.delete(`${this.url}/tracking/${id}`);
  }
}
