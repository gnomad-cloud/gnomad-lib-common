export interface I_Authenticator {
    connect(): void;
}

export interface I_Entitlement {
    grant(subject: string, permission: string): void;
    revoke(subject: string, permission: string): void;
    forget(subject: string): void;
}

