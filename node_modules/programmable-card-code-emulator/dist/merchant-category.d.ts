export interface MerchantCategory {
    key: string;
    code: string;
    name: string;
}
export declare const merchantCategories: MerchantCategory[];
/** Find a merchant category by code */
export declare const merchantCategoryFromCode: (code: string) => MerchantCategory;
/** Find a merchant category by key */
export declare const merchantCategoryFromKey: (key: string) => MerchantCategory | undefined;
//# sourceMappingURL=merchant-category.d.ts.map