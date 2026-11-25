import type { Product } from "@/data/product";
import type { Category } from "@/data/category";

const explicitlyWomens = /\b(women(?:'s|s)?|womenswear|woman|ladies|lady|girls?|female)\b/i;
const womensGarments = /\b(dresses?|skirts?|hijabs?|abayas?)\b/i;
const mensAudience = /\b(men(?:'s|s)?|menswear|male|unisex)\b/i;

function isWomensOnlyText(value: string) {
  return explicitlyWomens.test(value) || (womensGarments.test(value) && !/\bdress shirts?\b/i.test(value));
}

export function isMenswearCategory(category: Category) {
  return !isWomensOnlyText(`${category.name} ${category.slug ?? ""}`);
}

export function isMenswearProduct(product: Product, categories: Category[]) {
  const audience = product.audience ?? product.gender;
  if (audience && !mensAudience.test(audience.trim())) return false;
  const category = categories.find(item => item.id === product.category || item.slug === product.category);
  return !isWomensOnlyText(`${product.title} ${product.category} ${category?.name ?? ""} ${category?.slug ?? ""}`);
}
