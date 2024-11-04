import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://18.206.204.148:3000/usuarios'; // URL de la API

  constructor(private http: HttpClient) {}

  validateUser(username: string, password: string): Observable<any> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((users) => {
        const user = users.find((user) => user.correo === username && user.contraseña === password);
        return user;
      })
    );
  }

  setUserDetails(user: { correo: string; nombre: string; apellido: string; clases: string[] }) {
    const fullName = `${user.nombre} ${user.apellido}`;
    localStorage.setItem('username', user.correo);
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('classes', JSON.stringify(user.clases)); // Almacenar clases como JSON
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
