<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Vyuldashev\LaravelOpenApi\Attributes as OpenApi;

#[OpenApi\PathItem]
class CategoryController extends Controller
{
    /**
     * Retrieve all categories.
     */
    #[OpenApi\Operation(tags: ['Categories'])]
    public function index()
    {
        $categories = Category::all();

        return response([
            "message" => "Categories retrieved successfully",
            "value" => $categories,
        ]);
    }

    /**
     * Retrieve a specific category by ID.
     */
    #[OpenApi\Operation(tags: ['Categories'])]
    public function show(int $id)
    {
        $category = Category::with(['products'])->find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        return response([
            'message' => 'Category retrieved successfully',
            'value' => $category,
        ]);
    }

    /**
     * Store a new category.
     */
    #[OpenApi\Operation(tags: ['Categories'])]
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($data);

        return response()->json([
            'message' => 'Category created successfully',
            'value' => $category,
        ], 201);
    }

    /**
     * Update an existing category.
     */
    #[OpenApi\Operation(tags: ['Categories'])]
    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category->update($data);

        return response()->json([
            'message' => 'Category updated successfully',
            'value' => $category,
        ], 202);
    }

    /**
     * Delete a category.
     */
    #[OpenApi\Operation(tags: ['Categories'])]
    public function destroy(int $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully',
        ], 202);
    }
}
