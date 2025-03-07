import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: {
        email: email,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPass } = user

    return NextResponse.json(
      { ...userWithoutPass },
      { status: 201 }
    )
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
} 