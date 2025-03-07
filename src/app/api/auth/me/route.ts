import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: Request) {
  try {
    const authToken = request.headers.get("cookie")
      ?.split("; ")
      .find(row => row.startsWith("auth-token="))
      ?.split("=")[1];

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verify(authToken, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    return NextResponse.json({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }
} 