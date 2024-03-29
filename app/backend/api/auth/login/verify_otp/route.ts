import {verifyOtp} from "@/app/backend/api/auth/auth_functions/auth"
export async function POST(req : Request){
    return verifyOtp(req);
}