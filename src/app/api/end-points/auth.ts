import api from "../axiosInstance";

// SEND OTP
export const sendOtp = (mobile:number) =>
  api.post("/api/auth/otp", {
    mobile,
  });

// VERIFY OTP
export const verifyOtp = (mobile, otp , role) =>
  api.post("/api/auth/login", {
    mobile,
    otp,
    role
  });
