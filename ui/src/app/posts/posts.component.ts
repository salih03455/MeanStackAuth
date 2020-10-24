import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PostsComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // this.http.get('http://localhost:3000/api/posts').subscribe(
    //   response => console.log(response),
    //   error => console.log(error)
    // )
  }

}
