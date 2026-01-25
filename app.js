const { useState, useEffect, useMemo, useRef, createElement: h } = React;

// Helpers
const e = (tag, props, ...children) => h(tag, props, ...children.flat());

// Data
const DEFAULT_AISLES = [
  { id: 'fruits-legumes', name: 'Fruits & Légumes', color: '#4ade80' },
  { id: 'boucherie', name: 'Boucherie / Poissonnerie', color: '#f87171' },
  { id: 'cremerie', name: 'Crèmerie', color: '#fbbf24' },
  { id: 'epicerie', name: 'Épicerie', color: '#a78bfa' },
  { id: 'surgeles', name: 'Surgelés', color: '#60a5fa' },
  { id: 'boissons', name: 'Boissons', color: '#2dd4bf' },
  { id: 'pain', name: 'Pain / Pâtisserie', color: '#f59e0b' },
  { id: 'hygiene', name: 'Hygiène', color: '#ec4899' },
  { id: 'autres', name: 'Autres', color: '#94a3b8' },
];

const DEFAULT_INGREDIENTS = [
  { id: 'tomates', name: 'Tomates', aisleId: 'fruits-legumes' },
  { id: 'oignons', name: 'Oignons', aisleId: 'fruits-legumes' },
  { id: 'ail', name: 'Ail', aisleId: 'fruits-legumes' },
  { id: 'carottes', name: 'Carottes', aisleId: 'fruits-legumes' },
  { id: 'pommes-de-terre', name: 'Pommes de terre', aisleId: 'fruits-legumes' },
  { id: 'poulet', name: 'Poulet', aisleId: 'boucherie' },
  { id: 'boeuf-hache', name: 'Bœuf haché', aisleId: 'boucherie' },
  { id: 'lardons', name: 'Lardons', aisleId: 'boucherie' },
  { id: 'oeufs', name: 'Œufs', aisleId: 'cremerie' },
  { id: 'beurre', name: 'Beurre', aisleId: 'cremerie' },
  { id: 'lait', name: 'Lait', aisleId: 'cremerie' },
  { id: 'creme-fraiche', name: 'Crème fraîche', aisleId: 'cremerie' },
  { id: 'fromage-rape', name: 'Fromage râpé', aisleId: 'cremerie' },
  { id: 'pates', name: 'Pâtes', aisleId: 'epicerie' },
  { id: 'riz', name: 'Riz', aisleId: 'epicerie' },
  { id: 'huile-olive', name: "Huile d'olive", aisleId: 'epicerie' },
  { id: 'sel', name: 'Sel', aisleId: 'epicerie' },
  { id: 'poivre', name: 'Poivre', aisleId: 'epicerie' },
];

const STORAGE_KEYS = {
  aisles: 'mescourses_aisles',
  ingredients: 'mescourses_ingredients',
  recipes: 'mescourses_recipes',
  recurringProducts: 'mescourses_recurring',
  productGroups: 'mescourses_groups',
  currentList: 'mescourses_currentlist'
};

const generateId = () => Math.random().toString(36).substr(2, 9);
const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch { return defaultValue; }
};
const saveToStorage = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (err) { console.error('Erreur:', err); }
};

// Icons as SVG strings
const Icons = {
  recipes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
  ingredients: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  recurring: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  drag: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>',
};

const icon = (name) => e('span', { className: 'icon', dangerouslySetInnerHTML: { __html: Icons[name] } });

// Components
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Supprimer" }) {
  if (!isOpen) return null;
  return e('div', { className: 'modal-overlay', onClick: onClose },
    e('div', { className: 'modal-content modal-small', onClick: ev => ev.stopPropagation() },
      e('div', { className: 'modal-header' }, e('h2', null, title)),
      e('div', { className: 'modal-body' },
        e('p', null, message),
        e('div', { className: 'modal-actions' },
          e('button', { className: 'btn btn-secondary', onClick: onClose }, 'Annuler'),
          e('button', { className: 'btn btn-danger', onClick: onConfirm }, confirmText)
        )
      )
    )
  );
}

function Toast({ message, isVisible }) {
  return e('div', { className: `toast ${isVisible ? 'visible' : ''}` }, message);
}

