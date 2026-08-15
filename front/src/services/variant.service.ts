import { apiClient } from "@/lib/api-client";

const BASE_URL = "/variants";

export interface AttributeDefinition {
    id: string;
    key: string;
    label: string;
    category: {
        name: string
        nameEn: string
        id: string
    }[];
}
export interface AllAttributeDefinition {
    data: AttributeDefinition[]
}


export interface VariantAttribute {
    id: string;
    value: string;
    variantId: string;
    attributeId: string;
}

export interface VariantEntity {
    id: string;
    name: string;
    nameEn: string | null;
    price: number;
    quantity: number;
    colorId: string;
    image: string | null;
    discountId: string | null;
    productId: string;
    attributes: {
        attribute: { id: string, key: string, label: string }
        attributeId: string
        id: string
        value: string
    }[]
    createdAt: string;
    updatedAt: string;
}

export interface CreateAttributeDefinitionDTO {
    key: string;
    label: string;
    categoryIds: string[];
}

export interface CreateVariantAttributeDTO {
    value: string;
    variantId: string;
    attributeId: string;
}

export interface VariantAttributeInput {
    attributeId: string;
    value: string;
}

export interface CreateVariantDTO {
    name: string;
    nameEn?: string;
    price: number;
    quantity: number;
    colorId?: string;
    image?: string;
    discountId?: string;
    productId: string;
    attributes?: VariantAttributeInput[];
}

export interface UpdateVariantDTO {
    name?: string;
    nameEn?: string;
    price?: number;
    quantity?: number;
    colorId?: string;
    image?: string;
    discountId?: string;
    attributes?: Record<string, any> | null;
    attributesEn?: Record<string, any> | null;
}

export const variantService = {
    // دریافت لیست AttributeDefinitionها
    getAttributeDefinitions: (filter: any) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filter || {})
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
        );
        const queryString = new URLSearchParams(cleanFilters).toString();
        return apiClient.get<AllAttributeDefinition>(`${BASE_URL}/attribute-definition?${queryString}`);
    },

    // ایجاد AttributeDefinition
    createAttributeDefinition: (data: CreateAttributeDefinitionDTO) => {
        return apiClient.post<AttributeDefinition>(`${BASE_URL}/attribute-definition`, data);
    },

    // ویرایش AttributeDefinition
    updateAttributeDefinition: ({ id, data }: { data: CreateAttributeDefinitionDTO, id: string }) => {
        return apiClient.put<AttributeDefinition>(`${BASE_URL}/attribute-definition/${id}`, data);
    },

    // حذف AttributeDefinition
    deleteAttributeDefinition: (id: string) => {
        return apiClient.delete<{ message: string }>(`${BASE_URL}/attribute-definition/${id}`);
    },

    // دریافت لیست Variantهای یک محصول
    getByProduct: (productId?: string) => {
        return apiClient.get<VariantEntity[]>(`${BASE_URL}/${productId}`);
    },

    // ایجاد Variant محصول
    create: (data: CreateVariantDTO) => {
        return apiClient.post<VariantEntity>(BASE_URL, data);
    },

    // ویرایش Variant
    update: (id: string, data: UpdateVariantDTO) => {
        return apiClient.put<VariantEntity>(`${BASE_URL}/${id}`, data);
    },

    // حذف Variant
    delete: (id: string) => {
        return apiClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
    },
};