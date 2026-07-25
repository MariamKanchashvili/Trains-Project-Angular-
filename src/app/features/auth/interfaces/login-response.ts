export interface LoginResponse{
  data: {
    accessToken: string,
    refreshToken: string
  },
  meta: {
    name: string,
    description: string,
    website: string,
    location:string,
    email: string
  }
}