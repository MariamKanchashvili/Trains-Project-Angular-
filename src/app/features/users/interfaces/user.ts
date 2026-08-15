export interface UserResponse{
   id: number,
  email: string,
  lastName: string,
  firstName: string,
  details: {
    phoneNumber: string,
    address: string,
    dob: string,
    pictureUrl:string,
  }
}