// RecipesTab
function RecipesTab({ recipes, setRecipes, ingredients, aisles }) {
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSave = (recipe) => {
    if (recipe.id) {
      setRecipes(recipes.map(r => r.id === recipe.id ? recipe : r));
    } else {
      setRecipes([...recipes, { ...recipe, id: generateId() }]);
    }
    setShowForm(false);
    setEditingRecipe(null);
  };

  const handleDelete = (id) => {
    setRecipes(recipes.filter(r => r.id !== id));
    setDeleteConfirm(null);
  };

  if (showForm) {
    return RecipeForm({ recipe: editingRecipe, ingredients, aisles, onSave: handleSave, onCancel: () => { setShowForm(false); setEditingRecipe(null); } });
  }

  return e('div', { className: 'tab-content' },
    e('div', { className: 'tab-header' },
      e('h1', null, 'Mes Recettes'),
      e('button', { className: 'btn btn-primary btn-with-icon', onClick: () => setShowForm(true) }, icon('plus'), e('span', null, 'Ajouter'))
    ),
    recipes.length === 0
      ? e('div', { className: 'empty-state' },
          e('div', { className: 'empty-icon' }, icon('recipes')),
          e('p', null, 'Aucune recette pour le moment'),
          e('button', { className: 'btn btn-primary', onClick: () => setShowForm(true) }, 'Créer ma première recette')
        )
      : e('div', { className: 'recipes-grid' },
          recipes.map(recipe =>
            e('div', { key: recipe.id, className: 'recipe-card' },
              e('div', { className: 'recipe-image' },
                recipe.image
                  ? e('img', { src: recipe.image, alt: recipe.name })
                  : e('div', { className: 'recipe-image-placeholder' }, icon('image'))
              ),
              e('div', { className: 'recipe-info' },
                e('h3', null, recipe.name),
                e('p', { className: 'recipe-ingredients-count' }, `${recipe.ingredientIds.length} ingrédient${recipe.ingredientIds.length > 1 ? 's' : ''}`)
              ),
              e('div', { className: 'recipe-actions' },
                e('button', { className: 'btn-icon', onClick: () => { setEditingRecipe(recipe); setShowForm(true); } }, icon('edit')),
                e('button', { className: 'btn-icon btn-icon-danger', onClick: () => setDeleteConfirm(recipe.id) }, icon('trash'))
              )
            )
          )
        ),
    ConfirmDialog({ isOpen: deleteConfirm !== null, onClose: () => setDeleteConfirm(null), onConfirm: () => handleDelete(deleteConfirm), title: "Supprimer la recette", message: "Êtes-vous sûr de vouloir supprimer cette recette ?" })
  );
}

