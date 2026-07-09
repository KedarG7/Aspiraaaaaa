import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api.js';

const initialState = {
  applications: [],
  candidateApplications: [],
  employerApplications: [],
  loading: false,
  error: '',
  candidatePagination: {
    page: 1,
    limit: 8,
    total: 0,
    pages: 1,
  },
  employerPagination: {
    page: 1,
    limit: 8,
    total: 0,
    pages: 1,
  },
};

export const fetchCandidateApplications = createAsyncThunk('applications/fetchCandidateApplications', async (params = {}, { rejectWithValue }) => {
  try {
    const queryParams = [];
    if (params.page) queryParams.push(`page=${params.page}`);
    if (params.limit) queryParams.push(`limit=${params.limit}`);
    const queryStr = queryParams.length ? `?${queryParams.join('&')}` : '';
    const response = await api.get(`/applications/candidate${queryStr}`);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const fetchEmployerApplications = createAsyncThunk('applications/fetchEmployerApplications', async (params = {}, { rejectWithValue }) => {
  try {
    const queryParams = [];
    if (params.page) queryParams.push(`page=${params.page}`);
    if (params.limit) queryParams.push(`limit=${params.limit}`);
    const queryStr = queryParams.length ? `?${queryParams.join('&')}` : '';
    const response = await api.get(`/applications/employer${queryStr}`);
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
      state.candidateApplications = [];
      state.employerApplications = [];
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
          state.candidateApplications = action.payload.applications || [];
          state.applications = action.payload.applications || [];
          state.candidatePagination = {
            page: action.payload.page || 1,
            limit: action.payload.limit || 8,
            total: action.payload.total || 0,
            pages: action.payload.pages || 1,
          };
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
          state.employerApplications = action.payload.applications || [];
          state.applications = action.payload.applications || [];
          state.employerPagination = {
            page: action.payload.page || 1,
            limit: action.payload.limit || 8,
            total: action.payload.total || 0,
            pages: action.payload.pages || 1,
          };
        }
      })
      .addCase(fetchEmployerApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load employer applications';
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.candidateApplications = [action.payload.application, ...state.candidateApplications];
          state.applications = state.candidateApplications;
        }
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        if (action.payload?.success) {
          const updatedApplication = action.payload.application;

          state.candidateApplications = state.candidateApplications.map((application) =>
            application._id === updatedApplication._id ? updatedApplication : application
          );
          state.employerApplications = state.employerApplications.map((application) =>
            application._id === updatedApplication._id ? updatedApplication : application
          );
          state.applications = state.applications.map((application) =>
            application._id === updatedApplication._id ? updatedApplication : application
          );
        }
      });
  },
});

export const { clearApplicationError, clearApplications } = applicationsSlice.actions;
export default applicationsSlice.reducer;
