import { inject, Service, signal } from '@angular/core';
import { TokenService } from './token.service';

@Service()
export class AuthState {
    private tokenService=inject(TokenService);

    public isLoggedIn=signal<boolean>(!!this.tokenService.getAcessToken());

    login():void{
        this.isLoggedIn.set(true)
    }

    logout():void{
        this.isLoggedIn.set(false);
        this.tokenService.clearTokens();
    }
}
