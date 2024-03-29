import jwt from 'jsonwebtoken';
type User = {
    id: number; 
    username: string;
    email: string;
    roles: string;
};


// app/middleware.ts

import { NextRequest, NextResponse } from "next/server";

export async function verifyJwt(req: NextRequest): Promise<User> {
    const token = extractTokenFromHeader(req);
    if (!token) {
        throw new Error("No token provided");
    }

    try {

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as User;
      return decoded;
    } catch (error) {
        throw new Error("Invalid token");
    }
}

function extractTokenFromHeader(req: NextRequest): string | null {
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }
    return null;
}