function RecipeForm({ recipe, ingredients, aisles, onSave, onCancel }) {
  const [name, setName] = useState(recipe?.name || '');
  const [image, setImage] = useState(recipe?.image || '');
  const [selectedIngredients, setSelectedIngredients] = useState(recipe?.ingredientIds || []);
  const [searchTerm, setSearchTerm] = useState('');

  const handleImageChange = (ev) => {
    const file = ev.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleIngredient = (id) => {
    setSelectedIngredients(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredIngredients = ingredients.filter(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const groupedIngredients = useMemo(() => {
    const groups = {};
    filteredIngredients.forEach(ing => {
      const aisle = aisles.find(a => a.id === ing.aisleId);
      const aisleName = aisle ? aisle.name : 'Autres';
      if (!groups[aisleName]) groups[aisleName] = [];
      groups[aisleName].push(ing);
    });
    return groups;
  }, [filteredIngredients, aisles]);

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!name.trim()) return;
    onSave({ id: recipe?.id, name: name.trim(), image, ingredientIds: selectedIngredients });
  };

  return e('div', { className: 'form-page' },
    e('div', { className: 'form-header' },
      e('button', { className: 'btn-icon', onClick: onCancel }, icon('back')),
      e('h1', null, recipe ? 'Modifier la recette' : 'Nouvelle recette')
    ),
    e('form', { onSubmit: handleSubmit },
      e('div', { className: 'form-group' },
        e('label', null, 'Nom de la recette'),
        e('input', { type: 'text', value: name, onChange: ev => setName(ev.target.value), placeholder: 'Ex: Pâtes carbonara', required: true })
      ),
      e('div', { className: 'form-group' },
        e('label', null, 'Photo'),
        e('div', { className: 'image-upload' },
          image
            ? e('div', { className: 'image-preview' },
                e('img', { src: image, alt: 'Aperçu' }),
                e('button', { type: 'button', className: 'btn-remove-image', onClick: () => setImage('') }, icon('close'))
              )
            : e('label', { className: 'image-upload-placeholder' },
                icon('image'),
                e('span', null, 'Ajouter une photo'),
                e('input', { type: 'file', accept: 'image/*', onChange: handleImageChange })
              )
        )
      ),
      e('div', { className: 'form-group' },
        e('label', null, `Ingrédients (${selectedIngredients.length} sélectionné${selectedIngredients.length > 1 ? 's' : ''})`),
        e('input', { type: 'text', value: searchTerm, onChange: ev => setSearchTerm(ev.target.value), placeholder: 'Rechercher un ingrédient...', className: 'search-input' }),
        e('div', { className: 'ingredients-selector' },
          Object.entries(groupedIngredients).map(([aisleName, items]) =>
            e('div', { key: aisleName, className: 'ingredient-group' },
              e('h4', null, aisleName),
              e('div', { className: 'ingredient-chips' },
                items.map(ing =>
                  e('button', {
                    key: ing.id,
                    type: 'button',
                    className: `chip ${selectedIngredients.includes(ing.id) ? 'selected' : ''}`,
                    onClick: () => toggleIngredient(ing.id)
                  },
                    ing.name,
                    selectedIngredients.includes(ing.id) && e('span', { className: 'chip-check' }, icon('check'))
                  )
                )
              )
            )
          )
        )
      ),
      e('div', { className: 'form-actions' },
        e('button', { type: 'button', className: 'btn btn-secondary', onClick: onCancel }, 'Annuler'),
        e('button', { type: 'submit', className: 'btn btn-primary', disabled: !name.trim() }, recipe ? 'Enregistrer' : 'Créer')
      )
    )
  );
}

// IngredientsTab
function IngredientsTab({ ingredients, setIngredients, aisles, setAisles }) {
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAisleManager, setShowAisleManager] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIngredients = ingredients.filter(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const groupedIngredients = useMemo(() => {
    const groups = {};
    aisles.forEach(aisle => {
      groups[aisle.id] = { aisle, items: filteredIngredients.filter(ing => ing.aisleId === aisle.id) };
    });
    return groups;
  }, [filteredIngredients, aisles]);

  const handleSave = (ingredient) => {
    if (ingredient.id) {
      setIngredients(ingredients.map(i => i.id === ingredient.id ? ingredient : i));
    } else {
      setIngredients([...ingredients, { ...ingredient, id: generateId() }]);
    }
    setShowForm(false);
    setEditingIngredient(null);
  };

  const handleDelete = (id) => {
    setIngredients(ingredients.filter(i => i.id !== id));
    setDeleteConfirm(null);
  };

  if (showAisleManager) {
    return AisleManager({ aisles, setAisles, ingredients, onBack: () => setShowAisleManager(false) });
  }

  if (showForm) {
    return IngredientForm({ ingredient: editingIngredient, aisles, onSave: handleSave, onCancel: () => { setShowForm(false); setEditingIngredient(null); } });
  }

  return e('div', { className: 'tab-content' },
    e('div', { className: 'tab-header' },
      e('h1', null, 'Ingrédients'),
      e('div', { className: 'header-actions' },
        e('button', { className: 'btn btn-secondary btn-with-icon', onClick: () => setShowAisleManager(true) }, icon('settings'), e('span', null, 'Rayons')),
        e('button', { className: 'btn btn-primary btn-with-icon', onClick: () => setShowForm(true) }, icon('plus'), e('span', null, 'Ajouter'))
      )
    ),
    e('input', { type: 'text', value: searchTerm, onChange: ev => setSearchTerm(ev.target.value), placeholder: 'Rechercher un ingrédient...', className: 'search-input' }),
    ingredients.length === 0
      ? e('div', { className: 'empty-state' },
          e('div', { className: 'empty-icon' }, icon('ingredients')),
          e('p', null, 'Aucun ingrédient'),
          e('button', { className: 'btn btn-primary', onClick: () => setShowForm(true) }, 'Ajouter un ingrédient')
        )
      : e('div', { className: 'ingredients-list' },
          Object.entries(groupedIngredients).map(([aisleId, { aisle, items }]) => {
            if (items.length === 0) return null;
            return e('div', { key: aisleId, className: 'aisle-section' },
              e('div', { className: 'aisle-header', style: { '--aisle-color': aisle.color } },
                e('span', { className: 'aisle-dot' }),
                e('h3', null, aisle.name),
                e('span', { className: 'aisle-count' }, items.length)
              ),
              e('div', { className: 'aisle-items' },
                items.map(ingredient =>
                  e('div', { key: ingredient.id, className: 'ingredient-item' },
                    e('span', null, ingredient.name),
                    e('div', { className: 'item-actions' },
                      e('button', { className: 'btn-icon-small', onClick: () => { setEditingIngredient(ingredient); setShowForm(true); } }, icon('edit')),
                      e('button', { className: 'btn-icon-small btn-icon-danger', onClick: () => setDeleteConfirm(ingredient.id) }, icon('trash'))
                    )
                  )
                )
              )
            );
          })
        ),
    ConfirmDialog({ isOpen: deleteConfirm !== null, onClose: () => setDeleteConfirm(null), onConfirm: () => handleDelete(deleteConfirm), title: "Supprimer l'ingrédient", message: "Êtes-vous sûr de vouloir supprimer cet ingrédient ?" })
  );
}

function IngredientForm({ ingredient, aisles, onSave, onCancel }) {
  const [name, setName] = useState(ingredient?.name || '');
  const [aisleId, setAisleId] = useState(ingredient?.aisleId || aisles[0]?.id || '');

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!name.trim() || !aisleId) return;
    onSave({ id: ingredient?.id, name: name.trim(), aisleId });
  };

  return e('div', { className: 'form-page' },
    e('div', { className: 'form-header' },
      e('button', { className: 'btn-icon', onClick: onCancel }, icon('back')),
      e('h1', null, ingredient ? "Modifier l'ingrédient" : 'Nouvel ingrédient')
    ),
    e('form', { onSubmit: handleSubmit },
      e('div', { className: 'form-group' },
        e('label', null, 'Nom'),
        e('input', { type: 'text', value: name, onChange: ev => setName(ev.target.value), placeholder: 'Ex: Tomates cerises', required: true })
      ),
      e('div', { className: 'form-group' },
        e('label', null, 'Rayon'),
        e('select', { value: aisleId, onChange: ev => setAisleId(ev.target.value), required: true },
          aisles.map(aisle => e('option', { key: aisle.id, value: aisle.id }, aisle.name))
        )
      ),
      e('div', { className: 'form-actions' },
        e('button', { type: 'button', className: 'btn btn-secondary', onClick: onCancel }, 'Annuler'),
        e('button', { type: 'submit', className: 'btn btn-primary', disabled: !name.trim() || !aisleId }, ingredient ? 'Enregistrer' : 'Créer')
      )
    )
  );
}

