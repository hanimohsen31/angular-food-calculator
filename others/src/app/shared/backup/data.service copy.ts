import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getTrackingData() {
    const user: any = localStorage.getItem('user');
    const uid = JSON.parse(user).uid;
    const url = `${this.url}/tracking/${uid}.json`;
    return this.HttpClient.get(url);
  }

  saveTrackingData(data: any) {
    let id = this.getCurruntDate();
    const user: any = localStorage.getItem('user');
    const uid = JSON.parse(user).uid;
    const url = `${this.url}/tracking/${uid}/${id}.json`;
    data = { ...data, id: id };
    return this.HttpClient.put(url, data);
  }


  saveDeitData(data: any) {
    // let id = this.getCurruntDate();
    const user: any = localStorage.getItem('user');
    const uid = JSON.parse(user).uid;
    const url = `${this.url}/deit/${uid}.json`;
    data = { ...data};
    return this.HttpClient.post(url, data);
  }

  getCurruntDate() {
    let date = new Date();
    let hour = date.toLocaleTimeString(); // "1:35:47 AM"
    let dayFormatted = date.toLocaleDateString().split('/')[1]; // "7/17/2023"
    let dateFormatted = date.toDateString(); // "Mon Jul 17 2023" "MonJul172023"
    if (hour.slice(-2) == 'AM') {
      let day = +dayFormatted - 1;
      let actualDate =
        dateFormatted.slice(0, 8) + day + dateFormatted.slice(11);
      return actualDate.replaceAll(' ', '');
    } else {
      let actualDay = dateFormatted.replaceAll(' ', '');
      return actualDay;
    }
  }
}
