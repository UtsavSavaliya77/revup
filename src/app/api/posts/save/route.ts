import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { postId, userId } = await req.json();

    if (!postId || !userId) {
      return NextResponse.json(
        { error: "postId and userId are required" },
        { status: 400 }
      );
    }

    const existingSave = await prisma.save.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingSave) {
      await prisma.save.delete({
        where: {
          id: existingSave.id,
        },
      });

      return NextResponse.json({
        saved: false,
        message: "Post unsaved",
      });
    }

    await prisma.save.create({
      data: {
        userId,
        postId,
      },
    });

    return NextResponse.json({
      saved: true,
      message: "Post saved",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Save failed" },
      { status: 500 }
    );
  }
}