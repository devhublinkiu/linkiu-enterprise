<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Licitacion extends Model implements HasMedia
{
    use HasFactory, HasSlug, InteractsWithMedia, SoftDeletes;

    protected $table = 'licitaciones';

    protected $fillable = [
        'empresa_id',
        'titulo',
        'slug',
        'enlace_externo',
        'extracto',
        'contenido',
        'publico_objetivo',
        'estado',
        'fecha_publicacion',
        'fecha_cierre',
    ];

    protected $casts = [
        'fecha_publicacion' => 'datetime',
        'fecha_cierre' => 'datetime',
    ];

    /**
     * Get the options for generating the slug.
     */
    public function getSlugOptions() : SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('titulo')
            ->saveSlugsTo('slug')
            ->doNotGenerateSlugsOnUpdate();
    }

    /**
     * Relationship: Company
     */
    public function empresa()
    {
        return $this->belongsTo(BienesServiciosEmpresa::class, 'empresa_id');
    }

    /**
     * Setup Media Collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('featured_image')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

        $this->addMediaCollection('documents')
            ->acceptsMimeTypes([
                'application/pdf', 
                'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ]);
    }

    /**
     * Setup Media Conversions
     */
    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)
            ->height(200)
            ->sharpen(10)
            ->performOnCollections('featured_image');

        $this->addMediaConversion('card')
            ->width(600)
            ->height(400)
            ->sharpen(10)
            ->performOnCollections('featured_image');
    }

    /**
     * Helper to get featured image URL
     */
    public function getFeaturedImageUrlAttribute()
    {
        return $this->getFirstMediaUrl('featured_image') ?: null;
    }
}
