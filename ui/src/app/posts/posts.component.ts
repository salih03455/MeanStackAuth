import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PostsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
