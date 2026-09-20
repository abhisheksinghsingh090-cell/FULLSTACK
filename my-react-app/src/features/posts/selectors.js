import { createSelector } from "@reduxjs/toolkit";
import { postsSelectors } from "./postsSlice";

export const selectAllPosts = postsSelectors.selectAll;

export const selectShortPosts = createSelector(
  [selectAllPosts],
  (posts) => posts.filter((post) => post.body.length < 100)
);