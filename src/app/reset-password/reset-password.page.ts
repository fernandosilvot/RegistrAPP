import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class ResetPasswordPage implements OnInit {
  email: string = '';

  constructor(private alertController: AlertController) {}

  ngOnInit() {}

  async onResetPassword() {
    if (this.email && this.email.trim() !== '' && this.isValidEmail(this.email)) {
      console.log('Correo para restablecer contraseña:', this.email);
      await this.showAlert('Correo Enviado', 'Se ha enviado un enlace para restablecer tu contraseña al correo proporcionado.');
    } else {
      console.log('Debe ingresar un correo válido para restablecer la contraseña');
      await this.showAlert('Error', 'Debe ingresar un correo válido que contenga "@" y ".com"');
    }
  }

  isValidEmail(email: string): boolean {
    // Verificar que el correo contenga "@" y ".com"
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
