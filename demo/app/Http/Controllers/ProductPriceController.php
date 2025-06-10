<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductPrice;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Vyuldashev\LaravelOpenApi\Attributes as OpenApi;

#[OpenApi\PathItem]
class ProductPriceController extends Controller
{
    /**
     * Retrieve all product prices.
     */
    #[OpenApi\Operation(tags: ['Product Prices'])]
    public function index()
    {
        $productPrices = ProductPrice::with(['product'])->get();

        return response([
            'message' => 'Product prices retrieved successfully',
            'value' => $productPrices,
        ]);
    }

    /**
     * Retrieve a specific product price by ID.
     */
    #[OpenApi\Operation(tags: ['Product Prices'])]
    public function show(int $id)
    {
        $productPrice = ProductPrice::with(['product'])->find($id);
        if (!$productPrice) {
            return response()->json(['message' => 'Product price not found'], 404);
        }

        return response([
            'message' => 'Product price retrieved successfully',
            'value' => $productPrice,
        ]);
    }

    /**
     * Store a new product price.
     */
    #[OpenApi\Operation(tags: ['Product Prices'])]
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'price' => 'required|decimal:10,2',
            'currency' => 'required|string|max:3',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($data['end_date'] ?? true) {
            $data['end_date'] = Carbon::createFromFormat('Y-m-d', $data['start_date'])
                ->startOfDay()
                ->addDays(30)
                ->toDateString();
        }

        $productPrice = ProductPrice::create($data);

        return response()->json([
            'message' => 'Product price created successfully',
            'value' => $productPrice,
        ], 201);
    }

    /**
     * Update an existing product price.
     */
    #[OpenApi\Operation(tags: ['Product Prices'])]
    public function update(Request $request, $id)
    {
        $productPrice = ProductPrice::find($id);
        if (!$productPrice) {
            return response()->json(['message' => 'Product price not found'], 404);
        }

        $data = $request->validate([
            'product_id' => 'sometimes|required|exists:products,id',
            'price' => 'sometimes|required|decimal:10,2',
            'currency' => 'sometimes|required|string|max:3',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $productPrice->update($data);

        return response([
            'message' => 'Product price updated successfully',
            'value' => $productPrice,
        ], 202);
    }

    /**
     * Delete a product price.
     */
    #[OpenApi\Operation(tags: ['Product Prices'])]
    public function destroy(int $id)
    {
        $productPrice = ProductPrice::find($id);
        if (!$productPrice) {
            return response()->json(['message' => 'Product price not found'], 404);
        }

        $product = Product::query()
            ->withCount('prices')
            ->find($productPrice->product_id);

        if ($product->prices_count <= 1) {
            return response()->json(['message' => 'Cannot delete the last price for a product'], 400);
        }

        $productPrice->delete();

        return response([
            'message' => 'Product price deleted successfully',
            'value' => null,
        ], 202);
    }
}
