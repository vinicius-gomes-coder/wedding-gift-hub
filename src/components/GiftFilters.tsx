import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORIES, type Category } from "@/data/gifts";

interface GiftFiltersProps {
  priceRange: [number, number];
  maxPrice: number;
  onPriceChange: (value: [number, number]) => void;
  selectedCategories: Category[];
  onCategoryToggle: (cat: Category) => void;
  showCategoryFilter?: boolean;
}

export default function GiftFilters({
  priceRange,
  maxPrice,
  onPriceChange,
  selectedCategories,
  onCategoryToggle,
  showCategoryFilter = true,
}: GiftFiltersProps) {
  return (
    <aside className="space-y-8 font-body">
      {/* Price Filter */}
      <div>
        <h3 className="font-display text-lg mb-4">Faixa de Preço</h3>
        <Slider
          min={0}
          max={maxPrice}
          step={10}
          value={[priceRange[1]]}
          onValueChange={(v) => onPriceChange([0, v[0]])}
          className="mb-3"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>R$ 0,00</span>
          <span>R$ {priceRange[1].toFixed(2)}</span>
        </div>
      </div>

      {/* Category Filter */}
      {showCategoryFilter && (
        <div>
          <h3 className="font-display text-lg mb-4">Categorias</h3>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer">
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
