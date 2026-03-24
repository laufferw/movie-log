import React, { useState } from 'react'

export function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0)

  const sizeClass = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl'

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value)
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange && onChange(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onTouchStart={() => !readonly && setHovered(star)}
            onTouchEnd={() => !readonly && setHovered(0)}
            className={`${sizeClass} transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'} ${
              filled ? 'text-amber-500' : 'text-gray-600'
            }`}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
