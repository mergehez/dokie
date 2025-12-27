<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::where('email', $credentials['email'])->first();
        if (!$user) {
            return response([
                'message' => 'User not found',
                'value' => null,
            ], 404);
        }

        if ($user->api_key_expires_at && $user->api_key_expires_at > now()) {
            return response([
                'message' => 'User already logged in',
                'value' => [
                    'api_key' => $user->api_key,
                    'api_key_expires_at' => $user->api_key_expires_at,
                    'user' => $user,
                ],
            ]);
        }

        if (!Hash::check($credentials['password'], $user->password)) {
            return response([
                'message' => 'Wrong password',
                'value' => null,
            ], 401);
        }

        $apiKeyGuid = Str::uuid();
        $user->api_key = $apiKeyGuid;
        $user->api_key_expires_at = now()->addMinutes(60);
        $user->save();

        return response()->json([
            'message' => 'Login successful',
            'value' => [
                'api_key' => $user->api_key,
                'api_key_expires_at' => $user->api_key_expires_at,
                'user' => $user,
            ],
        ], 200);
    }

    /**
     * logout user.
     */
    public function logout()
    {
        $user = auth()->user();
        if (!$user) {
            return response([
                'message' => 'User not authenticated',
                'value' => null,
            ], 401);
        }

        $user->api_key = null;
        $user->api_key_expires_at = null;
        $user->save();

        return response([
            'message' => 'Logout successful',
            'value' => null,
        ]);
    }

    /**
     * Retrieve all users.
     */
    public function index()
    {
        $users = User::all();
        return response([
            "message" => "Users retrieved successfully",
            "value" => $users,
        ]);
    }

    /**
     * Retrieve by ID.
     */
    public function show(int $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return response([
            'message' => 'User retrieved successfully',
            'value' => $user,
        ]);
    }

    /**
     * Create a new user.
     */
    public function store(Request $request)
    {
        // ddh($request);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $data['password'] = bcrypt($data['password']);

        $user = User::create($data);

        return response()->json([
            'message' => 'User created successfully',
            'value' => $user,
        ], 201);
    }

    /**
     * Update an existing user.
     *
     * Note that this method does not allow changing the password. Use 'change-password' method for that.
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,'.$id,
        ]);

        $user->update($data);
        return response()->json([
            'message' => 'User updated successfully',
            'value' => $user,
        ], 202);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 403);
        }

        $user->password = bcrypt($data['new_password']);
        $user->save();

        return response([
            'message' => 'Password changed successfully',
            'value' => $user,
        ], 202);
    }

    /**
     * Delete a user.
     */
    public function destroy(int $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        $user->delete();
        return response([
            'message' => 'User deleted successfully',
            'value' => null,
        ], 202);
    }
}
