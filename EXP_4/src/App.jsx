import React from 'react';
import { PlatformSelector } from './app/features/platforms/PlatformSelector';
import { PostsList } from './app/features/posts/PostsList';

export default function App() {
  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Centralized State Management System</h2>
      <PlatformSelector />
      <PostsList />
    </div>
  );
}