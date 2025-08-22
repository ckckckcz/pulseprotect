import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Backend ngrok URL from Malang laptop
    const API_BASE_URL = "https://e07827f42a12.ngrok-free.app"; // Replace with your ngrok URL
    const API_KEY = process.env.API_KEY || "your-secret-api-key";

    const response = await fetch(`${API_BASE_URL}/v1/verify-photo`, {
      method: "POST",
      headers: {
        "X-Api-Key": API_KEY,
      },
      body: req.body, // Forward FormData
    });

    if (!response.ok) {
      throw new Error(`Backend error: HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: `Failed to process request: ${error.message}` });
  }
}