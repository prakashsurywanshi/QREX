<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data
        Role::query()->forceDelete();
        Permission::query()->forceDelete();

        $modules = [
            'dashboard' => [
                'actions' => ['view'],
                'fields' => [],
            ],
            'properties' => [
                'actions' => ['view', 'create', 'edit', 'delete', 'export'],
                'fields' => [
                    'edit' => ['price', 'title', 'status', 'description', 'area', 'bedrooms', 'bathrooms', 'amenities', 'featured', 'agent'],
                ],
            ],
            'leads' => [
                'actions' => ['view', 'create', 'edit', 'delete', 'export'],
                'fields' => [
                    'edit' => ['name', 'phone', 'email', 'source', 'status', 'budget', 'assigned_agent', 'score'],
                ],
            ],
            'customers' => [
                'actions' => ['view', 'create', 'edit', 'delete', 'export'],
                'fields' => [
                    'edit' => ['name', 'phone', 'email', 'type', 'budget', 'notes'],
                ],
            ],
            'sales' => [
                'actions' => ['view', 'create', 'edit', 'delete', 'export'],
                'fields' => [],
            ],
            'tasks' => [
                'actions' => ['view', 'create', 'edit', 'delete'],
                'fields' => [
                    'edit' => ['title', 'status', 'priority', 'due_date', 'assigned_to'],
                ],
            ],
            'site_visits' => [
                'actions' => ['view', 'create', 'edit', 'delete'],
                'fields' => [
                    'edit' => ['date', 'time', 'status', 'feedback', 'notes'],
                ],
            ],
            'bookings' => [
                'actions' => ['view', 'create', 'edit', 'delete', 'approve'],
                'fields' => [
                    'edit' => ['amount', 'status', 'payment_mode', 'notes'],
                ],
            ],
            'payments' => [
                'actions' => ['view', 'create', 'edit', 'delete', 'export'],
                'fields' => [
                    'edit' => ['amount', 'status', 'mode', 'date', 'notes'],
                ],
            ],
            'media' => [
                'actions' => ['view', 'create', 'delete'],
                'fields' => [],
            ],
            'marketing' => [
                'actions' => ['view', 'create', 'edit', 'delete', 'export'],
                'fields' => [
                    'edit' => ['name', 'budget', 'status', 'channels', 'content'],
                ],
            ],
            'reports' => [
                'actions' => ['view', 'export'],
                'fields' => [],
            ],
            'cms' => [
                'actions' => ['view', 'create', 'edit', 'delete'],
                'fields' => [
                    'edit' => ['content', 'featured', 'seo'],
                ],
            ],
            'users' => [
                'actions' => ['view', 'create', 'edit', 'delete'],
                'fields' => [
                    'edit' => ['name', 'email', 'phone', 'role', 'branch', 'status', 'password'],
                ],
            ],
            'settings' => [
                'actions' => ['view', 'edit'],
                'fields' => [
                    'edit' => ['project_name', 'agency_name', 'contact_email', 'contact_phone', 'address', 'tagline', 'logo'],
                ],
            ],
            'roles' => [
                'actions' => ['view', 'create', 'edit', 'delete'],
                'fields' => [],
            ],
            'amenities' => [
                'actions' => ['view', 'create', 'edit', 'delete'],
                'fields' => [],
            ],
        ];

        $allPermissions = [];

        foreach ($modules as $module => $config) {
            foreach ($config['actions'] as $action) {
                $slug = "{$module}.{$action}";
                $name = ucfirst(str_replace('_', ' ', $module)).' '.ucfirst($action);

                $perm = Permission::create([
                    'name' => $name,
                    'slug' => $slug,
                    'module' => $module,
                    'action' => $action,
                    'field' => null,
                    'description' => "Allow {$action} on {$module}",
                ]);

                $allPermissions[] = $slug;

                if (!empty($config['fields'][$action])) {
                    foreach ($config['fields'][$action] as $field) {
                        $fieldSlug = "{$module}.{$action}.{$field}";
                        $fieldName = ucfirst(str_replace('_', ' ', $module)).' '.ucfirst($action).' '.ucfirst(str_replace('_', ' ', $field));

                        Permission::create([
                            'name' => $fieldName,
                            'slug' => $fieldSlug,
                            'module' => $module,
                            'action' => $action,
                            'field' => $field,
                            'description' => "Allow editing field '{$field}' on {$module}",
                        ]);

                        $allPermissions[] = $fieldSlug;
                    }
                }
            }
        }

        // --- Roles ---

        // Super Admin: everything
        $superAdmin = Role::create([
            'name' => 'Super Admin',
            'slug' => 'super-admin',
            'description' => 'Full system access with all permissions',
            'is_system' => true,
        ]);
        $superAdmin->permissions()->attach(Permission::whereIn('slug', $allPermissions)->pluck('id'));

        // Admin: most permissions except some system-level
        $admin = Role::create([
            'name' => 'Admin',
            'slug' => 'admin',
            'description' => 'Administrative access with most permissions',
            'is_system' => true,
        ]);
        $adminPerms = array_filter($allPermissions, fn ($p) => !in_array($p, [
            'settings.edit.project_name',
            'roles.delete',
        ]));
        $admin->permissions()->attach(Permission::whereIn('slug', $adminPerms)->pluck('id'));

        // Sales Executive
        $salesExec = Role::create([
            'name' => 'Sales Executive',
            'slug' => 'sales-executive',
            'description' => 'Sales team member with access to properties, leads, customers, and tasks',
            'is_system' => false,
        ]);
        $salesExec->permissions()->attach(Permission::whereIn('slug', [
            'dashboard.view',
            'properties.view', 'properties.create', 'properties.edit',
            'leads.view', 'leads.create', 'leads.edit',
            'leads.edit.name', 'leads.edit.phone', 'leads.edit.email', 'leads.edit.status',
            'leads.edit.budget', 'leads.edit.assigned_agent', 'leads.edit.score',
            'customers.view', 'customers.create', 'customers.edit',
            'tasks.view', 'tasks.create', 'tasks.edit',
            'site_visits.view', 'site_visits.create', 'site_visits.edit',
            'media.view', 'media.create',
            'reports.view',
        ])->pluck('id'));

        // Senior Agent
        $seniorAgent = Role::create([
            'name' => 'Senior Agent',
            'slug' => 'senior-agent',
            'description' => 'Senior sales agent with broader access than Sales Executive',
            'is_system' => false,
        ]);
        $seniorAgent->permissions()->attach(Permission::whereIn('slug', [
            'dashboard.view',
            'properties.view', 'properties.create', 'properties.edit',
            'leads.view', 'leads.create', 'leads.edit',
            'leads.edit.name', 'leads.edit.phone', 'leads.edit.email', 'leads.edit.source',
            'leads.edit.status', 'leads.edit.budget', 'leads.edit.assigned_agent', 'leads.edit.score',
            'customers.view', 'customers.create', 'customers.edit',
            'sales.view', 'sales.create', 'sales.edit',
            'tasks.view', 'tasks.create', 'tasks.edit',
            'site_visits.view', 'site_visits.create', 'site_visits.edit',
            'media.view', 'media.create',
            'reports.view',
        ])->pluck('id'));

        // Marketing User
        $marketingUser = Role::create([
            'name' => 'Marketing User',
            'slug' => 'marketing-user',
            'description' => 'Marketing team member with access to campaigns, CMS, and media',
            'is_system' => false,
        ]);
        $marketingUser->permissions()->attach(Permission::whereIn('slug', [
            'dashboard.view',
            'leads.view', 'leads.create',
            'marketing.view', 'marketing.create', 'marketing.edit',
            'media.view', 'media.create',
            'cms.view', 'cms.create', 'cms.edit',
            'reports.view', 'reports.export',
        ])->pluck('id'));

        // Accountant
        $accountant = Role::create([
            'name' => 'Accountant',
            'slug' => 'accountant',
            'description' => 'Finance team with access to bookings, payments, and reports',
            'is_system' => false,
        ]);
        $accountant->permissions()->attach(Permission::whereIn('slug', [
            'dashboard.view',
            'customers.view',
            'sales.view',
            'bookings.view', 'bookings.create', 'bookings.edit',
            'payments.view', 'payments.create', 'payments.edit',
            'reports.view', 'reports.export',
            'media.view',
        ])->pluck('id'));
    }
}
