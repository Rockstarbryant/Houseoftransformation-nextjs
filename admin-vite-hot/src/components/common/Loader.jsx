// src/components/common/Loader.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Loader = ({ size = 'md', fullScreen = false, text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes[size]} border-4 border-gray-200 border-t-blue-900 rounded-full animate-spin`}></div>
      {text && <p className="text-gray-600 font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center">
        {loader}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{loader}</div>;
};

Loader.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullScreen: PropTypes.bool,
  text: PropTypes.string
};

export default Loader;