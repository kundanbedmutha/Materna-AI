import React, { useState } from 'react';
import './FoodPage.css';

const FEELINGS = [
  { emoji: '🤢', label: 'Nauseous',        key: 'nauseous'    },
  { emoji: '😴', label: 'Tired / fatigued', key: 'tired'       },
  { emoji: '🔥', label: 'Heartburn',        key: 'heartburn'   },
  { emoji: '😤', label: 'Bloated',          key: 'bloated'     },
  { emoji: '💪', label: 'Need energy',      key: 'energy'      },
  { emoji: '🦴', label: 'Leg cramps',       key: 'cramps'      },
  { emoji: '😬', label: 'Constipated',      key: 'constipated' },
  { emoji: '🥰', label: 'Feeling great',    key: 'great'       },
];

// Full recipe objects: { name, emoji, time, serves, ingredients[], steps[], note }
const RECIPES = {

  // ── GINGER LEMON HONEY TEA ──────────────────────────────────────
  ginger_tea: {
    name: 'Ginger Lemon Honey Tea', emoji: '🍵', time: '5 min', serves: 1,
    tags: ['nausea', 'heartburn', 'all diets'],
    ingredients: ['1 cup water', '1 inch fresh ginger (peeled & grated)', '½ lemon (juice)', '1 tsp honey (optional)', 'A few mint leaves'],
    steps: [
      'Bring 1 cup of water to a boil in a small saucepan.',
      'Add grated ginger and reduce to a simmer for 3 minutes.',
      'Remove from heat and strain into a mug.',
      'Squeeze in lemon juice and stir in honey.',
      'Add mint leaves and sip slowly while warm.',
    ],
    note: 'Sip in small amounts throughout the morning. Ginger is clinically proven to reduce pregnancy nausea.',
  },

  // ── MOONG DAL KHICHDI ───────────────────────────────────────────
  moong_khichdi: {
    name: 'Moong Dal Khichdi', emoji: '🍲', time: '25 min', serves: 2,
    tags: ['bloated', 'nauseous', 'veg', 'vegan'],
    ingredients: ['½ cup yellow moong dal (washed)', '½ cup basmati rice (washed)', '1 tsp ghee or oil', '½ tsp cumin seeds', '¼ tsp turmeric', '½ tsp ginger (grated)', 'Salt to taste', '3 cups water', 'Fresh coriander to garnish'],
    steps: [
      'Wash dal and rice together until water runs clear. Soak for 15 minutes.',
      'Heat ghee in a pressure cooker. Add cumin seeds and let them splutter.',
      'Add grated ginger and stir for 30 seconds.',
      'Add turmeric, then the drained dal and rice. Stir gently to coat.',
      'Pour in 3 cups of water. Add salt. Stir well.',
      'Pressure cook on medium heat for 3 whistles.',
      'Allow pressure to release naturally. Open and stir — it should be soft and porridge-like.',
      'Garnish with fresh coriander. Serve warm with a drizzle of ghee.',
    ],
    note: 'Easy on digestion, rich in protein and iron. Ideal when appetite is low. Avoid adding spices if very nauseous.',
  },

  // ── SPINACH IRON SMOOTHIE ────────────────────────────────────────
  spinach_smoothie: {
    name: 'Iron Boost Spinach Smoothie', emoji: '🥤', time: '5 min', serves: 1,
    tags: ['tired', 'energy', 'veg', 'vegan'],
    ingredients: ['1 cup fresh baby spinach', '1 ripe banana (frozen for creaminess)', '½ cup milk or oat milk', '1 tbsp peanut butter', '1 tsp flaxseed powder', '4–5 soaked almonds', 'A pinch of cinnamon', 'Ice cubes (optional)'],
    steps: [
      'Soak almonds in water for at least 2 hours, then peel the skins off.',
      'Add spinach to the blender first — this helps it blend smoothly.',
      'Add frozen banana, milk, peanut butter, almonds, and flaxseed.',
      'Sprinkle in cinnamon for flavour and blood sugar balance.',
      'Blend on high for 45–60 seconds until completely smooth.',
      'Pour into a glass and drink immediately for maximum nutrients.',
    ],
    note: 'The vitamin C in banana helps absorb iron from spinach. Best consumed in the morning. For diabetic moms: skip banana and use ½ cup cucumber instead.',
  },

  // ── RAGI PORRIDGE ───────────────────────────────────────────────
  ragi_porridge: {
    name: 'Ragi (Finger Millet) Porridge', emoji: '🥣', time: '15 min', serves: 1,
    tags: ['cramps', 'tired', 'veg', 'gestational_diabetes'],
    ingredients: ['3 tbsp ragi flour', '1½ cups water or milk', '1 tsp jaggery or honey (optional)', 'A pinch of cardamom powder', '1 tsp ghee', '5–6 soaked cashews or almonds (chopped)'],
    steps: [
      'Mix ragi flour in ¼ cup cold water first to remove lumps — whisk until smooth.',
      'Heat the remaining 1¼ cups of milk or water in a saucepan over medium heat.',
      'Once warm (not boiling), slowly pour in the ragi mixture while stirring continuously.',
      'Keep stirring on low heat for 8–10 minutes until it thickens to a smooth, creamy consistency.',
      'Add jaggery and cardamom. Stir well.',
      'Remove from heat. Top with ghee and chopped nuts.',
      'Serve warm. Best eaten slowly.',
    ],
    note: 'Ragi is the richest plant source of calcium — ideal for leg cramps. Low glycaemic index makes it safe for gestational diabetes too. Skip jaggery for GDM.',
  },

  // ── PALAK DAL ───────────────────────────────────────────────────
  palak_dal: {
    name: 'Palak (Spinach) Dal', emoji: '🍛', time: '30 min', serves: 3,
    tags: ['tired', 'great', 'veg', 'vegan', 'hypertension'],
    ingredients: ['1 cup toor dal (split pigeon peas)', '2 cups fresh spinach (chopped)', '1 tomato (chopped)', '1 onion (chopped)', '3 garlic cloves (minced)', '½ tsp cumin seeds', '½ tsp turmeric', '½ tsp coriander powder', '1 tsp ghee or oil', 'Salt to taste', 'Lemon juice to finish'],
    steps: [
      'Pressure cook toor dal with turmeric and 2.5 cups water for 4 whistles until very soft.',
      'In a separate pan, heat ghee. Add cumin seeds until they splutter.',
      'Add onion and garlic. Sauté on medium heat for 4–5 minutes until golden.',
      'Add tomato and cook until soft and mushy, about 4 minutes.',
      'Add coriander powder and stir for 1 minute.',
      'Add chopped spinach. Stir and cook for 3 minutes until wilted.',
      'Pour the cooked dal into the pan. Mix well. Add salt.',
      'Simmer together for 5 minutes. Adjust consistency with water.',
      'Finish with a squeeze of lemon juice. Serve hot with brown rice or roti.',
    ],
    note: 'One of the most nutritionally complete vegetarian meals in pregnancy. Iron from dal + spinach, folate from both, calcium from spinach. Low sodium — safe for hypertension.',
  },

  // ── BANANA OAT PANCAKES ─────────────────────────────────────────
  banana_oat_pancakes: {
    name: 'Banana Oat Pancakes', emoji: '🥞', time: '20 min', serves: 2,
    tags: ['energy', 'great', 'constipated', 'veg'],
    ingredients: ['1 ripe banana (mashed)', '1 cup rolled oats (blended to flour)', '2 eggs', '½ cup milk', '1 tsp baking powder', '½ tsp cinnamon', '1 tsp vanilla extract', 'Pinch of salt', 'Ghee or butter for cooking', 'Honey + berries to serve'],
    steps: [
      'Blend rolled oats into a fine flour using a blender.',
      'In a large bowl, mash the banana thoroughly until no lumps remain.',
      'Add eggs, milk, and vanilla. Whisk well.',
      'Add oat flour, baking powder, cinnamon, and salt. Stir until just combined — do not overmix.',
      'Let batter rest for 5 minutes — this makes fluffier pancakes.',
      'Heat a non-stick pan on medium. Add a small amount of ghee.',
      'Pour ¼ cup of batter per pancake. Cook until bubbles form on top (2–3 min), then flip.',
      'Cook for another 1–2 minutes until golden.',
      'Serve with honey and fresh berries or banana slices.',
    ],
    note: 'High fibre from oats + natural sugar from banana = sustained energy without spikes. Great for gestational diabetes when made without honey.',
  },

  // ── SWEET POTATO SOUP ───────────────────────────────────────────
  sweet_potato_soup: {
    name: 'Creamy Sweet Potato Soup', emoji: '🍠', time: '30 min', serves: 3,
    tags: ['energy', 'heartburn', 'veg', 'vegan'],
    ingredients: ['2 medium sweet potatoes (peeled & cubed)', '1 onion (chopped)', '2 garlic cloves', '1 inch ginger', '1 cup coconut milk', '2 cups vegetable broth', '½ tsp turmeric', '½ tsp cumin', 'Salt to taste', '1 tbsp olive oil', 'Fresh coriander & pumpkin seeds to serve'],
    steps: [
      'Heat olive oil in a large pot. Add onion and cook for 4 minutes until soft.',
      'Add garlic and ginger. Stir for 1 minute.',
      'Add cubed sweet potato, turmeric, and cumin. Stir to coat.',
      'Pour in vegetable broth. Bring to a boil, then reduce to simmer.',
      'Cook for 20 minutes until sweet potato is completely soft when pierced.',
      'Remove from heat. Using an immersion blender, blend until smooth and creamy.',
      'Stir in coconut milk. Return to low heat for 3 minutes.',
      'Adjust salt. Serve in bowls topped with pumpkin seeds and coriander.',
    ],
    note: 'Beta-carotene rich for baby eye development. Mild and soothing — excellent for heartburn. Coconut milk adds healthy fats. Diabetic moms: use less sweet potato and more broccoli.',
  },

  // ── DATES ALMOND MILK ───────────────────────────────────────────
  dates_milk: {
    name: 'Dates & Almond Warm Milk', emoji: '🥛', time: '10 min', serves: 1,
    tags: ['tired', 'cramps', 'energy', 'veg'],
    ingredients: ['1½ cups full-fat milk (or almond milk for vegan)', '4–5 Medjool dates (pitted & chopped)', '5 soaked almonds', '¼ tsp cardamom powder', 'A pinch of saffron (optional)', '¼ tsp turmeric'],
    steps: [
      'Soak almonds overnight. Peel and keep aside.',
      'Blend chopped dates with ¼ cup warm milk until smooth.',
      'Heat remaining milk in a saucepan over low heat.',
      'Add blended date mixture, almonds, cardamom, and turmeric.',
      'Stir and simmer gently for 5 minutes — do not boil.',
      'Add saffron if using. Stir well.',
      'Pour into a mug and sip slowly, ideally 30 minutes before bedtime.',
    ],
    note: 'Research from 2011 (Jordan study) showed dates from week 36 support cervical ripening. Rich in potassium for cramps. Iron + calcium from almonds. Not recommended for gestational diabetes.',
  },

  // ── LENTIL COCONUT CURRY ────────────────────────────────────────
  lentil_curry: {
    name: 'Red Lentil Coconut Curry', emoji: '🍛', time: '35 min', serves: 3,
    tags: ['tired', 'great', 'vegan', 'energy'],
    ingredients: ['1 cup red lentils (masoor dal)', '1 can coconut milk (400ml)', '1 cup water', '1 onion (finely chopped)', '3 garlic cloves (minced)', '1 inch ginger (grated)', '2 tomatoes (chopped)', '1 tsp turmeric', '1 tsp coriander powder', '½ tsp cumin powder', '1 tbsp coconut oil', 'Salt to taste', 'Lemon juice + coriander to finish'],
    steps: [
      'Rinse lentils until water runs clear. No soaking needed for red lentils.',
      'Heat coconut oil in a deep pan. Add onion and cook until golden (6–7 min).',
      'Add garlic and ginger. Stir for 1 minute on medium heat.',
      'Add chopped tomatoes. Cook for 5 minutes until they break down.',
      'Add turmeric, coriander, and cumin. Stir for 1 minute.',
      'Add lentils, coconut milk, and 1 cup water. Stir well.',
      'Bring to a boil then simmer on low for 20 minutes, stirring occasionally.',
      'Lentils should be completely soft and the curry thick and creamy.',
      'Add salt. Finish with lemon juice and fresh coriander.',
      'Serve over brown rice or with naan bread.',
    ],
    note: 'Protein-complete meal for vegans. DHA from coconut fats, iron + folate from lentils. Mild enough for most trimesters.',
  },

  // ── CHICKEN SOUP ────────────────────────────────────────────────
  chicken_soup: {
    name: 'Nourishing Ginger Chicken Soup', emoji: '🍲', time: '45 min', serves: 3,
    tags: ['nauseous', 'tired', 'heartburn', 'nonveg'],
    ingredients: ['300g chicken breast (bone-in preferred)', '1 carrot (sliced)', '1 celery stalk (chopped)', '1 small onion (quartered)', '3 garlic cloves (whole)', '1 inch ginger (sliced)', '½ tsp turmeric', '1 tsp black pepper', 'Salt to taste', '4 cups water', 'Fresh parsley to garnish'],
    steps: [
      'Place chicken, onion, garlic, ginger, and celery into a large pot.',
      'Pour in 4 cups of cold water. This extracts more collagen from bones.',
      'Bring to a boil. Skim off any foam that rises to the surface.',
      'Add turmeric, black pepper, and carrot slices.',
      'Reduce heat to low. Simmer with lid partially on for 35 minutes.',
      'Remove chicken. Shred the meat into small pieces using two forks.',
      'Return shredded chicken to the pot. Discard bones.',
      'Add salt. Simmer for 5 more minutes.',
      'Garnish with fresh parsley. Serve in a warm bowl.',
    ],
    note: 'Bone broth provides collagen, glycine, and minerals. Ginger reduces nausea. Low-fat, easy to digest — ideal for all trimesters especially when appetite is poor.',
  },

  // ── BAKED SALMON ────────────────────────────────────────────────
  baked_salmon: {
    name: 'Garlic Herb Baked Salmon', emoji: '🐟', time: '25 min', serves: 2,
    tags: ['energy', 'great', 'tired', 'nonveg'],
    ingredients: ['2 salmon fillets (150g each)', '2 garlic cloves (minced)', '1 tbsp olive oil', '1 tsp dried herbs (dill or parsley)', '½ lemon (sliced)', 'Salt and black pepper to taste', 'Steamed broccoli and brown rice to serve'],
    steps: [
      'Preheat oven to 200°C (400°F). Line a baking tray with foil.',
      'Pat salmon fillets dry with a paper towel.',
      'Mix olive oil, garlic, herbs, salt, and pepper in a small bowl.',
      'Place salmon skin-side down on the tray. Spoon the garlic mixture over each fillet.',
      'Lay lemon slices on top of each fillet.',
      'Bake for 15–18 minutes until salmon flakes easily with a fork.',
      'The internal temperature should reach 63°C (145°F) — important in pregnancy.',
      'Serve with steamed broccoli and brown rice.',
    ],
    note: 'Salmon is the safest high-omega-3 fish in pregnancy — 2–3 portions/week recommended. DHA is critical for baby brain and eye development in T2 and T3. Ensure it is thoroughly cooked.',
  },

  // ── EGG SPINACH OMELETTE ────────────────────────────────────────
  egg_omelette: {
    name: 'Spinach & Cheese Omelette', emoji: '🍳', time: '12 min', serves: 1,
    tags: ['tired', 'energy', 'great', 'nonveg'],
    ingredients: ['2 large eggs', '1 cup fresh spinach (roughly chopped)', '2 tbsp grated cheese (cheddar or paneer)', '1 tsp butter or oil', '2 tbsp milk', 'Salt and black pepper', 'Pinch of turmeric', 'Whole wheat toast to serve'],
    steps: [
      'Crack eggs into a bowl. Add milk, salt, pepper, and turmeric.',
      'Whisk vigorously for 30 seconds until light and slightly frothy.',
      'Heat butter in a non-stick pan over medium heat.',
      'Add spinach to the pan. Stir for 1 minute until just wilted.',
      'Pour egg mixture over the spinach evenly.',
      'Cook undisturbed for 2–3 minutes until edges are set but centre is still slightly soft.',
      'Sprinkle grated cheese over one half.',
      'Fold the omelette in half over the cheese. Cook 1 more minute.',
      'Slide onto plate. Serve immediately with whole wheat toast.',
    ],
    note: 'Eggs provide choline — essential for baby brain development and often missed in prenatal vitamins. Iron from spinach + vitamin C from any fruit on the side = excellent absorption combo.',
  },

  // ── PAPAYA PRUNE BOWL ───────────────────────────────────────────
  papaya_bowl: {
    name: 'Papaya & Prune Digestive Bowl', emoji: '🧡', time: '5 min', serves: 1,
    tags: ['constipated', 'bloated', 'all diets'],
    ingredients: ['1 cup ripe papaya (cubed)', '4–5 prunes (pitted, chopped)', '½ cup plain yoghurt (or coconut yoghurt for vegan)', '1 tsp chia seeds', '1 tsp flaxseed powder', '1 tsp honey (optional)', 'A squeeze of lime'],
    steps: [
      'Cube ripe papaya into a bowl — choose fully orange-ripe papaya for maximum papain enzyme.',
      'Chop prunes and scatter over the papaya.',
      'Spoon yoghurt over the fruit.',
      'Sprinkle chia seeds and flaxseed powder on top.',
      'Add a squeeze of lime and drizzle honey if desired.',
      'Eat immediately — best consumed in the morning on a semi-empty stomach for digestion.',
    ],
    note: 'Papain enzyme in ripe papaya gently stimulates digestion. Prunes are clinically shown to relieve constipation. Chia + flax add soluble fibre. Avoid raw unripe papaya — only ripe is safe.',
  },

  // ── BANANA SMOOTHIE ─────────────────────────────────────────────
  banana_smoothie: {
    name: 'Banana Potassium Smoothie', emoji: '🍌', time: '5 min', serves: 1,
    tags: ['cramps', 'nauseous', 'energy', 'all diets'],
    ingredients: ['2 ripe bananas (1 frozen)', '1 cup milk or oat milk', '1 tbsp almond butter', '1 tsp sesame seeds (til)', '¼ tsp cinnamon', '1 tsp honey', 'Ice cubes (optional)'],
    steps: [
      'Peel and freeze one banana the night before for creamier texture.',
      'Add both bananas to the blender.',
      'Add milk, almond butter, sesame seeds, and cinnamon.',
      'Blend on high for 45 seconds until smooth and creamy.',
      'Add honey and blend for 5 seconds more.',
      'Pour into a glass. Serve cold.',
    ],
    note: 'Bananas are the best natural potassium source for leg cramps. Sesame seeds (til) add calcium and magnesium. Safe for all trimesters. For GDM: use only 1 banana and skip honey.',
  },

  // ── OVERNIGHT OATS ──────────────────────────────────────────────
  overnight_oats: {
    name: 'High-Fibre Overnight Oats', emoji: '🥣', time: '5 min prep + overnight', serves: 1,
    tags: ['constipated', 'energy', 'great', 'veg', 'vegan'],
    ingredients: ['½ cup rolled oats', '¾ cup milk or plant milk', '1 tbsp chia seeds', '1 tbsp flaxseed (ground)', '1 tsp honey or maple syrup', '½ tsp vanilla extract', 'Fresh berries and nuts to top'],
    steps: [
      'Add oats, chia seeds, and ground flaxseed to a jar or container.',
      'Pour in milk. Add honey and vanilla. Stir everything well.',
      'Press oats down to ensure they are submerged in liquid.',
      'Seal the jar. Refrigerate overnight (or at least 6 hours).',
      'In the morning, give it a good stir — add a splash more milk if too thick.',
      'Top with fresh berries, a spoonful of nut butter, and crushed nuts.',
      'Eat cold straight from the jar or warm briefly in the microwave (1 min).',
    ],
    note: 'Oats + chia + flax = triple fibre hit for constipation. Beta-glucan in oats also helps regulate blood sugar — ideal for gestational diabetes. Prepare the night before for an effortless morning.',
  },
};

