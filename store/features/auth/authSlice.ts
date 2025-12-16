import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Auth user = identity + permissions
 * NOT profile data
 */
export interface AuthUser {
  id: string;
  email: string;
  type: "NORMAL" | "PRO";
}

/**
 * Auth slice state
 */
interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
}

/**
 * Initial state
 */
const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set auth state after login / signup / session restore
     */
    setCredentials(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isLoggedIn = true;
    },

    /**
     * Clear auth state on logout or session invalidation
     */
    clearAuth(state) {
      state.user = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
