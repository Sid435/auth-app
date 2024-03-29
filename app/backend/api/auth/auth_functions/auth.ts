import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import {Prisma} from '@prisma/client'
import twilio from 'twilio'

type OTP = {
    id : string,
    otp : string,
    email : string
}

export async function auth(req : Request){
    const jsonData = await req.json();

    const email = jsonData.email;
    const otp = jsonData.pass;

    if(await checkUser(email)){
        const generateOtp = await generate_otp_and_send(email);
        return NextResponse.json({otp : `${generateOtp}`})
    }else {
        return NextResponse.json({message : "Unauthorized"}, {status : 403})
    }
}

export async function addUser(req : Request){
    const jsonData = await req.json();
    const userData = {
        name :  jsonData.name,
        email : jsonData.email
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

async function checkUser(email : string){
    const user = await prisma?.user.findMany({
        where : {email : email}
    })
    return user!!;
}

async function generateToken(email : string){
    const payload = {
        email : email
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {expiresIn : "60m"});

    return token;
}

async function generate_otp_and_send(email: string) {
    const randomNum = Math.floor(Math.random() * (999999 + 1)) + 0;
    const randOtp = randomNum.toString().padStart(6, "0"); // Six digit OTP
    const payload = {
        otp : randOtp,
        email:email
    }
    const message = `Your OTP verification code : ${randOtp}`;
    await sendEmail(message, email);
    const otpToken = jwt.sign(payload, process.env.OTP_SECRET_KEY!, {expiresIn : "5m"});
    await prisma?.user.update({
        where :{email : email},
        data : {otp : otpToken}
    })
    return randOtp;
}
async function sendEmail(message: string, phone_number: String) {
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;

    // try {
    //     const client = twilio(accountSid, authToken);
    //     const response = await client.
    // } catch (error) {
    //     console.error(error);
    // }
}

export async function verifyOtp(req : Request){
    const jsonData = await req.json();
    const email = jsonData.email;
    try{
        const otpFromData = await prisma?.user.findFirst({
             where : {email: email}
        })
        const decode  = jwt.verify(otpFromData?.otp!, process.env.OTP_SECRET_KEY!) as OTP;

        if(decode.otp === jsonData.otp){
            return generateToken(email);
        }else {
            return NextResponse.json({message : "Invlid"},{status : 403})
        }
    }catch(error){
        return NextResponse.json({message : error},{status : 500})
    }
}

