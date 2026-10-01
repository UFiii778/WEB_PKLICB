<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function showLoginForm()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            $user = Auth::user();

            if ($user->role === 'siswa') {
                return redirect()->route('siswa.dashboard');
            } elseif ($user->role === 'perusahaan' || $user->role === 'mitra' || $user->role === 'hrd') {
                // Menampung role 'perusahaan' agar sesuai dengan database
                return redirect()->route('mitra.dashboard');
            } elseif ($user->role === 'admin') {
                return redirect()->route('admin.dashboard');
            }

            Auth::logout();
            return back()->withErrors(['email' => 'Role akun tidak dikenali.']);
        }

        return back()->withErrors([
            'email' => 'Email atau password yang Anda masukkan salah.',
        ])->onlyInput('email');
    }

    public function showRegisterForm()
    {
        return view('auth.register');
    }

    public function registerSiswa(Request $request)
    {
        $request->validate([
            'nis_nip'  => 'required|string|unique:users,nis_nip',
            'name'     => 'required|string|max:255',
            'kelas'    => 'required|string',
            'email'    => 'required|email|unique:users,email',
            'no_hp'    => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        User::create([
            'nis_nip'  => $request->nis_nip,
            'name'     => $request->name,
            'kelas'    => $request->kelas,
            'email'    => $request->email,
            'no_hp'    => $request->no_hp,
            'role'     => 'siswa',
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('login')->with('success', 'Akun Siswa berhasil dibuat! Silakan login.');
    }

    public function registerHrd(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'no_hp'    => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'no_hp'    => $request->no_hp,
            'role'     => 'perusahaan', // Simpan sebagai 'perusahaan'
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('login')->with('success', 'Akun HRD Perusahaan berhasil dibuat! Silakan login.');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
