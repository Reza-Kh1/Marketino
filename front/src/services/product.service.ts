import { apiClient, api } from "@/lib/api-client";
import { CategorysTypes } from "./category.service";
import { TableData } from "@/components/inputs/ProductTable";
import { ProductImage } from "@/lib/api";
import { BrandType } from "./brand.service";

const BASE_URL = "/products";
const VARIANT_URL = "variants";

export interface VariantType {
    id: string;
    name: string;
    nameEn: string | null;
    sku: string;
    price: number;
    quantity: number;
    attributes: Record<string, any> | null;
    attributesEn: Record<string, any> | null;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    discountId: string | null;
    productId: string;
}

export interface FormVariantDTO {
    name: string;
    nameEn: string | null;
    price: number;
    quantity: number;
    attributes: Record<string, any> | null;
    attributesEn: Record<string, any> | null;
    image: string | null;
    discountId: string | null;
    productId: string;
}

export interface Seller {
    id: string;
    storeName: string;
}

export interface ProductEntity {
    productTable: TableData
    productTableEn: TableData
    id: string;
    title: string;
    titleEn: string;
    slug: string;
    slugEn: string | null;
    description: string | null;
    descriptionEn: string | null;
    price: number;
    discountPrice: number | null;
    discountStart: string | null;
    discountEnd: string | null;
    quantity: number;
    sku: string | null;
    brandId: string | null;
    brand: BrandType
    weight: number | null;
    dimensions: string | null;
    condition: 'new' | 'used';
    status: 'pending' | 'approved' | 'inactive';
    isFeatured: string;
    isDigital: string;
    digitalFile: string | null;
    viewCount: number;
    saleCount: number;
    rating: number;
    reviewCount: number;
    metaTitle: string | null;
    metaTitleEn: string | null;
    content: string | null;
    contentEn: string | null;
    createdAt: string;
    updatedAt: string;
    sellerId: string;
    categoryId: string;
    images: ProductImage[];
    category: CategorysTypes;
    seller: Seller;
    originalPrice: number | null
    minPrice: number | null
    discountPercent: number | null
}



export interface FormProductDTO {
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    price: number;
    discountPrice: number;
    discountStart: string;
    discountEnd: string;
    quantity: number;
    sku: string;
    brand: string;
    weight: number;
    dimensions: string;
    condition: 'new' | 'used' | 'refurbished';
    categoryId: string;
    metaTitle: string;
    metaTitleEn: string;
    metaDescription: string;
    metaDescriptionEn: string;
}

export const ProductService = {
    list: () => {
        return apiClient.get<ProductEntity[]>(BASE_URL);
    },
    getBySlug: (slug: string) => {
        return apiClient.get<ProductEntity>(`${BASE_URL}/${slug}`);
    },
    create: (data: FormProductDTO) => {
        return apiClient.post<ProductEntity>(BASE_URL, data);
    },
    update: (id: string, data: FormProductDTO) => {
        return apiClient.put<ProductEntity>(`${BASE_URL}/${id}`, data);
    },
    delete: (id: string) => {
        return apiClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
    },
};