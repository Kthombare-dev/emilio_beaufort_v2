import axios from 'axios';

const CAL_API_URL = process.env.CAL_API_URL || 'https://api.cal.com/v1';
const API_KEY = process.env.CAL_API_KEY;

export async function fetchMeetings(): Promise<any[]> {
  if (!API_KEY) {
    throw new Error('CAL_API_KEY is not set in environment variables');
  }
  if (!CAL_API_URL) {
    throw new Error('CAL_API_URL is not set in environment variables');
  }

  try {
    const response = await axios.get(`${CAL_API_URL}/bookings`, {
      params: { apiKey: API_KEY },
    });

    if (!response.data || !response.data.bookings) {
      throw new Error('Invalid response from Cal.com API');
    }

    return response.data.bookings;
  } catch (error: any) {
    console.error('Error fetching meetings:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or missing API key. Check your Cal.com key.');
    } else if (error.response?.status === 403) {
      throw new Error('Forbidden: API key lacks permissions for bookings.');
    } else {
      throw new Error(`Failed to fetch meetings. See console for details. ${error.message}`);
    }
  }
}
