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
        const user = users.find(
          (user) => user.correo === username && user.contraseña === password
        );
        return user;
      })
    );
  }

  setUserDetails(user: {
    correo: string;
    nombre: string;
    apellido: string;
    asignaturas: any[];
  }) {
    const fullName = `${user.nombre} ${user.apellido}`;
    localStorage.setItem('username', user.correo);
    localStorage.setItem('fullName', fullName);

    // Convertir cada asignatura en un objeto con propiedades definidas
    const formattedAsignaturas = user.asignaturas.map((asignatura) => ({
      asignatura: asignatura.asignatura || '',
      seccion: asignatura.seccion || '',
      sala: asignatura.sala || '',
      fecha: asignatura.fecha || '',
    }));
    localStorage.setItem('asignaturas', JSON.stringify(formattedAsignaturas));
  }

  getUserDetails() {
    const username = localStorage.getItem('username');
    const fullName = localStorage.getItem('fullName');
    const asignaturas = JSON.parse(
      localStorage.getItem('asignaturas') || '[]'
    ); // Recuperar y parsear las asignaturas
    return { username, fullName, asignaturas };
  }

  isAuthenticated(): boolean {
    return this.getUserDetails().username !== null;
  }

  logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('asignaturas'); // Limpiar también las asignaturas
  }
}
