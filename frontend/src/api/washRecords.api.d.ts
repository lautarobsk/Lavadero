import { AxiosResponse } from 'axios';

export declare const getAllWashRecords: (dateOrParams?: string | Record<string, string>) => Promise<AxiosResponse<any>>;
export declare const getServices: () => Promise<AxiosResponse<any>>;
export declare const getEmployees: () => Promise<AxiosResponse<any>>;
export declare const getWashRecord: (id: string | undefined) => Promise<AxiosResponse<any>>;
export declare const updateWashRecord: (id: string | undefined, data: any) => Promise<AxiosResponse<any>>;
export declare const createWashRecord: (data: any) => Promise<AxiosResponse<any>>;
export declare const deleteWashRecord: (id: string | undefined) => Promise<AxiosResponse<any>>;
