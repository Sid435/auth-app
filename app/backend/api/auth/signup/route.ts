import {addUser} from "@/app/backend/api/auth/auth_functions/auth"
export async function POST(req : Request){
    return addUser(req);
}