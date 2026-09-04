import { apiClient } from "@/lib/api-client";

const BASE_URL = "/province";
const BASE_URL_CITY = BASE_URL + "/city";

export interface CityEntity {
    id: string;
    name: string;
    nameEn: string;
    provinceId: string;
    province: { id: string; name: string };
    projects: unknown[][];
    contractors: unknown[][];
}

export interface CityofProvince {
    id: string;
    name: string;
    nameEn: string;
    provinceId: string;
}

export interface CreateCityDto {
    name: string;
    nameEn: string;
    provinceId: string;
}
export interface CityEntity {
    id: string;
    name: string;
    nameEn: string;
    [key: string]: unknown;
}

export interface ProvinceEntity {
    id: string;
    name: string;
    nameEn: string;
}

export interface CreateProvinceDto {
    name: string;
    nameEn: string;
}

export const provinceService = {
    listProvince: () => {
        return apiClient.get<ProvinceEntity[]>(BASE_URL);
    },

    createProvince: (data: CreateProvinceDto) => {
        return apiClient.post<ProvinceEntity>(BASE_URL, data);
    },

    updateProvince: (id: string, data: CreateProvinceDto) => {
        return apiClient.put<ProvinceEntity>(`${BASE_URL}/${id}`, data);
    },

    deleteProvince: (id: string) => {
        console.log(`${BASE_URL}/${id}`);
        return apiClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
    },

    listCity: () => {
        return apiClient.get<CityEntity[]>(BASE_URL_CITY);
    },

    getByIdCity: (id?: string) => {        
        return apiClient.get<CityofProvince[]>(`${BASE_URL_CITY}?idProvince=${id}`);
    },

    createCity: (data: CreateCityDto) => {
        return apiClient.post<CityEntity>(BASE_URL_CITY, data);
    },

    updateCity: (id: string, data: CreateCityDto) => {
        return apiClient.put<CityEntity>(`${BASE_URL_CITY}/${id}`, data);
    },

    deleteCity: (id: string) => {
        console.log(`${BASE_URL_CITY}/${id}`);

        return apiClient.delete<{ message: string }>(`${BASE_URL_CITY}/${id}`);
    },
};
