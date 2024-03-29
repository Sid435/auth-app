import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import {Prisma} from '@prisma/client'

type OTP = {
    id : string,
    otp : string,
    phone_number : string
}

export async function auth(req : Request){
    const jsonData = await req.json();

    const phone_number = jsonData.email;
    const otp = jsonData.pass;

    if(await checkUser(phone_number)){
        const generateOtp = await generate_otp_and_send(phone_number);
        return NextResponse.json({token : `${generateOtp}`})
    }else {
        return NextResponse.json({message : "Unauthorized"}, {status : 403})
    }
}

export async function addUser(req : Request){
    const jsonData = await req.json();
    const userData = {
        name :  jsonData.name,
        email : jsonData.email,
        phone_number : jsonData.phone_number
    } as Prisma.UserCreateInput;
    try{ 
        await prisma?.user.create({
            data : userData
        })
        return NextResponse.json({status : 200});
    }catch(error){
        return NextResponse.json({message : error});
    }

}

async function checkUser(phone_number : string){
    const user = await prisma?.user.findMany({
        where : {phone_number : phone_number}
    })
    return user!!;
}

async function generateToken(phone_number : string){
    const payload = {
        phone_number : phone_number
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {expiresIn : "60m"});

    return token;
}

async function generate_otp_and_send(phone_number: string) {
    const randomNum = Math.floor(Math.random() * (999999 + 1)) + 0;
    const randOtp = randomNum.toString().padStart(6, "0"); // Six digit OTP
    const payload = {
        otp : randOtp,
        phone_number:phone_number
    }
    const message = `Your OTP verification code : ${randOtp}`;
    await sendSMS(message, phone_number);
    const otpToken = jwt.sign(payload, process.env.OTP_SECRET_KEY!, {expiresIn : "5m"});
    await prisma?.user.update({
        where :{phone_number : phone_number},
        data : {otp : otpToken}
    })
    return otpToken;
}
async function sendSMS(message: string, phone_number: String) {
    throw new Error("Function not implemented."); //send OTP Using Twilio
}

export async function verifyOtp(req : Request){
    const jsonData = await req.json();
    const phone_number = jsonData.phone_number;
    try{
        const otpFromData = await prisma?.user.findFirst({
             where : {phone_number: phone_number}
        })
        const decode  = jwt.verify(otpFromData?.otp!, process.env.OTP_SECRET_KEY!) as OTP;

        if(decode.otp === jsonData.otp){
            return generateToken(phone_number);
        }else {
            return NextResponse.json({message : "Invlid"},{status : 403})
        }
    }catch(error){
        return NextResponse.json({message : error},{status : 500})
    }
}