// ── Medical condition → food adjustments ──────────────────────────
function getMedicalNote(ctx) {
  const notes = [];
  if (ctx.risk_hypertension)        notes.push({ icon: '❤️', text: 'Low sodium foods prioritised — hypertension noted in your profile.' });
  if (ctx.risk_gestational_diabetes) notes.push({ icon: '🩸', text: 'Low-GI, low-sugar options selected — gestational diabetes noted.' });
  if (ctx.risk_depression_hx)       notes.push({ icon: '🧠', text: 'Omega-3 and tryptophan-rich foods included for mood support.' });
  if (ctx.risk_smoking)             notes.push({ icon: '🚭', text: 'Extra antioxidant-rich foods recommended to counter oxidative stress.' });
  if (ctx.risk_prev_preterm)        notes.push({ icon: '⏰', text: 'Magnesium and anti-inflammatory foods prioritised.' });
  return notes;
}

// ── Recipe selector based on diet + feeling + medical conditions ──
function getRecipes(diet, feeling, ctx) {
  const isGDM   = !!ctx.risk_gestational_diabetes;
  const isHyper = !!ctx.risk_hypertension;

  const sets = {
    veg: {
      nauseous:    ['ginger_tea', 'moong_khichdi', 'banana_smoothie'],
      tired:       ['spinach_smoothie', 'ragi_porridge', 'palak_dal'],
      heartburn:   ['ginger_tea', 'sweet_potato_soup', 'banana_smoothie'],
      bloated:     ['moong_khichdi', 'papaya_bowl', 'ginger_tea'],
      energy:      ['banana_oat_pancakes', 'spinach_smoothie', 'sweet_potato_soup'],
      cramps:      ['ragi_porridge', 'banana_smoothie', 'dates_milk'],
      constipated: ['papaya_bowl', 'overnight_oats', 'banana_oat_pancakes'],
      great:       ['palak_dal', 'banana_oat_pancakes', 'ragi_porridge'],
    },
    vegan: {
      nauseous:    ['ginger_tea', 'moong_khichdi', 'banana_smoothie'],
      tired:       ['lentil_curry', 'spinach_smoothie', 'overnight_oats'],
      heartburn:   ['sweet_potato_soup', 'ginger_tea', 'papaya_bowl'],
      bloated:     ['moong_khichdi', 'papaya_bowl', 'ginger_tea'],
      energy:      ['lentil_curry', 'overnight_oats', 'spinach_smoothie'],
      cramps:      ['banana_smoothie', 'ragi_porridge', 'overnight_oats'],
      constipated: ['papaya_bowl', 'overnight_oats', 'lentil_curry'],
      great:       ['lentil_curry', 'sweet_potato_soup', 'overnight_oats'],
    },
    nonveg: {
      nauseous:    ['chicken_soup', 'ginger_tea', 'banana_smoothie'],
      tired:       ['egg_omelette', 'baked_salmon', 'chicken_soup'],
      heartburn:   ['chicken_soup', 'ginger_tea', 'banana_smoothie'],
      bloated:     ['chicken_soup', 'papaya_bowl', 'ginger_tea'],
      energy:      ['baked_salmon', 'egg_omelette', 'banana_oat_pancakes'],
      cramps:      ['baked_salmon', 'banana_smoothie', 'egg_omelette'],
      constipated: ['papaya_bowl', 'overnight_oats', 'chicken_soup'],
      great:       ['baked_salmon', 'egg_omelette', 'chicken_soup'],
    },
  };

  let keys = (sets[diet]?.[feeling] || ['moong_khichdi', 'ginger_tea', 'banana_smoothie']);

  // Swap out high-GI recipes for GDM
  if (isGDM) {
    keys = keys.map(k => k === 'dates_milk' ? 'ragi_porridge' : k);
  }

  return keys.map(k => RECIPES[k]).filter(Boolean);
}

