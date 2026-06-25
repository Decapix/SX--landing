import { NextResponse } from "next/server"

import { buildLandingBackendUrl, buildLandingBackendStaticHeaders } from "@/lib/landing-backend"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      userType,
      firstName,
      lastName,
      email,
      phone,
      country,
      socialMedia,
      role,
      language,
      text,
      entityName,
      website,
    } = body

    const validUserTypes = new Set(["stylist", "brand", "PressOffice"])

    // Validation
    if (!userType || !firstName || !lastName || !email || !phone || !country || !role) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!validUserTypes.has(userType)) {
      return NextResponse.json(
        { success: false, message: "Invalid user type" },
        { status: 400 }
      )
    }

    if ((userType === "brand" || userType === "PressOffice") && !String(entityName || "").trim()) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      )
    }

    const payload = {
      userType,
      firstName,
      lastName,
      email,
      phone,
      country,
      socialMedia: socialMedia || "",
      role,
      language: language || "en",
      text: text || "",
      entityName: entityName || "",
      website: website || "",
    }

    const backendResponse = await fetch(
      buildLandingBackendUrl("api/landing-page/book-demo"),
      {
        method: "POST",
        headers: {
          ...buildLandingBackendStaticHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    )

    if (!backendResponse.ok) {
      console.error("Backend API error:", backendResponse.status, await backendResponse.text())
      return NextResponse.json(
        { success: false, message: "Failed to submit demo request" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: "Demo request submitted successfully" })
  } catch (error) {
    console.error("Book demo API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
