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
    CarbCalGM: 3.7,
    carbsFactorPerDayMin: 0.45,
    carbsFactorPerDayMax: 0.65,
    proteinCalGM: 4,
    proteinFactorPerDayMin: 0.1,
    proteinFactorPerDayMax: 0.35,
    proteinFactorPerDayAvr: 0.225,
  };

  getData(): Observable<any> {
    const url = `${this.url}/data.json`;
    return this.HttpClient.get(
      url
      // {headers: {
      //   'X-Firebase-AppCheck': environment.recaptchaEnterpriseKey,
      //   'test-token': environment.recaptchaEnterpriseKey,
      // }},
    );
  }

  addNewFood(formData: any) {
    let url = `${this.url}/data.json`;
    return this.HttpClient.post(url, formData);
  }

  getNotes(): Observable<any> {
    const url = `${this.url}/notes.json`;
    return this.HttpClient.get(url);
  }
}
