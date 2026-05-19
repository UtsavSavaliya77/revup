import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

type TokenPayload = {
  id: string;
};

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as TokenPayload;

    const { postId, text } = await req.json();

    if (!postId || !text) {
      return NextResponse.json(
        { message: "Post ID and comment text are required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        postId,
        userId: decoded.id,
      },
    });

    return NextResponse.json(
      {
        message: "Comment added",
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}