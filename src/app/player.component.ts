import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mvi-player',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  constructor(
    private ar: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    console.log('this.ar', this.ar);
  }

}
