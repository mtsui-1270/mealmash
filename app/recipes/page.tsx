'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';

type SavedRecipe = {
  id: string;
  spoonacular_id: number;
  title: string;
  image: string;
  ready_in_minutes: number;
  servings: number;
  summary: string;
  ingredients: string[];
  instructions: string[];
  created_at: string;
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/recipes');
    const data = await res.json();
    setRecipes(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    setRecipes(prev => prev.filter(r => r.id !== id));
    if (selectedRecipe?.id === id) setSelectedRecipe(null);
    setDeleting(null);
  };

  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div className="pixel-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>📖</span>
            <div>
              <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, color: 'var(--orange)' }}>
                RECIPE BOOK
              </h1>
              <p style={{ fontFamily: 'var(--font-vt)', fontSize: 16, color: 'var(--text-muted)' }}>
                {recipes.length} RECIPE{recipes.length !== 1 ? 'S' : ''} FAVORITED
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <input
          className="pixel-input"
          placeholder="SEARCH RECIPES..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 24 }}
        />

        {/* Content */}
        {loading ? (
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
            LOADING...
          </p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, border: '2px dashed var(--border-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📖</div>
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--text-muted)' }}>
              {search ? 'NO RECIPES FOUND' : 'NO SAVED RECIPES YET'}
            </p>
            {!search && (
              <p style={{ fontFamily: 'var(--font-vt)', fontSize: 18, color: 'var(--text-muted)', marginTop: 8 }}>
                Go to Cook This! and save recipes you like ❤️
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {filtered.map(recipe => (
              <div key={recipe.id} className="pixel-card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                {recipe.image && (
                  <div
                    style={{ position: 'relative', width: '100%', height: 130, cursor: 'pointer' }}
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <Image src={recipe.image} alt={recipe.title} fill style={{ objectFit: 'cover' }} unoptimized />
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'var(--red)', padding: '2px 6px',
                      border: '1px solid #000', boxShadow: '2px 2px 0 #000',
                    }}>
                      ❤️
                    </div>
                  </div>
                )}
                <div style={{ padding: 14 }}>
                  <h3
                    style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.8, cursor: 'pointer' }}
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    {recipe.title}
                  </h3>
                  {recipe.ready_in_minutes && (
                    <p style={{ fontFamily: 'var(--font-vt)', fontSize: 15, color: 'var(--text-muted)', marginBottom: 12 }}>
                      ⏱ {recipe.ready_in_minutes}min · 🍽 {recipe.servings} servings
                    </p>
                  )}
                  <button
                    className="pixel-btn pixel-btn-outline"
                    style={{ width: '100%', fontSize: 7, padding: '8px 0' }}
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    VIEW RECIPE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Recipe detail modal */}
      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--orange)',
              boxShadow: '8px 8px 0px #000',
              width: '100%',
              maxWidth: 600,
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: 28,
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, lineHeight: 1.8, flex: 1, paddingRight: 16 }}>
                {selectedRecipe.title}
              </h2>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => handleDelete(selectedRecipe.id)}
                  style={{ background: 'none', border: '2px solid var(--red)', color: 'var(--red)', cursor: 'pointer', padding: '4px 8px', fontSize: 14 }}
                  disabled={deleting === selectedRecipe.id}
                >
                  ❤️
                </button>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  style={{ background: 'none', border: '2px solid var(--border-muted)', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 10px', fontSize: 18 }}
                >
                  ✕
                </button>
              </div>
            </div>

            {selectedRecipe.image && (
              <div style={{ position: 'relative', width: '100%', height: 200, marginBottom: 16 }}>
                <Image src={selectedRecipe.image} alt={selectedRecipe.title} fill style={{ objectFit: 'cover' }} unoptimized />
              </div>
            )}

            {/* Meta tags */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              {selectedRecipe.ready_in_minutes && (
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, padding: '4px 8px', border: '1px solid var(--orange)', color: 'var(--orange)' }}>
                  COOK: {selectedRecipe.ready_in_minutes}MIN
                </span>
              )}
              {selectedRecipe.servings && (
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, padding: '4px 8px', border: '1px solid var(--blue)', color: 'var(--blue)' }}>
                  SERVES {selectedRecipe.servings}
                </span>
              )}
            </div>

            {selectedRecipe.summary && (
              <p style={{ fontFamily: 'var(--font-vt)', fontSize: 17, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                {selectedRecipe.summary.slice(0, 300)}...
              </p>
            )}

            {/* Ingredients */}
            {selectedRecipe.ingredients?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--orange)', marginBottom: 12 }}>
                  INGREDIENTS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <div key={i} style={{ fontFamily: 'var(--font-vt)', fontSize: 17, padding: '6px 10px', background: 'var(--bg-dark)', borderLeft: '3px solid var(--orange)' }}>
                      {ing}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {selectedRecipe.instructions?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--orange)', marginBottom: 12 }}>
                  INSTRUCTIONS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedRecipe.instructions.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{
                        fontFamily: 'var(--font-pixel)', fontSize: 8,
                        background: i % 2 === 0 ? 'var(--orange)' : 'var(--blue)',
                        color: '#fff', padding: '3px 7px', flexShrink: 0,
                        boxShadow: '2px 2px 0 #000',
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p style={{ fontFamily: 'var(--font-vt)', fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {step.replace(/^\d+\.\s*/, '')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="pixel-btn pixel-btn-red"
              onClick={() => handleDelete(selectedRecipe.id)}
              disabled={deleting === selectedRecipe.id}
              style={{ width: '100%', fontSize: 10, padding: 14 }}
            >
              {deleting === selectedRecipe.id ? 'DELETING...' : 'DELETE RECIPE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}