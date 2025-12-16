import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * User profile data (UI-focused)
 * NOT auth, NOT security
 */
export interface UserProfile {
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  isAccountVerified: boolean;
}

/**
 * User slice state
 */
interface UserState {
  profile: UserProfile | null;
  loading: boolean;
}

/**
 * Initial state
 */
const initialState: UserState = {
  profile: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    /**
     * Set user profile after fetch
     */
    setUserProfile(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
      state.loading = false;
    },

    /**
     * Clear profile on logout
     */
    clearUserProfile(state) {
      state.profile = null;
      state.loading = false;
    },

    /**
     * Optional: update partial profile (edit profile)
     */
    updateUserProfile(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.profile) {
        state.profile = {
          ...state.profile,
          ...action.payload,
        };
      }
    },
  },
});

export const { setUserProfile, clearUserProfile, updateUserProfile } =
  userSlice.actions;

export default userSlice.reducer;
