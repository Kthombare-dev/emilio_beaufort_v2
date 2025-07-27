import { NextResponse } from 'next/server';
import axios from 'axios';

const CAL_API_URL = process.env.CAL_API_URL || 'https://api.cal.com/v1';
const API_KEY = process.env.CAL_API_KEY;

export async function GET() {
  console.log('Server-side env vars:', { CAL_API_URL, API_KEY });  // Add this for debugging

  if (!API_KEY) {
    console.error('CAL_API_KEY is missing from environment variables');
    return NextResponse.json({ error: 'CAL_API_KEY is not set' }, { status: 500 });
  }
  if (!CAL_API_URL) {
    console.error('CAL_API_URL is missing from environment variables');
    return NextResponse.json({ error: 'CAL_API_URL is not set' }, { status: 500 });
  }

  try {
    const response = await axios.get(`${CAL_API_URL}/bookings`, {
      params: { apiKey: API_KEY },
    });

    if (!response.data || !response.data.bookings) {
      return NextResponse.json({ error: 'Invalid response from Cal.com API' }, { status: 500 });
    }

    return NextResponse.json(response.data.bookings);
  } catch (error: any) {
    console.error('Error fetching meetings:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or missing API key' }, { status: 401 });
    } else if (error.response?.status === 403) {
      return NextResponse.json({ error: 'Forbidden: API key lacks permissions' }, { status: 403 });
    } else {
      return NextResponse.json({ error: `Failed to fetch meetings: ${error.message}` }, { status: 500 });
    }
  }
}
