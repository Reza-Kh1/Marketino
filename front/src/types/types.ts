// types.ts
// دقیقاً منطبق با شکلی که findBySlug از بک‌اند برمی‌گردونه
// (reviews / qnas / productTable / content / breadcrumbs از قبل هندل شدن، اینجا نیستن)

import { number } from "zod"

export interface BreadcrumbsType {
    id: string
    name: string
    nameEn: string
    slug: string
    slugEn: string
}

export interface PagePropsType {
    params: {
        slug: string;
    };
}


export interface ProductBrand {
    name: string;
    nameEn: string | null;
    slug: string;
}

export interface ProductSeller {
    storeName: string;
}

export interface ProductImage {
    alt: string;
    url: string;
    sortOrder: number;
}

export interface VariantColor {
    hexCode: string;
    name: string;
    nameEn: string | null;
}

export interface VariantDiscount {
    type: "percentage" | "fixed";
    value: number;
    isActive: boolean;
    startsAt: Date;
    endsAt: Date;
}

export interface VariantAttribute {
    value: string;
    attribute: {
        key: string; // "color" | "size" | ...
        label: string;
    };
}

export interface ProductVariant {
    id: string;
    discountId: string | null;
    colorId: string;
    name: string;
    nameEn: string | null;
    image: string | null;
    price: string; // مقدار عددی به‌صورت رشته
    quantity: number;
    sku: string;
    saleCount: number;
    color: VariantColor;
    discount: VariantDiscount | null;
    attributes: VariantAttribute[];
}

export interface ReviewsType {
    body: string
    answerReview: string | null
    rating: number
    updatedAt: Date
    user: {
        id: string
        firstName: string
        lastName: string
    },
}


export interface QnasType {
    id: string
    content: string
    role: 'seller' | 'buyer'
    updatedAt: Date
    _count: { replies: number }
    replies: QnasType[]
}

export interface ProductDetail {
    id: string;
    title: string;
    titleEn: string | null;
    content: string | null
    contentEn: string | null
    slug: string;
    slugEn: string | null;
    description: string | null;
    descriptionEn: string | null;
    productTable: { rows: string[][], headers: string[] }
    productTableEn: { rows: string[][], headers: string[] }
    originalPrice: string;
    minPrice: string;
    reviews: ReviewsType[]
    qnas: QnasType[]
    discountPercent: number | null;
    condition: "new" | "used" | string;
    isDigital: boolean;
    rating: number;
    reviewCount: number;
    saleCount: number;
    viewCount: number;
    brand: ProductBrand;
    seller: ProductSeller;
    images: ProductImage[];
    isFeatured: boolean;
    metaTitle: string | null;
    metaTitleEn: string | null;
    digitalFile: string | null;
    variants: ProductVariant[];
    _count: { reviews: number, qnas: number }
    breadcrumbs: BreadcrumbsType[]
    category: {
        id: string;
        name: string;
        nameEn: string;
        slug: string;
        slugEn: string;
        ancestorIds: string[];
    };
}
