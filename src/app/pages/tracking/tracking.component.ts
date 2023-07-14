import { Component, OnInit } from '@angular/core';
import { DataService } from './../../services/data.service';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
})
export class TrackingComponent implements OnInit {
  constructor(private DataService: DataService) {}

  dataArray: any[] ;

  ngOnInit(): void {
    this.DataService.getTrackingData().subscribe((res) => {
      this.dataArray = Object.values(res);
    });
  }

}
