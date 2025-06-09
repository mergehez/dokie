<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Vyuldashev\LaravelOpenApi\Attributes as OpenApi;

#[OpenApi\PathItem]
class ProductController extends Controller
{
    /**
     * Retrieve all products with optional prices.
     */
    #[OpenApi\Operation]
    public function index(Request $request)
    {
        $withPrices = $request->query('with_prices', false);

        $products = Product::query()
            ->with(['category'])
            ->when($withPrices, function ($query) {
                $query->with(['prices']);
            })
            ->get();

        return response([
            'message' => 'Products retrieved successfully',
            'value' => $products,
        ]);
    }

    /**
     * Retrieve a specific product by ID.
     */
    #[OpenApi\Operation]
    public function show(int $id)
    {
        $product = Product::with(['category', 'prices', 'createdBy'])->find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response([
            'message' => 'Product retrieved successfully',
            'value' => $product,
        ]);
    }

    /**
     * Store a new product.
     */
    #[OpenApi\Operation]
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
        ]);

        $product = Product::create($data);
        return response()->json([
            'message' => 'Product created successfully',
            'value' => $product,
        ], 201);
    }

    /**
     * Update an existing product.
     */
    #[OpenApi\Operation]
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
        ]);

        $product->update($data);

        return response()->json([
            'message' => 'Product updated successfully',
            'value' => $product,
        ], 202);
    }

    /**
     * Delete a product by ID.
     */
    #[OpenApi\Operation]
    public function destroy(int $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
            'value' => null,
        ], 202);
    }
}
