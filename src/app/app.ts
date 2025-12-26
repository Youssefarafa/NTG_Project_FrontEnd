import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {

}