function AisleManager({ aisles, setAisles, ingredients, onBack }) {
  const [editingAisle, setEditingAisle] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const getIngredientCount = (aisleId) => ingredients.filter(i => i.aisleId === aisleId).length;

  const handleSave = (aisle) => {
    if (aisle.id) {
      setAisles(aisles.map(a => a.id === aisle.id ? aisle : a));
    } else {
      setAisles([...aisles, { ...aisle, id: generateId() }]);
    }
    setShowForm(false);
    setEditingAisle(null);
  };

  const handleDelete = (id) => {
    setAisles(aisles.filter(a => a.id !== id));
    setDeleteConfirm(null);
  };

  if (showForm) {
    return AisleForm({ aisle: editingAisle, onSave: handleSave, onCancel: () => { setShowForm(false); setEditingAisle(null); } });
  }

  return e('div', { className: 'form-page' },
    e('div', { className: 'form-header' },
      e('button', { className: 'btn-icon', onClick: onBack }, icon('back')),
      e('h1', null, 'Gérer les rayons'),
      e('button', { className: 'btn btn-primary btn-with-icon', onClick: () => setShowForm(true) }, icon('plus'))
    ),
    e('div', { className: 'aisles-list' },
      aisles.map(aisle =>
        e('div', { key: aisle.id, className: 'aisle-manager-item', style: { '--aisle-color': aisle.color } },
          e('div', { className: 'aisle-manager-info' },
            e('span', { className: 'aisle-dot' }),
            e('span', { className: 'aisle-name' }, aisle.name),
            e('span', { className: 'aisle-count' }, `${getIngredientCount(aisle.id)} ingrédients`)
          ),
          e('div', { className: 'item-actions' },
            e('button', { className: 'btn-icon-small', onClick: () => { setEditingAisle(aisle); setShowForm(true); } }, icon('edit')),
            e('button', { className: 'btn-icon-small btn-icon-danger', onClick: () => setDeleteConfirm(aisle.id), disabled: getIngredientCount(aisle.id) > 0 }, icon('trash'))
          )
        )
      )
    ),
    ConfirmDialog({ isOpen: deleteConfirm !== null, onClose: () => setDeleteConfirm(null), onConfirm: () => handleDelete(deleteConfirm), title: "Supprimer le rayon", message: "Êtes-vous sûr de vouloir supprimer ce rayon ?" })
  );
}

