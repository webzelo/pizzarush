import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/constants"

export const runtime = "nodejs"

type ImgBbResponse = {
  success?: boolean
  data?: {
    url?: string
    display_url?: string
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return NextResponse.json(
      { error: "Sign in to upload images." },
      { status: 401 }
    )
  }

  if (session.user.role !== "vendor" || session.user.banned) {
    return NextResponse.json(
      { error: "Only active vendor accounts can upload images." },
      { status: 403 }
    )
  }

  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Image uploads are not configured. Add IMGBB_API_KEY to apps/web/.env.local.",
      },
      { status: 503 }
    )
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 })
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WebP or GIF image." },
      { status: 400 }
    )
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image must be 5 MB or smaller." },
      { status: 400 }
    )
  }

  const body = new FormData()
  body.append(
    "image",
    Buffer.from(await file.arrayBuffer()).toString("base64")
  )
  body.append("name", file.name.slice(0, 80))

  let payload: ImgBbResponse | null = null

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      { method: "POST", body }
    )
    payload = (await response.json()) as ImgBbResponse

    if (!response.ok || !payload.success) {
      return NextResponse.json(
        { error: "ImgBB rejected the upload. Check your API key." },
        { status: 502 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: "Could not reach ImgBB. Try again." },
      { status: 502 }
    )
  }

  const url = payload.data?.display_url ?? payload.data?.url
  if (!url) {
    return NextResponse.json(
      { error: "ImgBB did not return an image URL." },
      { status: 502 }
    )
  }

  return NextResponse.json({ url })
}
