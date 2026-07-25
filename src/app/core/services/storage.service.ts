import { Service } from '@angular/core';

@Service()
export class StorageService {
    set(key:string,value:any){
        sessionStorage.setItem(key,JSON.stringify(value));

    }
    get(key:string){
     const data = sessionStorage.getItem(key);


    if(!data){

      return null;

    }


    try{

      return JSON.parse(data);

    }
    catch{

      return null;

    }

        
        
    }
    remove(key:string){
        sessionStorage.removeItem(key);
    }
}
