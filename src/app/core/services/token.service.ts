import { inject, Service } from '@angular/core';
import { StorageService } from './storage.service';

@Service()
export class TokenService {
    private storage=inject(StorageService);

    private accessTokenKey='accessToken';
    private refreshTokenKey='refreshToken'

    saveAccessToken(token:string){
        this.storage.set(this.accessTokenKey,token);
    }
    saveRefreshToken(token:string){
        this.storage.set(this.refreshTokenKey,token)
    }
    getAcessToken(){
        return this.storage.get(this.accessTokenKey);
    }
    getReshreshToken(){
        return this.storage.get(this.refreshTokenKey)
    }
   clearTokens(){
    this.storage.remove(this.accessTokenKey);
    this.storage.remove(this.refreshTokenKey);
   }
}