function AisleForm({ aisle, onSave, onCancel }) {
  const [name, setName] = useState(aisle?.name || '');
  const [color, setColor] = useState(aisle?.color || '#60a5fa');
  const colors = ['#4ade80', '#f87171', '#fbbf24', '#a78bfa', '#60a5fa', '#2dd4bf', '#f59e0b', '#ec4899', '#94a3b8', '#8b5cf6'];

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!name.trim()) return;
    onSave({ id: aisle?.id, name: name.trim(), color });
  };

  return e('div', { className: 'form-page' },
    e('div', { className: 'form-header' },
      e('button', { className: 'btn-icon', onClick: onCancel }, icon('back')),
      e('h1', null, aisle ? 'Modifier le rayon' : 'Nouveau rayon')
    ),
    e('form', { onSubmit: handleSubmit },
      e('div', { className: 'form-group' },
        e('label', null, 'Nom du rayon'),
        e('input', { type: 'text', value: name, onChange: ev => setName(ev.target.value), placeholder: 'Ex: Fruits & Légumes', required: true })
      ),
      e('div', { className: 'form-group' },
        e('label', null, 'Couleur'),
        e('div', { className: 'color-picker' },
          colors.map(c =>
            e('button', {
              key: c,
              type: 'button',
              className: `color-option ${color === c ? 'selected' : ''}`,
              style: { backgroundColor: c },
              onClick: () => setColor(c)
            })
          )
        )
      ),
      e('div', { className: 'form-actions' },
        e('button', { type: 'button', className: 'btn btn-secondary', onClick: onCancel }, 'Annuler'),
        e('button', { type: 'submit', className: 'btn btn-primary', disabled: !name.trim() }, aisle ? 'Enregistrer' : 'Créer')
      )
    )
  );
}

