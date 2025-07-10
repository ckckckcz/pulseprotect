import { NextResponse } from 'next/server';

// CORS headers for API responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
  'Access-Control-Allow-Credentials': 'true',
};

// Helper function to apply CORS headers to a response
export function applyCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Create a response with CORS headers
export function corsResponse(
  body: any,
  options?: { status?: number }
): NextResponse {
  const response = NextResponse.json(body, options);
  return applyCorsHeaders(response);
}
