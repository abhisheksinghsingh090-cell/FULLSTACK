import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addPost,
  deletePost,
  updatePost,
  fetchPosts,
} from "./features/posts/postsSlice";

import {
  selectAllPosts,
  selectShortPosts,
} from "./features/posts/selectors";

const PostList = React.memo(({ posts, onDelete, onUpdate }) => {
  return (
    <div>
      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            border: "1px solid gray",
            margin: "10px",
            padding: "10px",
          }}
        >
          <h3>{post.title}</h3>

          <p>{post.body}</p>

          <button onClick={() => onUpdate(post.id)}>
            Update
          </button>

          <button
            onClick={() => onDelete(post.id)}
            style={{ marginLeft: "10px" }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
});

function App() {
  const dispatch = useDispatch();

  const posts = useSelector(selectAllPosts);

  const shortPosts = useSelector(selectShortPosts);

  const loading = useSelector((state) => state.posts.loading);

  const error = useSelector((state) => state.posts.error);

  const [title, setTitle] = useState("");

  const [body, setBody] = useState("");

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleAdd = () => {
    if (!title || !body) return;

    dispatch(
      addPost({
        id: Date.now(),
        title,
        body,
      })
    );

    setTitle("");
    setBody("");
  };

  const handleDelete = useCallback(
    (id) => {
      dispatch(deletePost(id));
    },
    [dispatch]
  );

  const handleUpdate = useCallback(
    (id) => {
      dispatch(
        updatePost({
          id,
          changes: {
            title: "Updated Post",
          },
        })
      );
    },
    [dispatch]
  );

  return (
    <div style={{ width: "700px", margin: "30px auto" }}>
      <h1>Redux Content Manager</h1>

      <input
        type="text"
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br />
      <br />

      <textarea
        placeholder="Post Content"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleAdd}>
        Add Post
      </button>

      <hr />

      {loading && <h3>Loading...</h3>}

      {error && <h3>{error}</h3>}

      <h2>All Posts ({posts.length})</h2>

      <PostList
        posts={posts}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />

      <hr />

      <h2>Short Posts</h2>

      <p>Total Short Posts: {shortPosts.length}</p>
    </div>
  );
}

export default App;