import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { corsResponse } from '@/lib/cors';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const emailFromQuery = url.searchParams.get('email');
		
		// Get authorization header for JWT validation
		const authHeader = request.headers.get('authorization');
		let authenticatedUserEmail = '';
		
		// Validate JWT if present using server-side verification
		if (authHeader && authHeader.startsWith('Bearer ')) {
			const token = authHeader.substring(7);
			try {
				const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
				if (decoded && typeof decoded === 'object' && decoded.email) {
					authenticatedUserEmail = decoded.email as string;
				}
			} catch (tokenError) {
				console.warn('Invalid JWT token:', tokenError);
			}
		}

		// Prefer query param email; fallback to JWT email if present
		const userEmail = emailFromQuery || authenticatedUserEmail;
		if (!userEmail) {
			return corsResponse({ error: 'Email parameter is required' }, { status: 400 });
		}
		
		// Get all payment intents for the user from payment_intent table
		const { data, error } = await supabase
			.from('payment_intent')
			.select('*')
			.eq('email', userEmail)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching payment intents:', error);
			return corsResponse({ error: 'Failed to fetch payment data' }, { status: 500 });
		}

		return corsResponse({
			success: true,
			data: data || []
		});
	} catch (error: any) {
		console.error('User payment intents error:', error);
		return corsResponse(
			{ error: 'Internal server error', details: error.message },
			{ status: 500 }
		);
	}
}

