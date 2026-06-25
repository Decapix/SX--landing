/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export async function ApiCore (url: string, options: RequestInit = {}) {
    try {
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const response = await fetch(`${BASE_URL}${url}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
            credentials: 'include',
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error;
        }

        return response.json();
    } catch (error) {
        throw error;
    }
}