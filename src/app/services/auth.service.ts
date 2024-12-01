import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/usuarios'; // URL de la API

  constructor(private http: HttpClient) {}

  validateEmail(email: string): Observable<boolean> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((users) => users.some((user) => user.correo === email))
    );
  }

  validateUser(username: string, password: string): Observable<any> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((users) => {
        const user = users.find((user) => user.correo === username && user.contraseña === password);
        return user;
      })
    );
  }

  setUserDetails(user: { correo: string; nombre: string; apellido: string; clases: any[] }) {
    const fullName = `${user.nombre} ${user.apellido}`;
    localStorage.setItem('username', user.correo);
    localStorage.setItem('fullName', fullName);

    // Convertir cada asignatura en un objeto con propiedades definidas
    const formattedClasses = user.clases.map((clase) => ({
      nombre: clase.nombre || '',
      seccion: clase.seccion || '',
      sala: clase.sala || '',
      horario: clase.horario || '',
    }));
    localStorage.setItem('classes', JSON.stringify(formattedClasses));
  }

  getUserDetails() {
    const username = localStorage.getItem('username');
    const fullName = localStorage.getItem('fullName');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]'); // Recuperar y parsear las clases
    return { username, fullName, classes };
  }

  isAuthenticated(): boolean {
    return this.getUserDetails().username !== null;
  }

  logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('classes'); // Limpiar también las clases
  }
}
