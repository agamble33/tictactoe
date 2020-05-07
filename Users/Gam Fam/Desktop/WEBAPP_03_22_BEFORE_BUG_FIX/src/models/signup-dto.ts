export interface SignUpRequestDTO {
    email: string;
    firstName?: string;
    lastName: string;
    userName: string;
    contactNo: string;
    dob: string;
    gender: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    password: string;
    signupType: string;
    photo?: string;
}