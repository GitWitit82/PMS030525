import { hash } from "bcryptjs"
import { db } from "@/lib/db"

async function main() {
  try {
    const hashedPassword = await hash("password123", 10)

    const user = await db.user.upsert({
      where: {
        email: "test@example.com",
      },
      update: {},
      create: {
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    })

    console.log("Test user created:", user)
    process.exit(0)
  } catch (error) {
    console.error("Error creating test user:", error)
    process.exit(1)
  }
}

main() 