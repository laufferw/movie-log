import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { StarRating } from '../components/StarRating'

export function HomePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setMovies(data || [])
    setLoading(false)
  }

  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            🎬 <span>Watchlist</span>
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/add')}
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-4 py-1.5 rounded-full transition-colors"
            >
              + Add
            </button>
            <button
              onClick={signOut}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your log…"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
          />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500 text-sm">Loading…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-gray-400 text-sm">
              {search ? 'No movies match your search.' : 'No movies logged yet. Add your first one!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={() => navigate(`/movie/${movie.id}`)} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function MovieCard({ movie, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-900 rounded-xl overflow-hidden text-left transition-transform active:scale-95 hover:ring-1 hover:ring-amber-500/50"
    >
      {movie.poster_url ? (
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full aspect-[2/3] object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
          <span className="text-4xl">🎬</span>
        </div>
      )}
      <div className="p-2">
        <p className="text-white text-sm font-medium leading-tight line-clamp-2">{movie.title}</p>
        <p className="text-gray-400 text-xs mt-0.5">{movie.year}</p>
        {movie.rating && (
          <div className="mt-1">
            <StarRating value={movie.rating} readonly size="sm" />
          </div>
        )}
      </div>
    </button>
  )
}
