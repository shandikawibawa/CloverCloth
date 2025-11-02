import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance";

// Ambil data dari localStorage
const userFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const tokenFromStorage = localStorage.getItem("userToken") || null;
const refreshFromStorage = localStorage.getItem("refreshToken") || null;

// Guest ID
const initialGuestId =
  localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

const initialState = {
  user: userFromStorage,
  token: tokenFromStorage,
  refreshToken: refreshFromStorage,
  guestId: initialGuestId,
  loading: false,
  error: null,
};

// 🔹 Login User
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
        userData
      );

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      return {
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 🔹 Register User
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        userData
      );

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      return {
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 🔁 Refresh Token
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token found");

      const response = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/refresh`,
        { refreshToken }
      );

      localStorage.setItem("userToken", response.data.token);
      return response.data.token;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.guestId = `guest_${new Date().getTime()}`;

      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      localStorage.removeItem("refreshToken");
      localStorage.setItem("guestId", state.guestId);
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      })
      // REFRESH
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        localStorage.clear();
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
