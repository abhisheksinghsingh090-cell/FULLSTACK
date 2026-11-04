import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts, selectAllPosts, addPost, removePost, updatePost } from './postsSlice';
import { selectActivePlatform, selectAllPlatforms } from '../platforms/platformsSlice';
export const PostsList = () => {
  const dispatch = useDispatch();
  const posts = useSelector(selectAllPosts);
  const status = useSelector((state) => state.posts.status);
  const error = useSelector((state) => state.posts.error);
  const activePlatform = useSelector(selectActivePlatform);
  const platforms = useSelector(selectAllPlatforms);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platformId, setPlatformId] = useState('p1');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPosts());
    }
  }, [status, dispatch]);

  const handleEditPost = (post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setPlatformId(post.platformId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingId === null) {
      dispatch(addPost({
        id: Date.now(),
        title: title.trim(),
        content: content.trim(),
        platformId,
      }));
    } else {
      dispatch(updatePost({
        id: editingId,
        changes: { title: title.trim(), content: content.trim(), platformId },
      }));
      setEditingId(null);
    }

    setTitle('');
    setContent('');
    setPlatformId('p1');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setPlatformId('p1');
  };

  const filteredPosts = activePlatform === 'all'
    ? posts
    : posts.filter((p) => p.platformId === activePlatform);

  return (
    <div>
      <h3>{editingId === null ? 'Add New Post' : 'Edit Post'}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '360px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Post Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required
        />
        <textarea 
          placeholder="Content..." 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required
        />
        <select value={platformId} onChange={(e) => setPlatformId(e.target.value)}>
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button type="submit">{editingId === null ? 'Publish to Redux Store' : 'Save Changes'}</button>
        {editingId !== null && <button type="button" onClick={cancelEdit}>Cancel Edit</button>}
      </form>

      <hr />

      <h3>Feed (Centralized Normalized State)</h3>
      {status === 'loading' && <p>Fetching initial data async thunk...</p>}
      {status === 'failed' && <p role="alert">Unable to load posts: {error}</p>}
      {status === 'succeeded' && filteredPosts.length === 0 && <p>No posts found for this platform.</p>}
      {status === 'succeeded' && filteredPosts.map((post) => (
        <div key={post.id} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px', marginBottom: '10px' }}>
          <h4>{post.title}</h4>
          <p>{post.content}</p>
          <small style={{ color: '#666' }}>Platform ID: {post.platformId}</small>
          <br />
          <button 
            onClick={() => handleEditPost(post)}
            style={{ marginTop: '8px', marginRight: '8px' }}
          >
            Edit
          </button>
          <button 
            onClick={() => dispatch(removePost(post.id))} 
            style={{ marginTop: '8px', background: '#ff4d4d', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default PostsList;