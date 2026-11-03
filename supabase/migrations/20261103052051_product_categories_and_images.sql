/*
# Product categories and images

1. Changes to existing tables
- `products`: adds `category` (nullable text, one of: drinks, snacks, ice-cream, dairy, detergents, personal-care, groceries) and `image_url` (nullable text, public URL of the product photo).
- Existing products keep all their data; their category and image start empty.

2. Storage
- New public bucket `product-images` (JPEG, PNG or WEBP, max 5 MB per file).
- Anyone with the store key can read images (public bucket); upload, replace and removal are limited to this bucket only.

3. Security
- No new tables. Existing products policies are unchanged.
- Storage policies only apply to the `product-images` bucket.

4. Notes
- Category values are checked by the database so only the listed categories can be saved.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_category_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_category_check
      CHECK (category IS NULL OR category IN ('drinks', 'snacks', 'ice-cream', 'dairy', 'detergents', 'personal-care', 'groceries'));
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
CREATE POLICY "product_images_select" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
CREATE POLICY "product_images_insert" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
CREATE POLICY "product_images_update" ON storage.objects FOR UPDATE
  TO anon, authenticated USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
CREATE POLICY "product_images_delete" ON storage.objects FOR DELETE
  TO anon, authenticated USING (bucket_id = 'product-images');
