import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton } from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonButton, IonLabel, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink]
})
export class LoginPage implements OnInit {
  username: string = 'fer';
  password: string = 'fer';

  constructor(private router: Router) {}

  ngOnInit() {}

  onSubmit() {
    if (this.username && this.password) {
      console.log('Usuario:', this.username);
      console.log('Contraseña:', this.password);
      this.router.navigate(['/home'], { state: { username: this.username } });
    } else {
      console.log('Complete todos los campos');
    }
  }

  resetPassword() {
    console.log('Redirigir a la página de restablecimiento de contraseña');
    this.router.navigate(['/reset-password']);
  }
}
