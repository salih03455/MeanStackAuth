import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthModel } from './auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}
  createUser(name: string, email: string, password: string) {
    const authData: AuthModel = { name, email, password };
    this.http.post('http://localhost:3000/api/user/signup', authData).subscribe(
      response => {
        console.log(response)
      }
    )
  }
}