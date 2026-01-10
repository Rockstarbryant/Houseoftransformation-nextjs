import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, onRatingChange, size = 32, readonly = false }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoveredRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(0);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`transition-all duration-150 ${
              !readonly ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
          >
            <Star
              size={size}
              className={`transition-colors ${
                value <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      
      {displayRating > 0 && (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${
            displayRating <= 2 ? 'text-red-600' :
            displayRating === 3 ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {labels[displayRating - 1]}
          </span>
          <span className="text-sm text-gray-500">
            ({displayRating} {displayRating === 1 ? 'star' : 'stars'})
          </span>
        </div>
      )}
    </div>
  );
};

export default StarRating;