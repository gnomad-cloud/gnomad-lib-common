export interface I_Authenticator {
    connect(): void;
}

export interface I_Entitlement {
    allowed(jwt: I_JWT, permission: string): Promise<boolean>;

    grant(jwt: I_JWT, permission: string): Promise<any>;
    revoke(jwt: I_JWT, permission: string): Promise<any>;
    forget(jwt: I_JWT): Promise<any>;
}

export interface I_JWT {
    sub: string;
    aud: string;
    nbf: number;
}