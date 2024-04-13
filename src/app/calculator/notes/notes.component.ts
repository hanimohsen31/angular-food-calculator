import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/shared/services/data.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styles: ['li{font-size: 17px}.dot{height:6px ; width:6px}'],
})
export class NotesComponent implements OnInit {
  constructor(private DataService: DataService) {}

  ngOnInit(): void {}
  notes$ = this.DataService.getNotes();
}
