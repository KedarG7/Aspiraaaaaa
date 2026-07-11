import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

const getStoredUser = () => {
  try {
    const user = localStorage.getItem('aspira_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => localStorage.getItem('aspira_token');

const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: Boolean(getStoredToken() && getStoredUser()),
  loading: false,
  error: '',
};

export const registerUser = createAsyncThunk('auth/registerUser', async (values, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', values);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', payload);
    if (response.success) {
      localStorage.setItem('aspira_token', response.token);
      localStorage.setItem('aspira_user', JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const sendOtpCode = createAsyncThunk('auth/sendOtpCode', async ({ email, purpose = 'login' }, { rejectWithValue }) => {
  try {
    return await api.post('/auth/send-otp', { email, purpose });
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const verifyOtpCode = createAsyncThunk('auth/verifyOtpCode', async ({ email, code, purpose = 'login' }, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/verify-otp', { email, code, purpose });
    if (response.success && response.token) {
      localStorage.setItem('aspira_token', response.token);
      localStorage.setItem('aspira_user', JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (payload, { rejectWithValue }) => {
  try {
    return await api.post('/auth/forgot-password', payload);
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (payload, { rejectWithValue }) => {
  try {
    return await api.post('/auth/reset-password', payload);
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  localStorage.removeItem('aspira_token');
  localStorage.removeItem('aspira_user');
  return null;
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    if (response.success) {
      localStorage.setItem('aspira_user', JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.put('/auth/me', payload);
    if (response.success) {
      localStorage.setItem('aspira_user', JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      .addCase(sendOtpCode.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(sendOtpCode.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtpCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Unable to send OTP';
      })
      .addCase(verifyOtpCode.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(verifyOtpCode.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(verifyOtpCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'OTP verification failed';
      })
            .addCase(forgotPassword.pending, (state) => {
              state.loading = true;
              state.error = '';
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
              state.loading = false;
              // server returns a message — keep error empty to allow UI to show success
            })
            .addCase(forgotPassword.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload?.message || 'Unable to send password reset email';
            })
            .addCase(resetPassword.pending, (state) => {
              state.loading = true;
              state.error = '';
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
              state.loading = false;
              // password reset succeeded; do not auto-login
            })
            .addCase(resetPassword.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload?.message || 'Unable to reset password';
            })
            .addCase(logoutUser.fulfilled, (state) => {
              state.user = null;
              state.token = null;
              state.isAuthenticated = false;
              state.loading = false;
              state.error = '';
            });

    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success) {
          state.user = action.payload.user;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update failed';
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
