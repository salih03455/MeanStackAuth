import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(private authService: AuthService) {

	}
	
	intercept(req: HttpRequest<any>, next: HttpHandler) {
		const authToken = this.authService.getToken();
		const authRequest = req.clone({ // requesti klonluyoruz
			headers: req.headers.set('auth-token', authToken) // yoksa headera ekleyecek, zaten varsa uzerine yazacak
		});
		return next.handle(req)
	}
}