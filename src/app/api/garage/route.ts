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

    const body = await req.json();

    const {
      brand,
      model,
      year,
      image,
      specs,
    } = body;

    if (!brand || !model || !year) {
      return NextResponse.json(
        { message: "Brand, model and year are required" },
        { status: 400 }
      );
    }

    const car = await prisma.car.create({
      data: {
        brand,
        model,
        year: Number(year),
        image,
        specs,
        userId: decoded.id,
      },
    });

    return NextResponse.json(
      {
        message: "Car added successfully",
        car,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
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

    const cars = await prisma.car.findMany({
      where: {
        userId: decoded.id,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      cars,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}