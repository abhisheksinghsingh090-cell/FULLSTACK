import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllPlatforms, selectActivePlatform, setActivePlatform } from './platformsSlice';

export const PlatformSelector = () => {
  const dispatch = useDispatch();
  const platforms = useSelector(selectAllPlatforms);
  const activePlatform = useSelector(selectActivePlatform);

  return (
    <div style={{ marginBottom: '20px', padding: '12px', background: '#f4f4f5', borderRadius: '6px' }}>
      <strong>Filter Platform State: </strong>
      <button 
        style={{ margin: '0 4px', fontWeight: activePlatform === 'all' ? 'bold' : 'normal' }}
        onClick={() => dispatch(setActivePlatform('all'))}
      >
        All
      </button>
      {platforms.map((platform) => (
        <button
          key={platform.id}
          style={{ margin: '0 4px', fontWeight: activePlatform === platform.id ? 'bold' : 'normal' }}
          onClick={() => dispatch(setActivePlatform(platform.id))}
        >
          {platform.name}
        </button>
      ))}
    </div>
  );
};

export default PlatformSelector;