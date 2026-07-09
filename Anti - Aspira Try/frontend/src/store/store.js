import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import jobsReducer from '../features/jobs/jobsSlice';
import applicationsReducer from '../features/applications/applicationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    applications: applicationsReducer,
  },
});

export default store;
