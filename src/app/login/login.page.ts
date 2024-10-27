import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonInput } from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonButton, IonLabel, IonItem, IonInput, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink],
})
export class LoginPage implements OnInit {
  username: string = '';
  password: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {}

  onSubmit() {
    if (this.username && this.password) {
      this.authService.validateUser(this.username, this.password).subscribe(
        (user) => {
          if (user) {
            console.log('Usuario:', user);
            const { contraseña, ...userWithoutPassword } = user; 
            this.authService.setUsername(userWithoutPassword.correo); // Guarda el nombre de usuario
            this.router.navigate(['/home'], { state: { 
              username: userWithoutPassword.correo, 
              fullName: `${user.nombre} ${user.apellido}`, 
              classes: user.asignaturas || [] 
            }}); 
          } else {
            console.log('Credenciales incorrectas');
          }
        },
        (error) => {
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
