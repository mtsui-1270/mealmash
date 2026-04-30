import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { ingredients } = await request.json();

  if (!ingredients || ingredients.length === 0) {
    return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
  }

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  // Step 1: find recipes matching the ingredients
  const ingredientStr = ingredients.join(',');
  const searchRes = await fetch(
    `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientStr)}&number=6&ranking=1&ignorePantry=false&apiKey=${apiKey}`
  );

  if (!searchRes.ok) {
    const text = await searchRes.text();
    return NextResponse.json({ error: 'Spoonacular error: ' + text }, { status: 500 });
  }

  const recipes = await searchRes.json();
  if (!recipes || recipes.length === 0) return NextResponse.json([]);

  // Step 2: get full details for each recipe
  const ids = recipes.map((r: { id: number }) => r.id).join(',');
  const detailRes = await fetch(
    `https://api.spoonacular.com/recipes/informationBulk?ids=${ids}&includeNutrition=false&apiKey=${apiKey}`
  );

  if (!detailRes.ok) return NextResponse.json(recipes);

  const details = await detailRes.json();
  return NextResponse.json(details);
}