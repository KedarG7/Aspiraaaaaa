import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

const initialState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: '',
};

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (filters = {}, { rejectWithValue }) => {
  try {
    const params = [];
    if (filters.search) params.push(`search=${filters.search}`);
    if (filters.location) params.push(`location=${filters.location}`);
    if (filters.type) params.push(`type=${filters.type}`);

    const queryStr = params.length ? `?${params.join('&')}` : '';
    const response = await api.get(`/jobs${queryStr}`);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const fetchJobById = createAsyncThunk('jobs/fetchJobById', async (jobId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/jobs/${jobId}`);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const createJob = createAsyncThunk('jobs/createJob', async (payload, { rejectWithValue }) => {
  try {
    return await api.post('/jobs', payload);
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const fetchEmployerJobs = createAsyncThunk('jobs/fetchEmployerJobs', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/jobs/employer/me');
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const deleteJobById = createAsyncThunk('jobs/deleteJobById', async (jobId, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/jobs/${jobId}`);
    return { ...response, jobId };
  } catch (error) {
    return rejectWithValue(error);
  }
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearJobError: (state) => {
      state.error = '';
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success) {
          state.jobs = action.payload.jobs;
        }
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load jobs';
      })
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success && action.payload.job) {
          state.currentJob = action.payload.job;
          state.error = '';
        } else {
          state.currentJob = null;
          state.error = action.payload?.message || 'Failed to load job details';
        }
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.currentJob = null;
        state.error = action.payload?.message || 'Failed to load job details';
      })
      .addCase(createJob.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.jobs.unshift(action.payload.job);
        }
      })
      .addCase(fetchEmployerJobs.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchEmployerJobs.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success) {
          state.jobs = action.payload.jobs;
        }
      })
      .addCase(fetchEmployerJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load employer jobs';
      })
      .addCase(deleteJobById.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.jobs = state.jobs.filter((job) => job._id !== action.payload.jobId);
        }
      });
  },
});

export const { clearJobError, clearCurrentJob } = jobsSlice.actions;
export default jobsSlice.reducer;
