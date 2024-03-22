import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styles: ['li{font-size: 17px}.dot{height:6px ; width:6px}'],
})
export class NotesComponent implements OnInit {
  constructor(private _DataService: DataService) {}

  ngOnInit(): void {}
  notes$ = this._DataService.getNotes();
}
