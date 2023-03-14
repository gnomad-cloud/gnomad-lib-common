export interface I_CloudEvent {
    type: string;
    source: string;
    id: string;
    data: any;
}

export interface I_Broker {
    fire(event: I_CloudEvent): Promise<unknown>
}

export { EventBroker } from "./cloud"
export { ProxyBroker } from "./proxy"