// RecurringTab
function RecurringTab({ recurringProducts, setRecurringProducts, productGroups, setProductGroups }) {
  const [showProductForm, setShowProductForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  const groupedProducts = useMemo(() => {
    const groups = { ungrouped: [] };
    productGroups.forEach(g => { groups[g.id] = []; });
    recurringProducts.forEach(product => {
      if (product.groupId && groups[product.groupId]) {
        groups[product.groupId].push(product);
      } else {
        groups.ungrouped.push(product);
      }
    });
    return groups;
  }, [recurringProducts, productGroups]);

  const handleSaveProduct = (product) => {
    if (product.id) {
      setRecurringProducts(recurringProducts.map(p => p.id === product.id ? product : p));
    } else {
      setRecurringProducts([...recurringProducts, { ...product, id: generateId() }]);
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleSaveGroup = (group) => {
    if (group.id) {
      setProductGroups(productGroups.map(g => g.id === group.id ? group : g));
    } else {
      setProductGroups([...productGroups, { ...group, id: generateId() }]);
    }
    setShowGroupForm(false);
    setEditingGroup(null);
  };

  const handleDelete = () => {
    if (deleteType === 'product') {
      setRecurringProducts(recurringProducts.filter(p => p.id !== deleteConfirm));
    } else if (deleteType === 'group') {
      setRecurringProducts(recurringProducts.map(p => p.groupId === deleteConfirm ? { ...p, groupId: null } : p));
      setProductGroups(productGroups.filter(g => g.id !== deleteConfirm));
    }
    setDeleteConfirm(null);
    setDeleteType(null);
  };

  if (showProductForm) {
    return ProductForm({ product: editingProduct, groups: productGroups, onSave: handleSaveProduct, onCancel: () => { setShowProductForm(false); setEditingProduct(null); } });
  }

  if (showGroupForm) {
    return GroupForm({ group: editingGroup, onSave: handleSaveGroup, onCancel: () => { setShowGroupForm(false); setEditingGroup(null); } });
  }

  return e('div', { className: 'tab-content' },
    e('div', { className: 'tab-header' },
      e('h1', null, 'Récurrents'),
      e('div', { className: 'header-actions' },
        e('button', { className: 'btn btn-secondary btn-with-icon', onClick: () => setShowGroupForm(true) }, icon('plus'), e('span', null, 'Groupe')),
        e('button', { className: 'btn btn-primary btn-with-icon', onClick: () => setShowProductForm(true) }, icon('plus'), e('span', null, 'Produit'))
      )
    ),
    recurringProducts.length === 0
      ? e('div', { className: 'empty-state' },
          e('div', { className: 'empty-icon' }, icon('recurring')),
          e('p', null, 'Aucun produit récurrent'),
          e('p', { className: 'empty-hint' }, 'Ces produits seront suggérés lors de la génération de votre liste.'),
          e('button', { className: 'btn btn-primary', onClick: () => setShowProductForm(true) }, 'Ajouter un produit')
        )
      : e('div', { className: 'products-list' },
          productGroups.map(group => {
            const products = groupedProducts[group.id] || [];
            if (products.length === 0) return null;
            return e('div', { key: group.id, className: 'product-group' },
              e('div', { className: 'group-header' },
                e('div', { className: 'drag-handle' }, icon('drag')),
                e('h3', null, group.name),
                e('div', { className: 'item-actions' },
                  e('button', { className: 'btn-icon-small', onClick: () => { setEditingGroup(group); setShowGroupForm(true); } }, icon('edit')),
                  e('button', { className: 'btn-icon-small btn-icon-danger', onClick: () => { setDeleteConfirm(group.id); setDeleteType('group'); } }, icon('trash'))
                )
              ),
              e('div', { className: 'group-items' },
                products.map(product =>
                  e('div', { key: product.id, className: 'product-item' },
                    e('span', null, product.name),
                    e('div', { className: 'item-actions' },
                      e('button', { className: 'btn-icon-small', onClick: () => { setEditingProduct(product); setShowProductForm(true); } }, icon('edit')),
                      e('button', { className: 'btn-icon-small btn-icon-danger', onClick: () => { setDeleteConfirm(product.id); setDeleteType('product'); } }, icon('trash'))
                    )
                  )
                )
              )
            );
          }),
          groupedProducts.ungrouped.length > 0 && e('div', { className: 'product-group' },
            e('div', { className: 'group-header' }, e('h3', null, 'Sans groupe')),
            e('div', { className: 'group-items' },
              groupedProducts.ungrouped.map(product =>
                e('div', { key: product.id, className: 'product-item' },
                  e('span', null, product.name),
                  e('div', { className: 'item-actions' },
                    e('button', { className: 'btn-icon-small', onClick: () => { setEditingProduct(product); setShowProductForm(true); } }, icon('edit')),
                    e('button', { className: 'btn-icon-small btn-icon-danger', onClick: () => { setDeleteConfirm(product.id); setDeleteType('product'); } }, icon('trash'))
                  )
                )
              )
            )
          )
        ),
    ConfirmDialog({
      isOpen: deleteConfirm !== null,
      onClose: () => { setDeleteConfirm(null); setDeleteType(null); },
      onConfirm: handleDelete,
      title: deleteType === 'group' ? 'Supprimer le groupe' : 'Supprimer le produit',
      message: deleteType === 'group' ? 'Les produits de ce groupe seront conservés sans groupe.' : 'Êtes-vous sûr de vouloir supprimer ce produit ?'
    })
  );
}

function ProductForm({ product, groups, onSave, onCancel }) {
  const [name, setName] = useState(product?.name || '');
  const [groupId, setGroupId] = useState(product?.groupId || '');

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!name.trim()) return;
    onSave({ id: product?.id, name: name.trim(), groupId: groupId || null });
  };

  return e('div', { className: 'form-page' },
    e('div', { className: 'form-header' },
      e('button', { className: 'btn-icon', onClick: onCancel }, icon('back')),
      e('h1', null, product ? 'Modifier le produit' : 'Nouveau produit')
    ),
    e('form', { onSubmit: handleSubmit },
      e('div', { className: 'form-group' },
        e('label', null, 'Nom'),
        e('input', { type: 'text', value: name, onChange: ev => setName(ev.target.value), placeholder: 'Ex: Papier toilette', required: true })
      ),
      e('div', { className: 'form-group' },
        e('label', null, 'Groupe (optionnel)'),
        e('select', { value: groupId, onChange: ev => setGroupId(ev.target.value) },
          e('option', { value: '' }, 'Sans groupe'),
          groups.map(group => e('option', { key: group.id, value: group.id }, group.name))
        )
      ),
      e('div', { className: 'form-actions' },
        e('button', { type: 'button', className: 'btn btn-secondary', onClick: onCancel }, 'Annuler'),
        e('button', { type: 'submit', className: 'btn btn-primary', disabled: !name.trim() }, product ? 'Enregistrer' : 'Créer')
      )
    )
  );
}

function GroupForm({ group, onSave, onCancel }) {
  const [name, setName] = useState(group?.name || '');

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!name.trim()) return;
    onSave({ id: group?.id, name: name.trim() });
  };

  return e('div', { className: 'form-page' },
    e('div', { className: 'form-header' },
      e('button', { className: 'btn-icon', onClick: onCancel }, icon('back')),
      e('h1', null, group ? 'Modifier le groupe' : 'Nouveau groupe')
    ),
    e('form', { onSubmit: handleSubmit },
      e('div', { className: 'form-group' },
        e('label', null, 'Nom du groupe'),
        e('input', { type: 'text', value: name, onChange: ev => setName(ev.target.value), placeholder: 'Ex: Entretien', required: true })
      ),
      e('div', { className: 'form-actions' },
        e('button', { type: 'button', className: 'btn btn-secondary', onClick: onCancel }, 'Annuler'),
        e('button', { type: 'submit', className: 'btn btn-primary', disabled: !name.trim() }, group ? 'Enregistrer' : 'Créer')
      )
    )
  );
}
      ),
      shoppingList.recurring.length > 0 && e('div', { className: 'shopping-aisle' },
        e('div', { className: 'shopping-aisle-header', style: { '--aisle-color': '#6366f1' } },
          e('span', { className: 'aisle-dot' }),
          e('h3', null, 'Autres produits')
        ),
        e('div', { className: 'shopping-items' },
          shoppingList.recurring.map(product =>
            e('label', { key: product.id, className: `shopping-item ${checkedItems[`rec-${product.id}`] ? 'checked' : ''}` },
              e('input', { type: 'checkbox', checked: checkedItems[`rec-${product.id}`] || false, onChange: () => toggleChecked(`rec-${product.id}`) }),
              e('span', { className: 'checkbox-custom' }),
              e('span', { className: 'item-name' }, product.name)
            )
          )
        )
      ),
      selectedRecipeNames.length > 0 && e('div', { className: 'recipes-summary' },
        e('h4', null, '📋 Recettes prévues'),
        e('ul', null, selectedRecipeNames.map((name, i) => e('li', { key: i }, name)))
      ),
      e('div', { className: 'list-actions' },
        e('button', { className: 'btn btn-outline-danger btn-large', onClick: () => setConfirmClear(true) }, icon('trash'), e('span', null, 'Vider la liste'))
      )
    ),
    ConfirmDialog({ isOpen: confirmClear, onClose: () => setConfirmClear(false), onConfirm: clearList, title: "Vider la liste", message: "Voulez-vous vraiment vider la liste de courses actuelle ?", confirmText: "Vider" }),
    Toast({ message: toast.message, isVisible: toast.visible })
  );
}

