import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthModel } from './auth.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string;
  private authStatusListener = new Subject<boolean>();
  
  constructor(private http: HttpClient) {}
  
  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(name: string, email: string, password: string) {
    const authData: AuthModel = { name, email, password };
    this.http.post('http://localhost:3000/api/user/signup', authData).subscribe(
      response => {
        console.log(response)
      }
    )
  }

  login(email: string, password: string) {
    const authData: AuthModel = { email, password };
    this.http.post('http://localhost:3000/api/user/login', authData).subscribe(
      (response: any) => {
        const token = response.token;
        this.token = token;
        if (token) {
          this.authStatusListener.next(true);
        }
      }
    )
  }

  logout() {
    this.token = null;
    this.authStatusListener.next(false);
  }
}