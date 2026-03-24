import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { StarRating } from '../components/StarRating'

export function MovieDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editRating, setEditRating] = useState(0)
  const [editThoughts, setEditThoughts] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMovie()
  }, [id])

  const fetchMovie = async () => {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      navigate('/')
      return
    }
    setMovie(data)
    setEditRating(data.rating || 0)
    setEditThoughts(data.thoughts || '')
    setLoading(false)
  }

  const handleSaveEdit = async () => {
    if (editRating === 0) {
      setError('Please set a star rating.')
      return
    }
    setSaving(true)
    setError('')

    const { error } = await supabase
      .from('movies')
      .update({ rating: editRating, thoughts: editThoughts.trim() || null })
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setMovie((prev) => ({ ...prev, rating: editRating, thoughts: editThoughts.trim() || null }))
      setEditing(false)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await supabase.from('movies').delete().eq('id', id)
    navigate('/')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white transition-colors text-lg"
        >
          ←
        </button>
        <div className="flex items-center gap-3">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {/* Poster */}
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full max-h-[60vw] object-cover object-top"
            style={{ maxHeight: '360px' }}
          />
        ) : (
          <div className="w-full bg-gray-900 flex items-center justify-center" style={{ height: '300px' }}>
            <span className="text-6xl">🎬</span>
          </div>
        )}

        {/* Details */}
        <div className="px-4 py-5">
          <h1 className="text-2xl font-bold text-white leading-tight">{movie.title}</h1>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {movie.year && <span className="text-gray-400 text-sm">{movie.year}</span>}
            {movie.genres && (
              <>
                <span className="text-gray-700">•</span>
                <span className="text-gray-400 text-sm">{movie.genres}</span>
              </>
            )}
          </div>

          {movie.overview && (
            <p className="text-gray-300 text-sm leading-relaxed mt-4">{movie.overview}</p>
          )}

          {/* Divider */}
          <div className="border-t border-gray-800 my-5" />

          {/* Your log */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Log</p>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                  <StarRating value={editRating} onChange={setEditRating} size="lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thoughts <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={editThoughts}
                    onChange={(e) => setEditThoughts(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    placeholder="What did you think?"
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setError('') }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {movie.rating && (
                  <div>
                    <StarRating value={movie.rating} readonly size="lg" />
                  </div>
                )}
                {movie.thoughts && (
                  <p className="text-gray-200 text-sm leading-relaxed italic">"{movie.thoughts}"</p>
                )}
                <p className="text-gray-500 text-xs">
                  Watched {formatDate(movie.watched_at || movie.created_at)}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-white font-bold text-lg mb-2">Delete this movie?</h2>
            <p className="text-gray-400 text-sm mb-6">
              This will permanently remove <strong className="text-white">{movie.title}</strong> from your watchlist.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
