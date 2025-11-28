import api from "../axiosInstance";

// SEND OTP
export const sendOtp = (mobile:string) =>
  api.post("/api/auth/otp", {
    mobile,
  });

// VERIFY OTP
export const verifyOtp = (mobile:string, otp:string , role:string|null) =>
  api.post("/api/auth/login", {
    mobile,
    otp,
    role
  });
