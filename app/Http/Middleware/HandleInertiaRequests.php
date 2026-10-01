<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Root template yang dipakai pada kunjungan pertama.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Data global yang tersedia di semua halaman Inertia (usePage().props).
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id'    => $request->user()->id,
                    'name'  => $request->user()->name,
                    'email' => $request->user()->email,
                    'role'  => $request->user()->role,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success') ?? $request->session()->get('message'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
