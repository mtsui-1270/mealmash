'use client';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';

type PantryItem = {
  id: string;
  name: string;
  quantity: string;
  category: string;
  created_at: string;
};

const CATEGORIES = ['ALL', 'PRODUCE', 'DAIRY', 'MEAT', 'GRAINS', 'OTHER'];

const CATEGORY_ICONS: Record<string, string> = {
  PRODUCE: '🥦',
  DAIRY: '🥛',
  MEAT: '🥩',
  GRAINS: '🌾',
  OTHER: '🍱',
};

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<PantryItem | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formQty, setFormQty] = useState('');
  const [formCat, setFormCat] = useState('PRODUCE');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/pantry');
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => {
    setEditItem(null);
    setFormName('');
    setFormQty('');
    setFormCat('PRODUCE');
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (item: PantryItem) => {
    setEditItem(item);
    setFormName(item.name);
    setFormQty(item.quantity);
    setFormCat(item.category);
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formQty.trim()) {
      setFormError('All fields are required.');
      return;
    }
    setSaving(true);

    if (editItem) {
      await fetch(`/api/pantry/${editItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, quantity: formQty, category: formCat }),
      });
    } else {
      await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, quantity: formQty, category: formCat }),
      });
    }

    setSaving(false);
    setShowModal(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/pantry/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  const filtered = items.filter(i => {
    const matchCat = filter === 'ALL' || i.category === filter;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div className="pixel-card" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>🫙</span>
            <div>
              <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, color: 'var(--orange)' }}>
                MY PANTRY
              </h1>
              <p style={{ fontFamily: 'var(--font-vt)', fontSize: 16, color: 'var(--text-muted)' }}>
                {items.length} ITEMS
              </p>
            </div>
          </div>
          <button className="pixel-btn" onClick={openAdd} style={{ fontSize: 9 }}>
            + ADD ITEM
          </button>
        </div>

        {/* Search */}
        <input
          className="pixel-input"
          placeholder="SEARCH INVENTORY..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 12 }}
        />

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`tag ${filter === c ? 'active' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Items */}
        {loading ? (
          <p style={{
            fontFamily: 'var(--font-pixel)', fontSize: 9,
            color: 'var(--text-muted)', textAlign: 'center', padding: 40,
          }}>
            LOADING...
          </p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🍽️</div>
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--text-muted)' }}>
              {search || filter !== 'ALL' ? 'NO ITEMS FOUND' : 'YOUR PANTRY IS EMPTY'}
            </p>
            {!search && filter === 'ALL' && (
              <p style={{ fontFamily: 'var(--font-vt)', fontSize: 18, color: 'var(--text-muted)', marginTop: 8 }}>
                Click + ADD ITEM to get started
              </p>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 14,
          }}>
            {filtered.map(item => (
              <div key={item.id} className="pixel-border-dark fade-in" style={{
                background: 'var(--bg-card)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '4px 4px 0px #000',
              }}>
                <span style={{ fontSize: 22 }}>
                  {CATEGORY_ICONS[item.category] || '🍱'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-pixel)', fontSize: 9,
                    color: 'var(--text-primary)', marginBottom: 4,
                  }}>
                    {item.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-vt)', fontSize: 16, color: 'var(--text-muted)' }}>
                    {item.quantity}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(item)}
                    style={{
                      background: 'var(--blue)', border: 'none', color: '#fff',
                      cursor: 'pointer', padding: '4px 8px', fontSize: 14,
                      boxShadow: '2px 2px 0 #000',
                    }}
                  >✏️</button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      background: 'var(--red)', border: 'none', color: '#fff',
                      cursor: 'pointer', padding: '4px 8px', fontSize: 14,
                      boxShadow: '2px 2px 0 #000',
                    }}
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="pixel-card"
            style={{ width: '100%', maxWidth: 420, background: 'var(--bg-card)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 24,
            }}>
              <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: 11 }}>
                {editItem ? 'EDIT ITEM' : 'ADD ITEM'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}
              >✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{
                  fontFamily: 'var(--font-pixel)', fontSize: 8,
                  color: 'var(--text-muted)', display: 'block', marginBottom: 6,
                }}>
                  ITEM NAME
                </label>
                <input
                  className="pixel-input"
                  placeholder="eg. Half an Onion..."
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                />
              </div>
              <div>
                <label style={{
                  fontFamily: 'var(--font-pixel)', fontSize: 8,
                  color: 'var(--text-muted)', display: 'block', marginBottom: 6,
                }}>
                  QUANTITY
                </label>
                <input
                  className="pixel-input"
                  placeholder="eg. 1 cup, 8 cloves..."
                  value={formQty}
                  onChange={e => setFormQty(e.target.value)}
                />
              </div>
              <div>
                <label style={{
                  fontFamily: 'var(--font-pixel)', fontSize: 8,
                  color: 'var(--text-muted)', display: 'block', marginBottom: 6,
                }}>
                  CATEGORY
                </label>
                <select
                  className="pixel-select"
                  value={formCat}
                  onChange={e => setFormCat(e.target.value)}
                >
                  {CATEGORIES.filter(c => c !== 'ALL').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p style={{ fontFamily: 'var(--font-vt)', fontSize: 16, color: 'var(--red)', marginBottom: 12 }}>
                ⚠ {formError}
              </p>
            )}

            <button
              className="pixel-btn"
              onClick={handleSave}
              disabled={saving}
              style={{ width: '100%', fontSize: 11, padding: 14 }}
            >
              {saving ? 'SAVING...' : editItem ? 'SAVE CHANGES' : 'ADD ITEM'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}