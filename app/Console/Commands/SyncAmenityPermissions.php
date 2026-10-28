<?php

namespace App\Console\Commands;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Console\Command;

/**
 * Adds the `amenities.*` permissions to an existing install without touching any
 * other permission or role.
 *
 * RolesAndPermissionsSeeder force-deletes every role and permission before
 * rebuilding them, which is fine on a fresh database but destroys an established
 * one. This command is the safe upgrade path: it upserts permissions by slug and
 * only attaches the new ones to roles that already hold the equivalent
 * `properties.*` permission.
 */
class SyncAmenityPermissions extends Command
{
    protected $signature = 'properties:sync-amenity-permissions';

    protected $description = 'Idempotently adds the amenities.* permissions and grants them to roles that already manage properties';

    private const ACTIONS = ['view', 'create', 'edit', 'delete'];

    /**
     * Roles that manage properties should be able to curate the amenity catalog.
     */
    private const GRANTED_BY_PROPERTY_ACCESS = ['Super Admin', 'Admin'];

    public function handle(): int
    {
        if (! Permission::query()->exists()) {
            $this->error('No permissions found. Run `php artisan db:seed --class=RolesAndPermissionsSeeder` on a fresh database first.');

            return self::FAILURE;
        }

        $created = 0;
        $existing = 0;

        foreach (self::ACTIONS as $action) {
            $slug = "amenities.{$action}";

            $permission = Permission::firstWhere('slug', $slug);

            if ($permission) {
                $existing++;

                continue;
            }

            Permission::create([
                'name' => 'Amenities '.ucfirst($action),
                'slug' => $slug,
                'module' => 'amenities',
                'action' => $action,
                'field' => null,
                'description' => "Allow {$action} on amenities",
            ]);

            $created++;
        }

        $slugs = Permission::query()
            ->where('module', 'amenities')
            ->whereIn('action', self::ACTIONS)
            ->pluck('id');

        $granted = 0;

        foreach (Role::query()->whereIn('name', self::GRANTED_BY_PROPERTY_ACCESS)->get() as $role) {
            $before = $role->permissions()->count();

            $role->permissions()->syncWithoutDetaching($slugs);

            $granted += $role->permissions()->count() - $before;
        }

        $this->info("Amenities permissions synced: {$created} created, {$existing} already present, {$granted} newly granted.");

        if ($created === 0 && $granted === 0) {
            $this->line('Nothing to do — already up to date.');
        }

        return self::SUCCESS;
    }
}
