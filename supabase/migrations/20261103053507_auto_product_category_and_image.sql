/*
# Automatic product category and image by name, with manual override

1. Changes to `products`
- `category_source` (text, 'auto' or 'manual', default 'auto'): whether the category is chosen by the system from the product name, or set by staff.
- `image_source` (text, 'auto', 'manual' or 'none', default 'auto'): whether the image is a built-in picture chosen by name, an image uploaded by staff, or intentionally removed (placeholder).

2. Automation
- Functions `product_auto_category(name)` and `product_auto_image(name)` map Persian product names to a category key and a stock picture.
- Trigger `products_apply_auto_fields` runs on insert and when name, category_source or image_source changes. It only recalculates a value when its source is 'auto'. Manual categories and manual or removed images are never overwritten.
- Existing products are recalculated once with the same rule.

3. Security
- No new tables. No policy or grant changes. Helper functions are read-only and unprivileged.

4. Notes
- No data is deleted or renamed. Prices, stock and names are untouched.
- Products with no matching keyword keep an empty category and show the placeholder image.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS category_source text NOT NULL DEFAULT 'auto';
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_source_check;
ALTER TABLE products ADD CONSTRAINT products_category_source_check CHECK (category_source IN ('auto', 'manual'));

ALTER TABLE products ADD COLUMN IF NOT EXISTS image_source text NOT NULL DEFAULT 'auto';
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_image_source_check;
ALTER TABLE products ADD CONSTRAINT products_image_source_check CHECK (image_source IN ('auto', 'manual', 'none'));

CREATE OR REPLACE FUNCTION product_auto_category(p_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN n LIKE '%بستنی%' THEN 'ice-cream'
    WHEN n LIKE '%بیسکویت%' OR n LIKE '%کیک%' OR n LIKE '%چیپس%' OR n LIKE '%پفک%'
      OR n LIKE '%کراکر%' OR n LIKE '%تخمه%' OR n LIKE '%آجیل%' OR n LIKE '%شکلات%'
      OR n LIKE '%وافل%' OR n LIKE '%کلوچه%' THEN 'snacks'
    WHEN n LIKE '%نوشابه%' OR n LIKE '%کوکاکولا%' OR n LIKE '%کولا%' OR n LIKE '%فانتا%'
      OR n LIKE '%آب معدنی%' OR n ~ '(^|\s)آب(\s|$)' OR n LIKE '%انرژی%'
      OR n LIKE '%دوغ%' OR n LIKE '%چای%' OR n LIKE '%شربت%' OR n LIKE '%نوشیدنی%' THEN 'drinks'
    WHEN n LIKE '%شیر%' OR n LIKE '%ماست%' OR n LIKE '%پنیر%' OR n LIKE '%کره%'
      OR n LIKE '%خامه%' THEN 'dairy'
    WHEN n LIKE '%شوینده%' OR n LIKE '%ظرفشویی%' OR n LIKE '%پودر لباس%' OR n LIKE '%مایع لباس%'
      OR n LIKE '%جرم گیر%' OR n LIKE '%سفیدکننده%' OR n LIKE '%پاک کننده%' THEN 'detergents'
    WHEN n LIKE '%شامپو%' OR n LIKE '%صابون%' OR n LIKE '%خمیر دندان%' OR n LIKE '%مسواک%'
      OR n LIKE '%نرم کننده%' OR n LIKE '%دئودورانت%' OR n LIKE '%کرم%' THEN 'personal-care'
    WHEN n LIKE '%برنج%' OR n LIKE '%روغن%' OR n LIKE '%رب %' OR n LIKE '%ماکارونی%'
      OR n LIKE '%عدس%' OR n LIKE '%لوبیا%' OR n LIKE '%قند%' OR n LIKE '%شکر%'
      OR n LIKE '%نمک%' OR n LIKE '%حبوبات%' OR n LIKE '%کنسرو%' OR n LIKE '%آرد%'
      OR n LIKE '%ادویه%' OR n LIKE '%نودل%' THEN 'groceries'
    ELSE NULL
  END
  FROM (SELECT replace(replace(lower(coalesce(p_name, '')), 'ي', 'ی'), 'ك', 'ک') AS n) AS normalized
$$;

CREATE OR REPLACE FUNCTION product_auto_image(p_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN n LIKE '%بستنی%' THEN 'https://images.pexels.com/photos/7761734/pexels-photo-7761734.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    WHEN n LIKE '%چیپس%' THEN 'https://images.pexels.com/photos/6485538/pexels-photo-6485538.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    WHEN n LIKE '%بیسکویت%' THEN 'https://images.pexels.com/photos/4541394/pexels-photo-4541394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    WHEN n LIKE '%کیک%' THEN 'https://images.pexels.com/photos/26341195/pexels-photo-26341195.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    WHEN n LIKE '%کوکاکولا%' OR n LIKE '%کولا%' OR n LIKE '%فانتا%' OR n LIKE '%نوشابه%' THEN 'https://images.pexels.com/photos/17650224/pexels-photo-17650224.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    WHEN n LIKE '%انرژی%' THEN 'https://images.pexels.com/photos/34405414/pexels-photo-34405414.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    WHEN n LIKE '%آب معدنی%' OR n ~ '(^|\s)آب(\s|$)' THEN 'https://images.pexels.com/photos/13871766/pexels-photo-13871766.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    WHEN n LIKE '%آلبالو%' OR n LIKE '%آب میوه%' THEN 'https://images.pexels.com/photos/27119207/pexels-photo-27119207.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ELSE NULL
  END
  FROM (SELECT replace(replace(lower(coalesce(p_name, '')), 'ي', 'ی'), 'ك', 'ک') AS n) AS normalized
$$;

CREATE OR REPLACE FUNCTION products_apply_auto_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.category_source = 'auto' THEN
    NEW.category := product_auto_category(NEW.name);
  END IF;
  IF NEW.image_source = 'auto' THEN
    NEW.image_url := product_auto_image(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_apply_auto_fields ON products;
CREATE TRIGGER products_apply_auto_fields
BEFORE INSERT OR UPDATE OF name, category_source, image_source ON products
FOR EACH ROW EXECUTE FUNCTION products_apply_auto_fields();

UPDATE products SET name = name;
