import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private HttpClient: HttpClient) {}
  url = environment.database.url;
  nutritions = {
    ActicityFactorMin: 0.8,
    ActicityFactorMax: 0.9,
    ActicityFactorAvr: 0.85,
    fatCalGM: 9,
    fatsFactorPerDayMin: 0.2,
    fatsFactorPerDayMax: 0.35,
    fatsFactorPerDayAvr: 0.3,
    CarbCalGM: 4,
    carbsFactorPerDayMin: 0.45,
    carbsFactorPerDayMax: 0.65,
    proteinCalGM: 4,
    proteinFactorPerDayMin: 0.1,
    proteinFactorPerDayMax: 0.35,
    proteinFactorPerDayAvr: 0.225,
  };

  carbFactor = this.nutritions.carbsFactorPerDayMin;
  fatFactor = this.nutritions.fatsFactorPerDayAvr;
  proteinFactor = this.nutritions.proteinFactorPerDayAvr;

  fatCalGM = this.nutritions.fatCalGM;
  CarbCalGM = this.nutritions.CarbCalGM;
  proteinCalGM = this.nutritions.proteinCalGM;

  getData(): Observable<any> {
    const url = `${this.url}/data.json`;
    return this.HttpClient.get(url);
  }

  addNewFood(formData: any) {
    let url = `${this.url}/data.json`;
    return this.HttpClient.post(url, formData);
  }

  getNotes(): Observable<any> {
    const url = `${this.url}/notes.json`;
    return this.HttpClient.get(url);
  }

  saveTrackingData(data: any) {
    let id = '';
    let date = new Date();
    let hour = date.getHours();
    let day = date.toISOString().slice(0, 10);
    if (hour < 20) {
      let actualDay = +day.slice(-2) - 1;
      let actualDate = day.replaceAll('-', '').slice(0, 6) + actualDay;
      id = actualDate;
    } else {
      id = date.toISOString().replaceAll('-', '').slice(0, 8);
    }
    const user: any = localStorage.getItem('user');
    const uid = JSON.parse(user).uid;
    const url = `${this.url}/tracking/${uid}/${id}.json`;
    data = { ...data, id: id };
    return this.HttpClient.put(url, data);
  }

  getTrackingData() {
    const user: any = localStorage.getItem('user');
    const uid = JSON.parse(user).uid;
    const url = `${this.url}/tracking/${uid}.json`;
    return this.HttpClient.get(url);
  }
}
