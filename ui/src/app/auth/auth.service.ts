import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthModel } from './auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string;
  
  constructor(private http: HttpClient) {}
  
  getToken() {
    return this.token;
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
        console.log(response.token);
        this.token = response.token;
      }
    )
  }
}