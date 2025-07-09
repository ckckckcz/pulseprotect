import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json()

    const result = streamText({
      model: openai(model || "gpt-4o"),
      messages,
      system: "You are Fluid AI, a helpful assistant that can help users create various content and answer questions.",
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
