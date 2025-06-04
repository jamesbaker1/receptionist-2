import { NextRequest, NextResponse } from "next/server"
import { getClioClient } from "@/lib/clio-session"

export async function GET(request: NextRequest) {
  try {
    const clioClient = await getClioClient()
    
    if (!clioClient) {
      return NextResponse.json(
        { error: "Not authenticated with Clio" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined

    const contacts = await clioClient.getContacts({ limit, offset })
    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching Clio contacts:", error)
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const clioClient = await getClioClient()
    
    if (!clioClient) {
      return NextResponse.json(
        { error: "Not authenticated with Clio" },
        { status: 401 }
      )
    }

    const contactData = await request.json()
    const contact = await clioClient.createContact(contactData)
    return NextResponse.json(contact)
  } catch (error) {
    console.error("Error creating Clio contact:", error)
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    )
  }
} 