import axios from 'axios';

// Define the API base URL (adjust to your API's base URL)
const API_URL = 'https://localhost:5001/auth';

// Service function to send the OTP request
export const sendOtpRequest = async (email: string): Promise<void> => {
  try {
    await axios.post(`${API_URL}/request-otp`, { Email: email });
  } catch (error) {
    throw new Error('Error sending OTP request');
  }
};

// Service function to verify the OTP
export const verifyOtp = async (email: string, otp: string): Promise<string> => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, { Email: email, Otp: otp });

    // Get the token from the response
    const token = response.data.token;

    // Store the token in localStorage
    if (token) {
      localStorage.setItem('authToken', token);
    }

    // Return the token for further use (optional)
    return token;
  } catch (error) {
    throw new Error('Invalid OTP or error during verification');
  }
};

// Function to get the stored token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Function to remove the token (for logout functionality)
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  // Add any additional token validation here if necessary (e.g., check expiration)
  return !!token;
};