// SettingsTab
function SettingsTab({ aisles, setAisles, ingredients, setIngredients, recipes, setRecipes, recurringProducts, setRecurringProducts, productGroups, setProductGroups }) {
  const [toast, setToast] = useState({ visible: false, message: '' });
  const fileInputRef = useRef(null);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  const exportData = () => {
    const data = { version: 1, exportDate: new Date().toISOString(), aisles, ingredients, recipes, recurringProducts, productGroups };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mes-courses-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Données exportées !');
  };

  const importData = (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.aisles) setAisles(data.aisles);
        if (data.ingredients) setIngredients(data.ingredients);
        if (data.recipes) setRecipes(data.recipes);
        if (data.recurringProducts) setRecurringProducts(data.recurringProducts);
        if (data.productGroups) setProductGroups(data.productGroups);
        showToast('Données importées !');
      } catch (err) {
        showToast('Erreur: fichier invalide');
      }
    };
    reader.readAsText(file);
    ev.target.value = '';
  };

  return e('div', { className: 'tab-content' },
    e('div', { className: 'tab-header' }, e('h1', null, 'Paramètres')),
    e('div', { className: 'settings-section' },
      e('div', { className: 'settings-section-header' }, e('h3', null, '📊 Statistiques')),
      e('div', { className: 'settings-section-body' },
        e('div', { className: 'settings-stats' },
          e('div', { className: 'stat-card' }, e('div', { className: 'stat-value' }, recipes.length), e('div', { className: 'stat-label' }, 'Recettes')),
          e('div', { className: 'stat-card' }, e('div', { className: 'stat-value' }, ingredients.length), e('div', { className: 'stat-label' }, 'Ingrédients')),
          e('div', { className: 'stat-card' }, e('div', { className: 'stat-value' }, recurringProducts.length), e('div', { className: 'stat-label' }, 'Produits récurrents')),
          e('div', { className: 'stat-card' }, e('div', { className: 'stat-value' }, aisles.length), e('div', { className: 'stat-label' }, 'Rayons'))
        )
      )
    ),
    e('div', { className: 'settings-section' },
      e('div', { className: 'settings-section-header' }, e('h3', null, '💾 Sauvegarde')),
      e('div', { className: 'settings-section-body' },
        e('p', null, 'Exportez vos données pour les sauvegarder ou les transférer sur un autre appareil.'),
        e('div', { className: 'settings-buttons' },
          e('button', { className: 'btn btn-primary btn-large', onClick: exportData }, icon('download'), e('span', null, 'Exporter mes données')),
          e('label', { className: 'import-label' },
            icon('upload'),
            e('span', null, 'Importer des données'),
            e('input', { type: 'file', accept: '.json', onChange: importData, className: 'file-input-hidden', ref: fileInputRef })
          )
        )
      )
    ),
    Toast({ message: toast.message, isVisible: toast.visible })
  );
}

