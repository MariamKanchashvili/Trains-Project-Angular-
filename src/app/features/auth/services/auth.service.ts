import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { API_URL } from '../../../core/config/api.config';
import { from, of, tap } from 'rxjs';
import { TokenService } from '../../../core/services/token.service';
import { StorageService } from '../../../core/services/storage.service';
@Service()
export class AuthService {
    private http=inject(HttpClient);
    private tokenService=inject(TokenService);
    private storage=inject(StorageService);


signup(info:any){
    return this.http.post(`${API_URL}/auth/register`,
        info).pipe(
            tap((response:any)=>{
                this.tokenService.saveAccessToken(response.data.accessToken);
                this.tokenService.saveRefreshToken(response.data.refreshToken);
            })
        )
}
signin(info:any){
    return this.http.post(`${API_URL}/auth/login`,
        info).pipe(
            tap((response:any)=>{
                this.tokenService.saveAccessToken(response.data.accessToken);
                this.tokenService.saveRefreshToken(response.data.refreshToken);
            })
        )
}
resendVerify(email:string){

    return this.http.post(`${API_URL}/resend-email-verification/${email}`,{})
}
forgotPass(email:string){
    return this.http.post(`${API_URL}/auth/forget-password/${email}`, {})
}
verifyEmail( code:string){
    return this.http.put(`${API_URL}/auth/verify-email`, code)
}
resetPassword(info:any){
    return this.http.put(`${API_URL}/auth/reset-password`, info)
}


 getUser(){

    const user = this.storage.get('user');

    return of(user);

  }
}