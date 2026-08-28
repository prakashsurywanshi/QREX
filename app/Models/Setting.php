<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'key',
    'value',
    'group',
])]
class Setting extends Model
{
    public static function allAsArray(): array
    {
        return static::pluck('value', 'key')->all();
    }

    public static function set(string $key, $value, string $group = 'general'): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => is_array($value) ? json_encode($value) : (string) $value, 'group' => $group]
        );
    }
}
