import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import type { Category } from "@/data/gifts";

interface GiftFiltersProps {
  categories: Category[]; // recebido do Index (que pega do useStore)
  priceMax: number;
  maxPrice: number;
  onPriceChange: (value: number) => void;
  selectedCategories: Category[];
  onCategoryToggle: (cat: Category) => void;
  showCategoryFilter?: boolean;
}

export default function GiftFilters({
  categories,
  priceMax,
  maxPrice,
  onPriceChange,
  selectedCategories,
  onCategoryToggle,
  showCategoryFilter = true,
}: GiftFiltersProps) {
  return (
    <aside className="space-y-8 font-body">
      {/* Filtro de preço */}
      <div>
        <h3 className="font-display text-lg mb-4">Faixa de Preço</h3>
        <Slider
          min={0}
          max={maxPrice}
          step={10}
          value={[priceMax]}
          onValueChange={(v) => onPriceChange(v[0] ?? maxPrice)}
          className="mb-3"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>R$ 0,00</span>
          <span>R$ {priceMax.toFixed(2)}</span>
        </div>
      </div>

      {/* Filtro de categorias */}
      {showCategoryFilter && (
        <div>
          <h3 className="font-display text-lg mb-4">Categorias</h3>
          <div className="space-y-3">
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Checkbox
                  checked={selectedCategories.includes(cat)}
                  onCheckedChange={() => onCategoryToggle(cat)}
                />
                <span className="text-sm">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
