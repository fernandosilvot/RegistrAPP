import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, LoadingController, IonButton, IonInput, IonItem, IonLabel, IonContent, IonToolbar, IonHeader, IonTitle, IonNote } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonInput, IonItem, IonLabel, IonContent, IonToolbar, IonHeader, IonTitle, IonNote]
})
export class ResetPasswordPage implements OnInit {
  email: string = '';
  emailError: boolean = false;
  emailNotRegistered: boolean = false;

  constructor(
    private alertController: AlertController, 
    private loadingController: LoadingController, // Importa LoadingController
    private authService: AuthService
  ) {}

  ngOnInit() {}

  // Método que se activa en tiempo real al escribir en el campo de correo
  validateEmail() {
    this.emailError = !this.isValidEmail(this.email);
    this.emailNotRegistered = false; // Reseteamos el mensaje de error de correo no registrado
  }

  async onResetPassword() {
    if (!this.emailError && this.email.trim() !== '') {
      // Muestra el loading
      const loading = await this.loadingController.create({
        message: 'Verificando correo...',
      });
      await loading.present();

      this.authService.validateEmail(this.email).subscribe(
        async (isRegistered: boolean) => {
          await loading.dismiss(); // Oculta el loading después de la verificación
          if (isRegistered) {
            await this.showAlert('Correo Enviado', 'Se ha enviado un enlace para restablecer tu contraseña al correo proporcionado.');
            this.emailNotRegistered = false; // Oculta el mensaje si el correo existe
          } else {
            this.emailNotRegistered = true; // Muestra el mensaje si el correo no está registrado
          }
        },
        async (error: any) => {
          await loading.dismiss(); // Oculta el loading si hay un error
          console.error('Error al validar el correo', error);
          await this.showAlert('Error', 'Ocurrió un problema al validar el correo.');
        }
      );
    } else {
      this.emailError = true;
    }
  }

  isValidEmail(email: string): boolean {
    // Validación básica de formato de correo electrónico
    return email.includes('@') && email.endsWith('.com');
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
