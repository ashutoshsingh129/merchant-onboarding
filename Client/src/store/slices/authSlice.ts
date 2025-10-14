import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getEnvironmentConfig } from '../../utils';

const config = getEnvironmentConfig();

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem('authToken'),
    isLoading: false,
    error: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Login failed');
            }

            // Store token in localStorage
            localStorage.setItem('authToken', data.token);

            return {
                token: data.token,
                user: data.user,
            };
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
        }
    }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('authToken');

        if (token) {
            await fetch(`${config.API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        }

        // Clear token from localStorage
        localStorage.removeItem('authToken');

        return true;
    } catch (error) {
        // Even if logout fails on server, clear local token
        localStorage.removeItem('authToken');
        return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    }
});

// Async thunk for verifying token
export const verifyToken = createAsyncThunk('auth/verifyToken', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('authToken');

        if (!token) {
            return rejectWithValue('No token found');
        }

        const response = await fetch(`${config.API_BASE_URL}/api/auth/verify`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            localStorage.removeItem('authToken');
            return rejectWithValue(data.message || 'Token verification failed');
        }

        return {
            token,
            user: data.user,
        };
    } catch (error) {
        localStorage.removeItem('authToken');
        return rejectWithValue(
            error instanceof Error ? error.message : 'Token verification failed'
        );
    }
});

// Async thunk for clearing keys
export const clearKeys = createAsyncThunk('auth/clearKeys', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('authToken');

        if (!token) {
            return rejectWithValue('No authentication token found');
        }

        const response = await fetch(`${config.API_BASE_URL}/api/stripe/keys`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return rejectWithValue(data.message || 'Failed to clear keys');
        }

        return data;
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear keys');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: state => {
            state.error = null;
        },
        clearAuth: state => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem('authToken');
        },
    },
    extraReducers: builder => {
        builder
            // Login cases
            .addCase(loginUser.pending, state => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload as string;
            })
            // Logout cases
            .addCase(logoutUser.pending, state => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, state => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload as string;
            })
            // Verify token cases
            .addCase(verifyToken.pending, state => {
                state.isLoading = true;
            })
            .addCase(verifyToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(verifyToken.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload as string;
            })
            // Clear keys cases
            .addCase(clearKeys.pending, state => {
                state.isLoading = true;
            })
            .addCase(clearKeys.fulfilled, state => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(clearKeys.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
