import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SignupComponent implements OnInit {
  isLoading = false;
  submitted = false;
  signupForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService  
  ) {}

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.min(4), Validators.maxLength(255)]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(4), Validators.maxLength(255)]]
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.signupForm.controls;
  }

  onSignup() {
    this.submitted = true;
    if (this.signupForm.status == 'VALID') {
      this.authService.createUser(
        this.f.name.value,
        this.f.email.value,
        this.f.password.value
      );
    }
  }
}