// Main App
function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [aisles, setAisles] = useState(() => loadFromStorage(STORAGE_KEYS.aisles, DEFAULT_AISLES));
  const [ingredients, setIngredients] = useState(() => loadFromStorage(STORAGE_KEYS.ingredients, DEFAULT_INGREDIENTS));
  const [recipes, setRecipes] = useState(() => loadFromStorage(STORAGE_KEYS.recipes, []));
  const [recurringProducts, setRecurringProducts] = useState(() => loadFromStorage(STORAGE_KEYS.recurringProducts, []));
  const [productGroups, setProductGroups] = useState(() => loadFromStorage(STORAGE_KEYS.productGroups, []));

  useEffect(() => { saveToStorage(STORAGE_KEYS.aisles, aisles); }, [aisles]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.ingredients, ingredients); }, [ingredients]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.recipes, recipes); }, [recipes]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.recurringProducts, recurringProducts); }, [recurringProducts]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.productGroups, productGroups); }, [productGroups]);

  const tabs = [
    { id: 'recipes', label: 'Recettes', iconName: 'recipes' },
    { id: 'ingredients', label: 'Ingrédients', iconName: 'ingredients' },
    { id: 'recurring', label: 'Récurrents', iconName: 'recurring' },
    { id: 'list', label: 'Liste', iconName: 'list', primary: true },
    { id: 'settings', label: 'Réglages', iconName: 'settings' },
  ];

  let content = null;
  if (activeTab === 'recipes') content = RecipesTab({ recipes, setRecipes, ingredients, aisles });
  if (activeTab === 'ingredients') content = IngredientsTab({ ingredients, setIngredients, aisles, setAisles });
  if (activeTab === 'recurring') content = RecurringTab({ recurringProducts, setRecurringProducts, productGroups, setProductGroups });
  if (activeTab === 'list') content = ShoppingListTab({ recipes, ingredients, aisles, recurringProducts, productGroups });
  if (activeTab === 'settings') content = SettingsTab({ aisles, setAisles, ingredients, setIngredients, recipes, setRecipes, recurringProducts, setRecurringProducts, productGroups, setProductGroups });

  return e('div', { className: 'app' },
    e('main', { className: 'app-main' }, content),
    e('nav', { className: 'bottom-nav' },
      tabs.map(tab =>
        e('button', {
          key: tab.id,
          className: `nav-item ${activeTab === tab.id ? 'active' : ''} ${tab.primary ? 'nav-primary' : ''}`,
          onClick: () => setActiveTab(tab.id)
        },
          e('span', { className: 'nav-icon' }, icon(tab.iconName)),
          e('span', { className: 'nav-label' }, tab.label)
        )
      )
    )
  );
}

// Mount
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
