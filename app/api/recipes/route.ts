import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('saved_recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { spoonacular_id, title, image, ready_in_minutes, servings, summary, ingredients, instructions } = body;

  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_recipes')
    .select('id')
    .eq('user_id', user.id)
    .eq('spoonacular_id', spoonacular_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Already saved' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('saved_recipes')
    .insert({ user_id: user.id, spoonacular_id, title, image, ready_in_minutes, servings, summary, ingredients, instructions })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}