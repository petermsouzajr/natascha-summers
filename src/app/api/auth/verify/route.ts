import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Verification token is required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired verification token" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verificationToken: null },
  });

  return NextResponse.json({
    success: true,
    message: "Email verified! You can now log in.",
  });
}
