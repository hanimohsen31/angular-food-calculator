import { Component, OnInit } from '@angular/core';
import { FoodDataService } from 'src/app/shared/services/food-data.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  // styles: ['li{font-size: 17px}.dot{height:6px ; width:6px}'],
})
export class NotesComponent implements OnInit {
  constructor(private FoodDataService: FoodDataService) {}

  ngOnInit(): void {}
  notes$ = this.FoodDataService.getGeneralNotes()
}
