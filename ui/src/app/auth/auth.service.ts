import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthModel } from './auth.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessToken: string;
  private authStatusListener = new BehaviorSubject<boolean>(false);
  private tokenTimer: any;
  public errorMessageOnSubmit = new Subject<string>();
  public isLoading = new BehaviorSubject<boolean>(false);
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  
  getToken() {
    return this.accessToken;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(name: string, email: string, password: string) {
    const authData: AuthModel = { name, email, password };
    this.http.post('http://localhost:3000/api/user/signup', authData).subscribe(
      response => {
        console.log('signup: ', response);
        this.router.navigate(['/']);
      }
    )
  }

  login(email: string, password: string) {
    const authData: AuthModel = { email, password };
    this.http.post<{ accessToken: string, expiresIn: number }>('http://localhost:3000/api/user/login', authData).subscribe(
      (response: any) => {
        this.accessToken = response.accessToken;
        if (this.accessToken) {
          this.isLoading.next(true);
          const expiresInDuration = response.expiresIn; // 60 (sn)
          this.setAuthTimer(expiresInDuration);
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(this.accessToken, expirationDate, response.email)
          this.router.navigate(['/']);
        }
      },
      (error: any) => {
        this.errorMessageOnSubmit.next(error.error.message);
      },
      () => { this.isLoading.next(false); }
    )
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime(); // kalan zaman (ms)
    if (expiresIn > 0) { // expire olmamis ise
      this.accessToken = authInformation.accessToken;
      this.setAuthTimer(expiresIn / 1000); // sn
      this.authStatusListener.next(true);
    }
  }

  getRefreshToken() {
    const requestOptions = {
      headers: new HttpHeaders({ email: localStorage.getItem('email') })
    };
    return this.http.get('http://localhost:3000/api/user/refresh-token', requestOptions);
  }

  logout() {
    this.accessToken = null;
    clearTimeout(this.tokenTimer);
    this.authStatusListener.next(false);
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer: ', duration);
    this.tokenTimer = setTimeout(() => {
      this.getRefreshToken().subscribe(
        (response: any) => {
          this.accessToken = response.accessToken;
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(this.accessToken, expirationDate)
        },
        (error: any) => console.log(error)
      );
    }, duration * 1000)
  }

  private saveAuthData(accessToken: string, expirationDate: Date, email?: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('expiration', expirationDate.toISOString());
    email && localStorage.setItem('email', email);
  }

  private clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expiration');
    localStorage.removeItem('email');
  }

  private getAuthData() {
    const accessToken = localStorage.getItem('accessToken');
    const expirationDate = localStorage.getItem('expiration');
    if (!accessToken || !expirationDate) {
      return;
    }
    return {
      accessToken,
      expirationDate: new Date(expirationDate)
    }
  }
}