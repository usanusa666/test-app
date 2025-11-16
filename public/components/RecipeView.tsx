import React, { useState } from 'react';
import { ChevronDownIcon } from './Icons';

const recipes = [
  {
    title: 'Classic Banana Bread',
    description: 'A moist and delicious banana bread, perfect for using up ripe bananas.',
    ingredients: [
      '2 cups all-purpose flour',
      '1 tsp baking soda',
      '1/4 tsp salt',
      '1/2 cup butter, softened',
      '3/4 cup brown sugar',
      '2 large eggs, beaten',
      '2 1/3 cups mashed overripe bananas (about 4-5)',
    ],
    instructions: [
      'Preheat oven to 350°F (175°C). Lightly grease a 9x5 inch loaf pan.',
      'In a large bowl, combine flour, baking soda and salt.',
      'In a separate bowl, cream together butter and brown sugar. Stir in eggs and mashed bananas until well blended.',
      'Stir the banana mixture into the flour mixture; stir just to moisten.',
      'Pour batter into prepared loaf pan.',
      'Bake for 60 to 65 minutes, or until a toothpick inserted into the center comes out clean.',
      'Let cool in pan for 10 minutes, then turn out onto a wire rack to cool completely.',
    ],
  },
  {
    title: 'Simple Banana Smoothie',
    description: 'A quick, healthy, and refreshing smoothie to kickstart your day.',
    ingredients: [
      '1 ripe banana, preferably frozen',
      '1/2 cup milk (dairy or non-dairy)',
      '1/4 cup plain yogurt',
      '1 tbsp honey or maple syrup (optional)',
      '1/2 tsp vanilla extract',
    ],
    instructions: [
      'Combine all ingredients in a blender.',
      'Blend on high until smooth and creamy.',
      'Pour into a glass and enjoy immediately.',
    ],
  },
  {
    title: 'Fluffy Banana Pancakes',
    description: 'Light, fluffy pancakes packed with banana flavor. A breakfast favorite!',
    ingredients: [
      '1 1/2 cups all-purpose flour',
      '2 tbsp sugar',
      '2 tsp baking powder',
      '1/2 tsp salt',
      '1 large egg',
      '1 1/4 cups milk',
      '2 tbsp melted butter',
      '1 cup mashed ripe bananas (about 2)',
    ],
    instructions: [
      'In a large bowl, whisk together flour, sugar, baking powder, and salt.',
      'In another bowl, whisk together egg, milk, and melted butter. Pour into dry ingredients and stir until just combined.',
      'Gently fold in the mashed bananas. Do not overmix; a few lumps are okay.',
      'Heat a lightly oiled griddle or frying pan over medium-high heat.',
      'Pour or scoop the batter onto the griddle, using approximately 1/4 cup for each pancake.',
      'Cook for 2-3 minutes per side, until bubbles appear on the surface and the underside is golden brown, then flip.',
      'Serve warm with your favorite toppings like syrup, fresh fruit, or whipped cream.',
    ],
  },
];

export default function RecipeView() {
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(0);

  const toggleRecipe = (index: number) => {
    setExpandedRecipe(expandedRecipe === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-full overflow-y-auto pr-4">
       <div className="text-center mb-8">
            <h2 className="mt-6 text-3xl font-bold text-text-primary">Nano Banana Recipe Collection</h2>
            <p className="mt-2 max-w-2xl mx-auto text-text-secondary">
                Delicious recipes that put your ripe bananas to good use. Click on a recipe to view the details.
            </p>
        </div>
        <div className="space-y-4">
            {recipes.map((recipe, index) => (
                <div key={index} className="bg-base-200 rounded-lg overflow-hidden shadow-lg transition-all duration-300">
                    <button 
                        onClick={() => toggleRecipe(index)}
                        className="w-full p-6 text-left flex justify-between items-center focus:outline-none"
                        aria-expanded={expandedRecipe === index}
                        aria-controls={`recipe-content-${index}`}
                    >
                        <div>
                            <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">{recipe.title}</h3>
                            <p className="text-text-secondary mt-1">{recipe.description}</p>
                        </div>
                        <ChevronDownIcon className={`w-6 h-6 text-text-secondary transform transition-transform duration-300 ${expandedRecipe === index ? 'rotate-180' : ''}`} />
                    </button>
                    <div 
                        id={`recipe-content-${index}`}
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedRecipe === index ? 'max-h-screen' : 'max-h-0'}`}
                    >
                        <div className="px-6 pb-6 grid md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-lg font-semibold text-text-primary mb-3">Ingredients</h4>
                                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                                    {recipe.ingredients.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-text-primary mb-3">Instructions</h4>
                                <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                                    {recipe.instructions.map((item, i) => <li key={i}>{item}</li>)}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
