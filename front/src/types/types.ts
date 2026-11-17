
export interface BreadcrumbsType {
    id: string
    name: string
    slug: string
}

export interface PagePropsType {
    params: {
        slug: string;
    };
}


export interface ProductBrand {
    name: string;
    slug: string;
}

export interface ProductStore {
    name: string;
    slug: string
    storeName:string
}

export interface ProductImage {
    alt: string;
    url: string;
    sortOrder: number;
}

export interface VariantColor {
    hexCode: string;
    name: string;
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
    image: string | null;
    price: string; // مقدار عددی به‌صورت رشته
    quantity: number;
    sku: string;
    saleCount: number;
    color?: VariantColor | null;
    discount: VariantDiscount | null;
    attributes: VariantAttribute[];
}

export interface ReviewsType {
    body: string
    answerReview: string | null
    rating: number
    updatedAt: Date
    createdAt: Date
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
    createdAt: Date
    _count: { replies: number }
    replies: QnasType[]
}

export interface ProductDetail {
    id: string;
    title: string;
    content: string | null
    slug: string;
    description: string | null;
    productTable: { rows: string[][], headers: string[] }
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
    store: ProductStore;
    images: ProductImage[];
    isFeatured: boolean;
    metaTitle: string | null;
    digitalFile: string | null;
    variants: ProductVariant[];
    _count: { reviews: number, qnas: number }
    breadcrumbs: BreadcrumbsType[]
    category: {
        id: string;
        name: string;
        slug: string;
        ancestorIds: string[];
    };
}

export interface AllCartType {
    carts: CartType[]
    totalItems: 2,
    totalPrice: 14980000
}

export interface CartType {
    id: string
    quantity: number
    product: ProductDetail
    variantId: string
    variant: ProductVariant
}