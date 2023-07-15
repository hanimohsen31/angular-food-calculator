import { Component, OnInit } from '@angular/core';
import { DataService } from './../../services/data.service';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
})
export class TrackingComponent implements OnInit {
  constructor(private DataService: DataService) {}

  dataArray: any[];

  ngOnInit(): void {
    this.DataService.getTrackingData().subscribe((res) => {
      console.log(res);
      this.dataArray = Object.values(res).reverse()
    });
  }

  dateFormat(value: string) {
    let date = (val: any) => {
      return val.slice(0, 4) + '-' + val.slice(4, 6) + '-' + val.slice(6, 8);
    };
    if (!value) {
      value = '20200101';
    }
    let x = new Date(date(value));
    return x.toDateString();
  }
}
