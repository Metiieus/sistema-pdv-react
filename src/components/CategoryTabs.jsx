import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CategoryTabs = ({ categorias, categoriaAtiva, onCategoriaChange }) => {
  const getCategoryClass = (categoria) => {
    const categoryMap = {
      'Homeware': 'category-homeware',
      'Bedding': 'category-bedding',
      'Skincare': 'category-skincare',
      'Fashion': 'category-fashion',
      'Towels': 'category-towels'
    };
    
    return categoryMap[categoria] || 'bg-gray-100';
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Botão "Todos" */}
      <Button
        variant={categoriaAtiva === null ? "default" : "outline"}
        onClick={() => onCategoriaChange(null)}
        className="h-12 px-6"
      >
        Todos
      </Button>

      {/* Botões das Categorias */}
      {categorias.map((categoria) => (
        <Button
          key={categoria.id}
          variant={categoriaAtiva === categoria.id ? "default" : "outline"}
          onClick={() => onCategoriaChange(categoria.id)}
          className={`h-12 px-6 ${
            categoriaAtiva === categoria.id 
              ? getCategoryClass(categoria.nome) + ' text-gray-800 border-0' 
              : 'hover:' + getCategoryClass(categoria.nome) + ' hover:text-gray-800'
          }`}
        >
          {categoria.nome}
        </Button>
      ))}
    </div>
  );
};

export default CategoryTabs;

