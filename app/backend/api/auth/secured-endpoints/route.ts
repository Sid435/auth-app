import { verifyJwt } from "../../middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try{
        await verifyJwt(req);

        return NextResponse.json({message : "You did it bro"}, {status: 200});
    }
    catch(error){
        return NextResponse.json({message : "Somethings missing"}, {status: 403});
    }
}
