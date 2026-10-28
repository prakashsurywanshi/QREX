<?php

namespace App\Http\Controllers\Concerns;

use App\Services\PropertyTypeCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Shared validation for creating/updating a property.
 *
 * Lives in a trait because PropertyController and Api\PropertyController both
 * accept the same payload and must stay in step.
 *
 * Beyond plain validation this applies the property type's spec rules:
 *  - `type` must be a known type
 *  - numeric room counts the type does not expose are reset to 0/1 so a listing
 *    cannot keep showing "3 BHK" after being retyped from Apartment to Plot
 *
 * Descriptive text fields (`furnishing`, `possession_date`) are deliberately NOT
 * reset when hidden: this install stores real free-text values there
 * ("bare shell", "DEVELOPER FINISH"), and a field the form hides cannot offer to
 * change them anyway.
 */
trait ValidatesPropertyPayload
{
    protected function validateProperty(Request $request, PropertyTypeCatalog $catalog): array
    {
        $type = $request->input('type');
        $spec = $catalog->specRules(is_string($type) ? $type : null);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'type' => ['required', 'string', Rule::in($catalog->names())],
            'transaction_type' => 'nullable|string|max:40',
            'description' => 'nullable|string',
            'status' => 'nullable|string|max:40',
            'price' => $this->numericRule('price', $spec, ['required', 'numeric', 'min:0']),
            'area' => $this->numericRule('area', $spec, ['required', 'numeric', 'min:0']),
            'bedrooms' => $this->numericRule('bedrooms', $spec, ['nullable', 'integer', 'min:0']),
            'bathrooms' => $this->numericRule('bathrooms', $spec, ['nullable', 'integer', 'min:0']),
            'floors' => $this->numericRule('floors', $spec, ['nullable', 'integer', 'min:0']),
            'parking' => $this->numericRule('parking', $spec, ['nullable', 'integer', 'min:0']),
            'furnishing' => 'nullable|string|max:60',
            'possession_date' => 'nullable|string|max:60',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:120',
            'state' => 'nullable|string|max:120',
            'country' => 'nullable|string|max:120',
            'pincode' => 'nullable|string|max:20',
            'amenities' => 'nullable|array',
            'amenities.*' => 'nullable|string|max:80',
            'featured' => 'nullable|boolean',
            'is_website_visible' => 'nullable|boolean',
            'seo_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:1000',
            'agent_id' => 'nullable|integer|exists:users,id',
        ]);

        // `status` had no default and every existing row carries a value; keep
        // the column's own default when the client omits it.
        $data['status'] = $data['status'] ?? 'Available';
        $data['transaction_type'] = $data['transaction_type'] ?? 'Buy';

        $this->applySpecDefaults($data, $spec);

        $data['amenities'] = $this->normalizeAmenities($data['amenities'] ?? []);

        return $data;
    }

    /**
     * A field is `nullable` instead of `required` when its type hides it, so a
     * stale payload from the client cannot fail validation for a field the user
     * was never shown.
     */
    private function numericRule(string $field, array $spec, array $rules): array
    {
        if (! in_array($field, $spec['visible'], true)) {
            return array_values(array_filter($rules, fn ($r) => ! str_starts_with($r, 'required')));
        }

        if (in_array($field, $spec['required'], true)) {
            return array_values(array_filter($rules, fn ($r) => $r !== 'nullable'));
        }

        return $rules;
    }

    /**
     * Zero out numeric counts the selected type does not expose.
     */
    private function applySpecDefaults(array &$data, array $spec): void
    {
        $resettable = ['bedrooms', 'bathrooms', 'floors', 'parking'];

        foreach ($resettable as $field) {
            if (in_array($field, $spec['visible'], true)) {
                $data[$field] = (int) ($data[$field] ?? $spec['defaults'][$field]);

                continue;
            }

            $data[$field] = (int) $spec['defaults'][$field];
        }
    }

    /**
     * Trim, drop blanks and de-duplicate while preserving the admin's ordering.
     */
    private function normalizeAmenities(mixed $amenities): array
    {
        if (! is_array($amenities)) {
            return [];
        }

        $seen = [];

        foreach ($amenities as $amenity) {
            if (! is_string($amenity)) {
                continue;
            }

            $name = trim(preg_replace('/\s+/u', ' ', $amenity) ?? '');

            if ($name === '' || mb_strlen($name) > 80) {
                continue;
            }

            $key = Str::lower($name);

            if (isset($seen[$key])) {
                continue;
            }

            $seen[$key] = true;

            $result[] = $name;
        }

        return $result ?? [];
    }
}
