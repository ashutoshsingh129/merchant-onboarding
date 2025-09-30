import React from 'react';

/**
 * Service to automatically detect user's IP address
 */

export interface IPDetectionResult {
    ip: string;
    success: boolean;
    error?: string;
}

/**
 * Detects user's IP address using multiple fallback methods
 */
export const detectUserIP = async (): Promise<IPDetectionResult> => {
    // Method 1: Try using a public IP detection service
    try {
        const response = await fetch('https://api.ipify.org?format=json', {
            method: 'GET',
            timeout: 5000, // 5 second timeout
        } as any);

        if (response.ok) {
            const data = await response.json();
            if (data.ip) {
                return {
                    ip: data.ip,
                    success: true,
                };
            }
        }
    } catch (error) {
        console.warn('Primary IP detection failed:', error);
    }

    // Method 2: Try alternative IP detection service
    try {
        const response = await fetch('https://ipapi.co/json/', {
            method: 'GET',
            timeout: 5000,
        } as any);

        if (response.ok) {
            const data = await response.json();
            if (data.ip) {
                return {
                    ip: data.ip,
                    success: true,
                };
            }
        }
    } catch (error) {
        console.warn('Secondary IP detection failed:', error);
    }

    // Method 3: Try another service
    try {
        const response = await fetch('https://httpbin.org/ip', {
            method: 'GET',
            timeout: 5000,
        } as any);

        if (response.ok) {
            const data = await response.json();
            if (data.origin) {
                // origin might be comma-separated if there are multiple IPs
                const ip = data.origin.split(',')[0].trim();
                return {
                    ip: ip,
                    success: true,
                };
            }
        }
    } catch (error) {
        console.warn('Tertiary IP detection failed:', error);
    }

    // Method 4: Fallback to localhost for development
    return {
        ip: '127.0.0.1',
        success: false,
        error: 'Unable to detect public IP address. Using localhost fallback.',
    };
};

/**
 * Validates if an IP address is in correct format
 */
export const isValidIP = (ip: string): boolean => {
    const ipv4Regex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Hook to automatically detect and set IP address
 */
export const useIPDetection = () => {
    const [ip, setIp] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    const detectIP = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await detectUserIP();
            setIp(result.ip);

            if (!result.success) {
                setError(result.error || 'Failed to detect IP address');
            }
        } catch (err) {
            setError('Failed to detect IP address');
            setIp('127.0.0.1'); // Fallback
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        detectIP();
    }, [detectIP]);

    return {
        ip,
        isLoading,
        error,
        retry: detectIP,
    };
};
