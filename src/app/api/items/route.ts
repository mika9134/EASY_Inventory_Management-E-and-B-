import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryItems, NewInventoryItem } from '@/db/schema';
import { uploadImage } from '@/lib/cloudinary';
import { createItemSchema, validateImageFile } from '@/lib/validation';
import { retryAsync } from '@/lib/utils';

/**
 * GET all inventory items with pagination
 */
import { eq, ilike, or, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // 1. Build dynamic filters
    const filters = [];

    if (category && category !== 'all') {
      filters.push(eq(inventoryItems.category, category));
    }

    if (search) {
      const searchTerm = `%${search}%`;
      filters.push(
        or(
          ilike(inventoryItems.name, searchTerm),
          ilike(inventoryItems.description, searchTerm)
        )
      );
    }

    // 2. Fetch only the required data from the database
    const items = await db.query.inventoryItems.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      orderBy: (items, { desc }) => [desc(items.createdAt)],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * POST a new inventory item
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const category = formData.get('category')?.toString() || 'Other';
    const price = formData.get('price')?.toString() || '0';
    const stock = formData.get('stock')?.toString() || '0';
    const imageFile = formData.get('image') as File | null;

    // Validate input with Zod
    const validation = createItemSchema.safeParse({
      name,
      description,
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
    });

    if (!validation.success) {
      const flatErrors = validation.error.flatten();
      const firstError = Object.values(flatErrors.fieldErrors)[0]?.[0] || 'Validation failed';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // Validate image if provided
    const imageValidation = validateImageFile(imageFile);
    if (!imageValidation.valid) {
      return NextResponse.json({ error: imageValidation.error }, { status: 400 });
    }

    let imageUrl: string | undefined;
    let imageCloudinaryId: string | undefined;

    if (imageFile) {
      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload with retry
        const uploadResult = await retryAsync(
          () => uploadImage(buffer, 'inventory-app'),
          3,
          1000
        );

        imageUrl = uploadResult.url;
        imageCloudinaryId = uploadResult.publicId;
      } catch (uploadError: any) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError.message}` },
          { status: 400 }
        );
      }
    }

    // Create item with retry for database operations
    const newItem: NewInventoryItem = {
      name: validation.data.name,
      description: validation.data.description,
      category: validation.data.category,
      price: validation.data.price.toString() as any,
      stock: validation.data.stock,
      imageUrl,
      imageCloudinaryId,
    };

    const [createdItem] = await retryAsync(
      () => db.insert(inventoryItems).values(newItem).returning(),
      3,
      1000
    );

    return NextResponse.json(createdItem, { status: 201 });
  } catch (error: any) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item. Please try again.' },
      { status: 500 }
    );
  }
}