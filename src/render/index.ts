export interface I_Templates {
    path: string;
    templates?: string[];
}

export interface I_MyContext {
    my: any;
    meta: any;
    data: any[];
    env: any;
}

export interface I_Renderer {
    template(template: string,  ctx: Record<string,any>): string
}
