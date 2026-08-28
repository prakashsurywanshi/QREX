<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name',
    'type',
    'size',
    'folder',
    'property_name',
    'uploaded_by',
    'url',
])]
class MediaFile extends Model
{
    use SoftDeletes;
}
