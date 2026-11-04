import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';

const postsAdapter = createEntityAdapter({
  selectId: (post) => post.id,
  sortComparer: (a, b) => b.id - a.id,
});

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 101, title: 'Understanding Redux Toolkit', platformId: 'p1', content: 'Centralized state makes complex React apps predictable.' },
        { id: 102, title: 'Normalized Data Structures', platformId: 'p2', content: 'Storing items by ID prevents duplication and speeds up lookups.' },
      ]);
    }, 800);
  });
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState({
    status: 'idle',
    error: null,
  }),
  reducers: {
    addPost: postsAdapter.addOne,
    removePost: postsAdapter.removeOne,
    updatePost: postsAdapter.updateOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        postsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { addPost, removePost, updatePost } = postsSlice.actions;

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
} = postsAdapter.getSelectors((state) => state.posts);

export default postsSlice.reducer;