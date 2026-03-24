import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { StarRating } from '../components/StarRating'

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500'

export function AddMoviePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState(null)
  const [rating, setRating] = useState(0)
  const [thoughts, setThoughts] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!TMDB_KEY || TMDB_KEY === 'your-tmdb-api-key') {
        setError('TMDB API key not configured.')
        return
      }
      setSearching(true)
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`
        )
        const data = await res.json()
        setResults(data.results?.slice(0, 6) || [])
      } catch (e) {
        setError('Failed to search TMDB.')
      } finally {
        setSearching(false)
      }
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  const handleSelect = async (movie) => {
    // Fetch details for genre info
    let genres = ''
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_KEY}`
      )
      const details = await res.json()
      genres = details.genres?.map((g) => g.name).join(', ') || ''
    } catch {}

    setSelected({
      tmdb_id: movie.id,
      title: movie.title,
      year: movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : null,
      poster_url: movie.poster_path ? `${TMDB_IMG}${movie.poster_path}` : null,
      genres,
      overview: movie.overview || '',
    })
    setResults([])
    setQuery('')
  }

  const handleSave = async () => {
    if (!selected) return
    if (rating === 0) {
      setError('Please set a star rating.')
      return
    }
    setSaving(true)
    setError('')

    const { error } = await supabase.from('movies').insert({
      user_id: user.id,
      ...selected,
      rating,
      thoughts: thoughts.trim() || null,
    })

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white transition-colors text-lg"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-white">Add Movie</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Search */}
        {!selected && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search for a movie</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                placeholder="Type a movie title…"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {searching && (
              <p className="text-gray-500 text-sm mt-3 text-center">Searching…</p>
            )}

            {results.length > 0 && (
              <div className="mt-2 space-y-2">
                {results.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleSelect(movie)}
                    className="w-full flex items-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl p-3 text-left transition-colors"
                  >
                    {movie.poster_path ? (
                      <img
                        src={`${TMDB_IMG}${movie.poster_path}`}
                        alt={movie.title}
                        className="w-12 h-18 rounded-lg object-cover flex-shrink-0"
                        style={{ height: '72px' }}
                      />
                    ) : (
                      <div className="w-12 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0" style={{ height: '72px' }}>
                        <span>🎬</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm leading-tight">{movie.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {movie.release_date ? movie.release_date.slice(0, 4) : 'Unknown year'}
                      </p>
                      {movie.overview && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{movie.overview}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected movie + log form */}
        {selected && (
          <div>
            {/* Movie preview */}
            <div className="flex items-start gap-4 mb-6">
              {selected.poster_url ? (
                <img
                  src={selected.poster_url}
                  alt={selected.title}
                  className="w-24 rounded-xl object-cover flex-shrink-0"
                  style={{ height: '144px' }}
                />
              ) : (
                <div className="w-24 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0" style={{ height: '144px' }}>
                  <span className="text-3xl">🎬</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-lg leading-tight">{selected.title}</h2>
                <p className="text-gray-400 text-sm mt-0.5">{selected.year}</p>
                {selected.genres && (
                  <p className="text-gray-500 text-xs mt-1">{selected.genres}</p>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="text-amber-500 text-xs mt-2 hover:text-amber-400 transition-colors"
                >
                  Change movie
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">Your rating</label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            {/* Thoughts */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thoughts <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <textarea
                value={thoughts}
                onChange={(e) => setThoughts(e.target.value)}
                placeholder="What did you think?"
                rows={4}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors"
            >
              {saving ? 'Saving…' : 'Save to Watchlist'}
            </button>
          </div>
        )}

        {error && !selected && (
          <p className="text-red-400 text-sm mt-3">{error}</p>
        )}
      </main>
    </div>
  )
}
