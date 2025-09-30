import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MerchantAccount, PaginatedResponse, PaginationParams, ApiResponse } from '../../types';
import { apiService } from '../../services/api';

// Async thunk for fetching merchant accounts with pagination
export const fetchMerchantAccounts = createAsyncThunk(
    'merchantAccounts/fetchMerchantAccounts',
    async (params: PaginationParams = {}, { rejectWithValue }) => {
        try {
            const response: ApiResponse<PaginatedResponse<MerchantAccount>> =
                await apiService.getMerchantAccounts(params);

            if (response.success) {
                return response.data;
            } else {
                return rejectWithValue(response.message);
            }
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch merchant accounts'
            );
        }
    }
);

// Async thunk for fetching a single merchant account
export const fetchMerchantAccountById = createAsyncThunk(
    'merchantAccounts/fetchMerchantAccountById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response: ApiResponse<MerchantAccount | null> =
                await apiService.getMerchantAccountById(id);

            if (response.success && response.data) {
                return response.data;
            } else {
                return rejectWithValue(response.message);
            }
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch merchant account'
            );
        }
    }
);

interface MerchantAccountsState {
    accounts: MerchantAccount[];
    selectedAccount: MerchantAccount | null;
    loading: boolean;
    error: string | null;
    lastFetch: string | null;
    pagination: {
        has_more: boolean;
        total_count?: number;
        current_page: number;
        limit: number;
        starting_after?: string;
        ending_before?: string;
    };
}

const initialState: MerchantAccountsState = {
    accounts: [],
    selectedAccount: null,
    loading: false,
    error: null,
    lastFetch: null,
    pagination: {
        has_more: false,
        total_count: 0,
        current_page: 1,
        limit: 10,
        starting_after: undefined,
        ending_before: undefined,
    },
};

const merchantAccountsSlice = createSlice({
    name: 'merchantAccounts',
    initialState,
    reducers: {
        clearError: state => {
            state.error = null;
        },
        clearSelectedAccount: state => {
            state.selectedAccount = null;
        },
        setSelectedAccount: (state, action: PayloadAction<MerchantAccount>) => {
            state.selectedAccount = action.payload;
        },
        setPaginationParams: (state, action: PayloadAction<Partial<PaginationParams>>) => {
            state.pagination = {
                ...state.pagination,
                ...action.payload,
            };
        },
        resetPagination: state => {
            state.pagination = {
                has_more: false,
                total_count: 0,
                current_page: 1,
                limit: 10,
                starting_after: undefined,
                ending_before: undefined,
            };
        },
    },
    extraReducers: builder => {
        builder
            // Fetch merchant accounts
            .addCase(fetchMerchantAccounts.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMerchantAccounts.fulfilled, (state, action) => {
                state.loading = false;
                state.accounts = action.payload.data;
                state.pagination = {
                    ...state.pagination,
                    has_more: action.payload.has_more,
                    total_count: action.payload.total_count,
                };
                state.lastFetch = new Date().toISOString();
                state.error = null;
            })
            .addCase(fetchMerchantAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch merchant account by ID
            .addCase(fetchMerchantAccountById.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMerchantAccountById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedAccount = action.payload;
                state.error = null;
            })
            .addCase(fetchMerchantAccountById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearError,
    clearSelectedAccount,
    setSelectedAccount,
    setPaginationParams,
    resetPagination,
} = merchantAccountsSlice.actions;

export default merchantAccountsSlice.reducer;
