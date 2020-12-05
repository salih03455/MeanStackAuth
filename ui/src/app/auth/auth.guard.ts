import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {

    const authData = this.authService.getAuthData();
    if (!authData) {
      this.authService.logout();
      return false;
    }

    // 'local storage'den auth bilgileri gelmis ise:
    const now = new Date();
    const expiresIn = authData.expirationDate.getTime() - now.getTime(); // kalan zaman (ms)

    // expire olmamis ise:
    if (expiresIn > 0) {
      return true;
    }

    // expire olmus ise:
    this.authService.getRefreshToken().subscribe(
      (response: any) => {
        console.log('RESPONSE: ', response);
        
        const accessToken = response.accessToken;
        const expiresInDuration = response.expiresIn;
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        this.authService.saveAuthData(accessToken, expirationDate)
      },
      (error: any) => {
        console.log('Refresh token error: ', error);
        this.authService.logout();
      }
    );
  }

}