import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import usersSlice from './slices/usersSlice';
import merchantAccountsSlice from './slices/merchantAccountsSlice';

export const store = configureStore({
    reducer: {
        app: appSlice,
        auth: authSlice,
        users: usersSlice,
        merchantAccounts: merchantAccountsSlice,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
