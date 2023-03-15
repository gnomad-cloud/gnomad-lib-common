const debug = require("debug")("gnomad:auth:keycloak")

import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { I_Authenticator, I_Entitlement, I_JWT } from ".";

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "";
if (!KEYCLOAK_URL) throw new Error("missing KEYCLOAK_URL");

const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || "";
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || "";
if (!KEYCLOAK_CLIENT_ID || !KEYCLOAK_CLIENT_SECRET) throw new Error("missing KEYCLOAK_CLIENT_ID or KEYCLOAK_CLIENT_SECRET");
debug("keycloak.client: %s -> %s", KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET ? true : false)

export class KeycloakAuthenticator implements I_Entitlement, I_Authenticator {
    
    api: KeycloakAdminClient;
    
    constructor(protected realm: string) {
        this.api = new KeycloakAdminClient({
            baseUrl: KEYCLOAK_URL,
            realmName: realm,
        });
        if (KEYCLOAK_URL) this.connect();
    }

    async grant(jwt: I_JWT, permission: string) {
        return await this.addToGroup(permission, jwt.sub);
    }

    async revoke(jwt: I_JWT, permission: string) {
        return this.removeFromGroup(permission, jwt.sub);
    }

    async forget(jwt: I_JWT) {
        const user = await this.api.users.findOne( {id: jwt.sub });
        if (!user) return Promise.reject({ error: true, subject: jwt.sub});
        if (user.groups) {
            for(var i=0;i<user.groups.length;i++) {
                var ug = user.groups[i];
                await this.removeFromGroup(jwt.sub,ug);
            }
        }
        return Promise.resolve({ id: jwt.sub });
    }

    allowed(jwt: I_JWT, permission: string): Promise<boolean> {
        if (jwt==null||!jwt.sub) return Promise.resolve(false);
        const now = Date.now();
        if (jwt.nbf<now) return Promise.resolve(false);
        // TODO: implement authentication checks
        return Promise.resolve(true);
    }

    async connect(): Promise<I_Authenticator> {
        this.api.auth({
            grantType: 'client_credentials',
            clientId: KEYCLOAK_CLIENT_ID,
            clientSecret: KEYCLOAK_CLIENT_SECRET,
        });
        return this;
    }

    disconnect(): void {
    }

    async addToGroup(_group: string, _user: string) {
        await this.ensureGroup(_group);
        await this.api.users.addToGroup( { id: _user, groupId: _group, realm: this.realm })
        return this;
    }
    
    async removeFromGroup(_group: string, _user: string) {
        await this.api.users.delFromGroup( { id: _user, groupId: _group, realm: this.realm })
        return this;
    }

    async findGroup(id: string): Promise<GroupRepresentation> {
        let realm = this.realm;
        let found: GroupRepresentation[]|null = await this.api.groups.find({ search: id, realm });
        if (!found || found.length==0) return Promise.reject( { error: true, message: "group find failed: ", name: id, realm });
        if (!found[0] || !found[0].id || id != found[0].id)
            return Promise.reject( { error: true, message: "found invalid group: ", name: id, realm});
        return found[0]
    }

    async ensureGroup(id: string): Promise<GroupRepresentation> {
        let realm = this.realm;
        let found: GroupRepresentation[]|null = await this.api.groups.find({ search: id, realm });
        debug("keycloak.group.found: %s -> %o", id, found);
        if (found && found[0] && found[0].id == id) return Promise.resolve(found[0]);
        const _created = await this.api.groups.create( { id, name: id, realm: this.realm })
        found = _created.id?await this.api.groups.find({ search: id, realm }):null;
        if (found && found[0] && found[0].id == id) return Promise.resolve(found[0]);
        return Promise.reject( { error: true, message: "esnure group failed: ", name: id, realm});
    }

    async createGroup(group: GroupRepresentation): Promise<GroupRepresentation> {
        let id = group.id || group.name;
        let realm = this.realm;
        debug("keycloak.group: %s -> %o", id, group);
        if (!id || !group.name)
            return Promise.reject( { error: true, message: "group not named/identified", name: id, realm});

        let found: GroupRepresentation[]|null = await this.api.groups.find({ search: id, realm });
        debug("keycloak.group.found: %s -> %o", id, found);
        if (!found || found.length==0) {
            debug("keycloak.group.create: %o", group);
            const {id} = await this.api.groups.create(group);
            found = group.id?await this.api.groups.find({ search: group.name, realm }):null;
            debug("keycloak.group.create.found: %o", found);
        }
        if (!found || !found[0] || !found[0].id)
            return Promise.reject( { error: true, message: "group created failed: ", name: id, realm});

        id = found[0].id;
        await this.api.groups.update({id, realm}, group);
        return Promise.resolve(group)
    }
}

