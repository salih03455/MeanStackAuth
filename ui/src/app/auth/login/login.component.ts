import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  submitted = false;
  loginForm: FormGroup;
  errorMessage$: any;
  isLoading$: any;

  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(4)]]
    });

    this.errorMessage$ = this.authService.errorMessageOnSubmit;
    this.isLoading$ = this.authService.isLoading;
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onLogin() {
    console.log('Login...', this.loginForm);
    this.submitted = true;
    if (this.loginForm.status === 'INVALID') {
      return;
    }
    
    this.authService.login(this.f.email.value, this.f.password.value);
  }
}
