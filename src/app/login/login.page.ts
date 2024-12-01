import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonButton,
  IonInput,
  LoadingController,
  IonNote,
} from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonLabel,
    IonItem,
    IonInput,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    RouterLink,
    IonNote,
  ],
})
export class LoginPage implements OnInit {
  username: string = '';
  password: string = '';
  loginError: boolean = false; // Variable para controlar el error de inicio de sesión

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  async onSubmit() {
    if (this.username && this.password) {
      const loading = await this.loadingController.create({
        message: 'Iniciando sesión...',
      });
      await loading.present();

      this.authService.validateUser(this.username, this.password).subscribe(
        async (user) => {
          await loading.dismiss(); // Cerrar el loading
          if (user) {
            this.authService.setUserDetails({
              correo: user.correo,
              nombre: user.nombre,
              apellido: user.apellido,
              clases: user.clases || [],
            });
            this.loginError = false; // Restablecer el error de inicio de sesión
            this.router.navigate(['/home']);
          } else {
            this.loginError = true; // Mostrar mensaje de error
          }
        },
        async (error) => {
          await loading.dismiss(); // Cerrar el loading
          this.loginError = true; // Mostrar mensaje de error si ocurre un problema
          console.error('Error al validar el usuario', error);
        }
      );
    } else {
      console.log('Complete todos los campos');
    }
  }

  resetPassword() {
    console.log('Redirigir a la página de restablecimiento de contraseña');
    this.router.navigate(['/reset-password']);
  }
}
