import { useState } from 'react';
import './star-rating.css';

/**
 * Star rating display / input.
 *
 * Props:
 *  - rating: number (0-5) — current value
 *  - count: number | undefined — show "(count)" beside the stars
 *  - size: 'sm' | 'md' | 'lg'
 *  - interactive: boolean — allow clicking to set a rating
 *  - onChange: (value) => void — called when interactive and a star is clicked
 */
const StarRating = ({
  rating = 0,
  count,
  size = 'md',
  interactive = false,
  onChange,
}) => {
  const [hover, setHover] = useState(0);
  const display = interactive && hover ? hover : rating;

  return (
    <span className={`stars stars--${size}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(display);
        return interactive ? (
          <button
            key={star}
            type="button"
            className={`stars__star ${filled ? 'is-filled' : ''}`}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ) : (
          <span
            key={star}
            className={`stars__star ${filled ? 'is-filled' : ''}`}
            aria-hidden="true"
          >
            ★
          </span>
        );
      })}
      {count !== undefined && (
        <span className="stars__count">({count})</span>
      )}
    </span>
  );
};

export default StarRating;
