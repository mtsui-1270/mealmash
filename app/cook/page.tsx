'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';

type PantryItem = {
  id: string;
  name: string;
  quantity: string;
  category: string;
};

type Recipe = {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  extendedIngredients: { id: number; original: string }[];
  analyzedInstructions: { steps: { number: number; step: string }[] }[];
};

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

export default function CookPage() {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [pantryLoading, setPantryLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch('/api/pantry')
      .then(r => r.json())
      .then(data => {
        setPantry(Array.isArray(data) ? data : []);
        setPantryLoading(false);
      });

    fetch('/api/recipes')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSavedIds(new Set(data.map((r: { spoonacular_id: number }) => r.spoonacular_id)));
        }
      });
  }, []);

  const toggleIngredient = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleCook = async () => {
    if (selected.size === 0) { setError('Select at least one ingredient!'); return; }
    setError('');
    setLoading(true);
    setRecipes([]);

    const res = await fetch('/api/spoonacular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients: Array.from(selected) }),
    });

    const data = await res.json();
    if (!res.ok) setError(data.error || 'Something went wrong');
    else setRecipes(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleSave = async (recipe: Recipe) => {
    setSaving(recipe.id);
    const steps = recipe.analyzedInstructions?.[0]?.steps?.map(
      s => `${s.number}. ${s.step}`
    ) || [];

    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spoonacular_id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        ready_in_minutes: recipe.readyInMinutes,
        servings: recipe.servings,
        summary: stripHtml(recipe.summary || '').slice(0, 500),
        ingredients: recipe.extendedIngredients?.map(i => i.original) || [],
        instructions: steps,
      }),
    });

    setSaving(null);
    if (res.ok) setSavedIds(prev => new Set(Array.from(prev).concat(recipe.id)));
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div className="pixel-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>🧑‍🍳</span>
            <div>
              <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, color: 'var(--orange)' }}>
                COOK THIS!
              </h1>
              <p style={{ fontFamily: 'var(--font-vt)', fontSize: 16, color: 'var(--text-muted)' }}>
                SELECT INGREDIENTS → GENERATE RECIPES
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

          {/* Left panel: ingredient selector */}
          <div className="pixel-border-dark" style={{ background: 'var(--bg-card)', padding: 16, boxShadow: '4px 4px 0 #000' }}>
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--text-muted)', marginBottom: 14 }}>
              YOUR PANTRY ({selected.size} selected)
            </p>

            {pantryLoading ? (
              <p style={{ fontFamily: 'var(--font-vt)', fontSize: 16, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                LOADING...
              </p>
            ) : pantry.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-vt)', fontSize: 16, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                Add items to your pantry first!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                {pantry.map(item => {
                  const isSelected = selected.has(item.name);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleIngredient(item.name)}
                      style={{
                        padding: '10px 12px',
                        border: `2px solid ${isSelected ? 'var(--orange)' : 'var(--border-muted)'}`,
                        background: isSelected ? 'rgba(240,138,75,0.15)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'all 0.1s',
                        boxShadow: isSelected ? '2px 2px 0 #000' : 'none',
                      }}
                    >
                      <span style={{
                        width: 14, height: 14,
                        border: '2px solid var(--orange)',
                        background: isSelected ? 'var(--orange)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: 10,
                      }}>
                        {isSelected ? '✓' : ''}
                      </span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--text-primary)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-vt)', fontSize: 14, color: 'var(--text-muted)' }}>
                          {item.quantity}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {error && (
              <p style={{ fontFamily: 'var(--font-vt)', fontSize: 16, color: 'var(--red)', marginTop: 12 }}>
                ⚠ {error}
              </p>
            )}

            <button
              className="pixel-btn"
              onClick={handleCook}
              disabled={loading || pantry.length === 0}
              style={{ width: '100%', marginTop: 16, fontSize: 11, padding: 14 }}
            >
              {loading ? 'COOKING...' : 'COOK IT!'}
            </button>
          </div>

          {/* Right panel: results */}
          <div>
            {!loading && recipes.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, border: '2px dashed var(--border-muted)' }}>
                <img
                  src="/chefhat.png"
                  alt="waiting to cook"
                  style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 16 }}
                />
                <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--text-muted)' }}>
                  WAITING FOR INPUT
                </p>
                <p style={{ fontFamily: 'var(--font-vt)', fontSize: 18, color: 'var(--text-muted)', marginTop: 8 }}>
                  Select ingredients and press COOK IT!
                </p>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 16, animation: 'blink 1.8s infinite' }}>🍳</div>
                <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--orange)' }}>
                  GENERATING RECIPES...
                </p>
              </div>
            )}

            {recipes.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {recipes.map(recipe => (
                  <div key={recipe.id} className="pixel-card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                    {recipe.image && (
                      <div
                        style={{ position: 'relative', width: '100%', height: 140, cursor: 'pointer' }}
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        <Image src={recipe.image} alt={recipe.title} fill style={{ objectFit: 'cover' }} unoptimized />
                      </div>
                    )}
                    <div style={{ padding: 14 }}>
                      <h3
                        style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.6, cursor: 'pointer' }}
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        {recipe.title}
                      </h3>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontFamily: 'var(--font-vt)', fontSize: 14, color: 'var(--text-muted)' }}>
                          ⏱ {recipe.readyInMinutes}min
                        </span>
                        <span style={{ fontFamily: 'var(--font-vt)', fontSize: 14, color: 'var(--text-muted)' }}>
                          🍽 {recipe.servings} servings
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="pixel-btn pixel-btn-outline"
                          style={{ fontSize: 7, padding: '6px 8px', flex: 1 }}
                          onClick={() => setSelectedRecipe(recipe)}
                        >
                          VIEW
                        </button>
                        <button
                          className="pixel-btn"
                          style={{
                            fontSize: 12, padding: '6px 8px',
                            background: savedIds.has(recipe.id) ? 'var(--red)' : 'var(--orange)',
                          }}
                          onClick={() => !savedIds.has(recipe.id) && handleSave(recipe)}
                          disabled={saving === recipe.id || savedIds.has(recipe.id)}
                        >
                          {savedIds.has(recipe.id) ? '❤️' : saving === recipe.id ? '...' : '🤍'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: 28,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, lineHeight: 1.8, flex: 1, paddingRight: 16 }}>
                {selectedRecipe.title}
              </h2>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => !savedIds.has(selectedRecipe.id) && handleSave(selectedRecipe)}
                  style={{ background: 'none', border: '2px solid var(--orange)', color: 'var(--orange)', cursor: 'pointer', padding: '4px 8px', fontSize: 16 }}
                >
                  {savedIds.has(selectedRecipe.id) ? '❤️' : '🤍'}
                </button>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  style={{ background: 'none', border: '2px solid var(--border-muted)', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 10px', fontSize: 18 }}
                >✕</button>
              </div>
            </div>

            {selectedRecipe.image && (
              <div style={{ position: 'relative', width: '100%', height: 200, marginBottom: 16 }}>
                <Image src={selectedRecipe.image} alt={selectedRecipe.title} fill style={{ objectFit: 'cover' }} unoptimized />
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, padding: '4px 8px', border: '1px solid var(--orange)', color: 'var(--orange)' }}>
                COOK: {selectedRecipe.readyInMinutes}MIN
              </span>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, padding: '4px 8px', border: '1px solid var(--blue)', color: 'var(--blue)' }}>
                SERVES {selectedRecipe.servings}
              </span>
            </div>

            {selectedRecipe.summary && (
              <p style={{ fontFamily: 'var(--font-vt)', fontSize: 17, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                {stripHtml(selectedRecipe.summary).slice(0, 300)}...
              </p>
            )}

            {selectedRecipe.extendedIngredients?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--orange)', marginBottom: 12 }}>
                  INGREDIENTS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedRecipe.extendedIngredients.map((ing, i) => (
                    <div key={i} style={{ fontFamily: 'var(--font-vt)', fontSize: 17, padding: '6px 10px', background: 'var(--bg-dark)', borderLeft: '3px solid var(--orange)' }}>
                      {ing.original}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedRecipe.analyzedInstructions?.[0]?.steps?.length > 0 && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--orange)', marginBottom: 12 }}>
                  INSTRUCTIONS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedRecipe.analyzedInstructions[0].steps.map(step => (
                    <div key={step.number} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{
                        fontFamily: 'var(--font-pixel)', fontSize: 8,
                        background: step.number % 2 === 0 ? 'var(--blue)' : 'var(--orange)',
                        color: '#fff', padding: '3px 7px', flexShrink: 0,
                        boxShadow: '2px 2px 0 #000',
                      }}>
                        {String(step.number).padStart(2, '0')}
                      </span>
                      <p style={{ fontFamily: 'var(--font-vt)', fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {step.step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}