function RecipeCard({ recipe, open, onToggle }) {
  return (
    <div className={`recipe-card ${open ? 'open' : ''}`}>
      <button className="recipe-header" onClick={onToggle}>
        <div className="recipe-header-left">
          <span className="recipe-emoji">{recipe.emoji}</span>
          <div>
            <div className="recipe-name">{recipe.name}</div>
            <div className="recipe-meta">
              <span>⏱ {recipe.time}</span>
              <span>👤 Serves {recipe.serves}</span>
            </div>
          </div>
        </div>
        <span className="recipe-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="recipe-body">
          <div className="recipe-section">
            <h4 className="recipe-section-title">🛒 Ingredients</h4>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>

          <div className="recipe-section">
            <h4 className="recipe-section-title">👩‍🍳 Method</h4>
            <ol className="steps-list">
              {recipe.steps.map((step, i) => (
                <li key={i}>
                  <span className="step-num">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="recipe-note">
            <span className="recipe-note-icon">💡</span>
            <p>{recipe.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FoodPage({ ctx }) {
  const [diet, setDiet]       = useState('veg');
  const [feeling, setFeeling] = useState(null);
  const [openIdx, setOpenIdx] = useState(0);

  const trimester = ctx.trimester || 2;
  const medNotes  = getMedicalNote(ctx);
  const recipes   = feeling ? getRecipes(diet, feeling, ctx) : [];

  return (
    <div className="food-page">
      <div className="food-header">
        <div className="food-header-icon">🥗</div>
        <div>
          <h1 className="food-title">Food & Nutrition Guide</h1>
          <p className="food-sub">Trimester {trimester} · Full recipes tailored to how you feel</p>
        </div>
      </div>

      {/* Medical alerts from sidebar */}
      {medNotes.length > 0 && (
        <div className="med-notes">
          <div className="med-notes-title">Personalised for your health profile:</div>
          {medNotes.map((n, i) => (
            <div key={i} className="med-note-pill">
              <span>{n.icon}</span><span>{n.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Diet selector */}
      <div className="food-section">
        <h2 className="food-section-title">My diet preference</h2>
        <div className="diet-tabs">
          {[
            { key: 'veg',    label: 'Vegetarian', icon: '🌿' },
            { key: 'vegan',  label: 'Vegan',       icon: '🌱' },
            { key: 'nonveg', label: 'Non-Veg',     icon: '🍗' },
          ].map(d => (
            <button key={d.key}
              className={`diet-tab ${diet === d.key ? 'active' : ''}`}
              onClick={() => { setDiet(d.key); setFeeling(null); setOpenIdx(0); }}>
              <span className="diet-icon">{d.icon}</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feeling selector */}
      <div className="food-section">
        <h2 className="food-section-title">How are you feeling right now?</h2>
        <div className="feeling-grid">
          {FEELINGS.map(f => (
            <button key={f.key}
              className={`feeling-btn ${feeling === f.key ? 'active' : ''}`}
              onClick={() => { setFeeling(f.key); setOpenIdx(0); }}>
              <span className="feeling-emoji">{f.emoji}</span>
              <span className="feeling-label">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recipe cards */}
      {feeling && recipes.length > 0 && (
        <div className="food-section">
          <h2 className="food-section-title">
            Recommended recipes for you
            <span className="recipe-count">{recipes.length} recipes</span>
          </h2>
          <div className="recipes-list">
            {recipes.map((r, i) => (
              <RecipeCard
                key={i} recipe={r}
                open={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      )}

      {!feeling && (
        <div className="food-placeholder">
          <div className="food-placeholder-emoji">🌸</div>
          <p>Choose your diet and how you're feeling to get full personalised recipes for Trimester {trimester}.</p>
        </div>
      )}

      {/* Nutrients */}
      <div className="food-section nutrients-section">
        <h2 className="food-section-title">Essential nutrients for Trimester {trimester}</h2>
        <div className="nutrients-grid">
          {(trimester === 1 ? [
            { name: 'Folic acid',  why: 'Neural tube development', amount: '600 mcg/day', icon: '🥬' },
            { name: 'Iron',        why: 'Blood production',         amount: '27 mg/day',  icon: '🫘' },
            { name: 'Vitamin B12', why: 'Brain development',        amount: '2.6 mcg/day',icon: '🥚' },
            { name: 'Vitamin D',   why: 'Bone formation',           amount: '600 IU/day', icon: '☀️' },
          ] : trimester === 2 ? [
            { name: 'Calcium',     why: "Baby's bones & teeth",     amount: '1000 mg/day',icon: '🥛' },
            { name: 'Iron',        why: 'Doubled blood volume',      amount: '27 mg/day',  icon: '🫘' },
            { name: 'Omega-3 DHA', why: 'Brain & eye development',  amount: '200 mg/day', icon: '🐟' },
            { name: 'Protein',     why: 'Tissue growth',             amount: '71 g/day',   icon: '🥩' },
          ] : [
            { name: 'Calcium',     why: 'Bone mineralisation',       amount: '1000 mg/day',icon: '🥛' },
            { name: 'Iron',        why: 'Baby iron stores',          amount: '27 mg/day',  icon: '🫘' },
            { name: 'Omega-3 DHA', why: 'Final brain growth spurt',  amount: '300 mg/day', icon: '🐟' },
            { name: 'Vitamin K',   why: 'Blood clotting for birth',  amount: '90 mcg/day', icon: '🥦' },
          ]).map((n, i) => (
            <div key={i} className="nutrient-card">
              <div className="nutrient-icon">{n.icon}</div>
              <div className="nutrient-name">{n.name}</div>
              <div className="nutrient-why">{n.why}</div>
              <div className="nutrient-amount">{n.amount}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="food-disclaimer">
        🩺 Recipes are general guidance. Your nutritional needs may vary. Always consult your OB or registered dietitian — especially if you have gestational diabetes, hypertension, or food allergies.
      </div>
    </div>
  );
}