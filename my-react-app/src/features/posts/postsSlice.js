import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";

const postsAdapter = createEntityAdapter();

const initialState = postsAdapter.getInitialState({
  loading: false,
  error: null,
});

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async () => {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts?_limit=5"
    );
    return await response.json();
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,

  reducers: {
    addPost: postsAdapter.addOne,
    deletePost: postsAdapter.removeOne,
    updatePost: postsAdapter.updateOne,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        postsAdapter.setAll(state, action.payload);
      })

      .addCase(fetchPosts.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to fetch posts";
      });
  },
});

export const {
  addPost,
  deletePost,
  updatePost,
} = postsSlice.actions;

export const postsSelectors =
  postsAdapter.getSelectors((state) => state.posts);

export default postsSlice.reducer;