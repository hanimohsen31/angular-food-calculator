import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TOKEN_KEY } from './session';

// every call to the node server is signed with the session token. the token is
// read straight off the browser rather than through the login service, an
// interceptor that injects a service which itself needs HttpClient would close
// a circle around the client it is installed on
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = localStorage.getItem(TOKEN_KEY);
    // anything that is not our own server is left alone
    if (!token || !req.url.startsWith(environment.baseUrl)) {
      return next.handle(req);
    }
    return next.handle(
      req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    );
  }
}
