# SubAdminECommerce Multi-Tenancy Architecture & Coding Rules

Always follow these rules automatically across all conversations in this project:

## 1. Project Context
- **Project Path**: `E:\SubAdminECommerce`
- **Architecture**: Multi-Tenancy Wildcard Schema — queries run against each tenant's specific schema based on the requesting tenant/subdomain wildcard.
- **Tenant Models**: Placed in `src/models/tenant/` with **each table in a separate file**:
  1. `customers.ts` (`customer` table: name, phone unique, email unique, order_num int default 0, order_sum int default 0, password)
  2. `categories.ts` (`category` table: name json, category_id self-ref, order_number, banner, icon, cover_image)
  3. `brands.ts` (`brand` table: name, logo)
  4. `discounts.ts` (`discount` table: name json, type percentage/value enum, amount, status)
  5. `flashDiscounts.ts` (`flash_discount` table: name json, type percentage/value enum, amount, status, start_date, end_date)
  6. `popups.ts` (`popup` table: image array json, link, name json, description json)
  7. `warranties.ts` (`warranty` table: text json, logo, period string nullable)
  8. `taxes.ts` (`tax` table: name json, amount, type percentage/value enum, status)
  9. `roles.ts` (`role` table: name)
  10. `permissions.ts` (`perimission` table: role_id, permission, actions json)
  11. `staff.ts` (`staff` table: name, email unique, phone unique, password, role_id)
  12. `paymentMethods.ts` (`payment_method` table: name array json, description nullable, icon, status)
  13. `products.ts` (`products` table: name json, description json nullable, category_id, sub_category_id, brand_id, discount_id, flash_discount_id, tax_id, image, warrantly_id, warrantly_note, today_deal, free_shipping, shipping_days, gallery json, published)
  14. `attributes.ts` (`attribute` table: name json)
  15. `values.ts` (`value` table: name json, attribute_id)
  16. `productAttributes.ts` (`product_attribute` table: product_id, attribute_id)
  17. `productValues.ts` (`product_values` table: product_id, value_ids json, sku nullable, quantity default 1, image, price default 0)
  18. `cities.ts` (`city` table: name array json, status)
  19. `zones.ts` (`zone` table: name array json, city_id, status)
  20. `addresses.ts` (`address` table: customer_id, city_id, zone_id, building_num, floor, address, street, additional_data, lat, lng)
  21. `languages.ts` (`lang` table: name string, status)
- All tables re-exported via `src/models/tenant/index.ts` and `src/models/schema.ts`.
- Primary keys use `char("id", { length: 36 }).primaryKey().default(sql\`(UUID())\`)`.

## 2. CRUD & Folder Conventions (`controllers`, `validators`, `routes`)
- **Validators**: Place all Zod validation schemas in `src/validators/{role}/{element}.ts`.
- **Controllers**: Place CRUD controllers in `src/controllers/{role}/{element}.ts`.
- **Routes**: Place route definitions in `src/routes/{role}/{item}.ts` and mount them in `src/routes/{role}/index.ts`.
- **Route Middleware Pattern**: Always attach permission middleware, validation middleware, and `catchAsync` directly on the route:
  ```ts
  router.get("/", checkPermission(), catchAsync(getAllItems));
  router.post("/", checkPermission(), validate(createItemSchema), catchAsync(createItem));
  ```
- **Automatic Swagger from Zod**: `src/config/swagger.ts` automatically scans all Express routes and reads the Zod schema attached by `validate(schema)` to generate OpenAPI parameters (`params`, `query`) and `requestBody` (`body`) keys. Do not clutter route files with manual `@swagger` JSDoc blocks.
- **Relational Selection Endpoints**: Whenever a table has columns referencing another table (Foreign Key relation), create a selection API endpoint that fetches `{ id, name }` for dropdowns/select fields.

## 3. Image Upload / Update / Delete Service (`src/utils/handleImages.ts`)
Always use the standard functions in `src/utils/handleImages.ts` whenever any model has an image/icon field:
- **On Create**: Use `uploadImage(req, base64, folder)` — saves the image in `uploads/{folder}` and returns its URL string to store in the database.
- **On Update**: Use `updateImage(req, newBase64, folder, oldImageUrlOrPath)` — deletes the old image from `uploads` first (if it exists), saves the new image in `uploads/{folder}`, and returns the new URL string to store in the database.
- **On Delete**: Use `deleteImage(oldImageUrlOrPath)` — deletes the old image file from `uploads` before/when deleting the database record.
