import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

const platformsAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const initialState = platformsAdapter.getInitialState({
  activePlatformId: 'all',
}, [
  { id: 'p1', name: 'Web Portal', category: 'Web' },
  { id: 'p2', name: 'Mobile App', category: 'Mobile' },
  { id: 'p3', name: 'Cloud Service', category: 'Backend' },
]);

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    setActivePlatform: (state, action) => {
      state.activePlatformId = action.payload;
    },
  },
});

// Make sure ALL of these are explicitly exported!
export const { setActivePlatform } = platformsSlice.actions;
export const {
  selectAll: selectAllPlatforms,
  selectById: selectPlatformById,
} = platformsAdapter.getSelectors((state) => state.platforms);
export const selectActivePlatform = (state) => state.platforms.activePlatformId;

export default platformsSlice.reducer;