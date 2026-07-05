import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

const initialState = {
  applications: [],
  loading: false,
  error: '',
};

export const fetchCandidateApplications = createAsyncThunk('applications/fetchCandidateApplications', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/applications/candidate');
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const fetchEmployerApplications = createAsyncThunk('applications/fetchEmployerApplications', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/applications/employer');
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const submitApplication = createAsyncThunk('applications/submitApplication', async ({ jobId, formData }, { rejectWithValue }) => {
  try {
    return await api.postForm(`/applications/apply/${jobId}`, formData);
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const updateApplicationStatus = createAsyncThunk('applications/updateApplicationStatus', async ({ applicationId, payload }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/applications/${applicationId}/status`, payload);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearApplicationError: (state) => {
      state.error = '';
    },
    clearApplications: (state) => {
      state.applications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidateApplications.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchCandidateApplications.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success) {
          state.applications = action.payload.applications;
        }
      })
      .addCase(fetchCandidateApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load applications';
      })
      .addCase(fetchEmployerApplications.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchEmployerApplications.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success) {
          state.applications = action.payload.applications;
        }
      })
      .addCase(fetchEmployerApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load employer applications';
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.applications.unshift(action.payload.application);
        }
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.applications = state.applications.map((application) =>
            application._id === action.payload.application._id ? action.payload.application : application
          );
        }
      });
  },
});

export const { clearApplicationError, clearApplications } = applicationsSlice.actions;
export default applicationsSlice.reducer;
