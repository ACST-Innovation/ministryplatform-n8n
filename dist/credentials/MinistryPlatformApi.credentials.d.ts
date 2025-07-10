import { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties, Icon, ICredentialDataDecryptedObject, IHttpRequestHelper } from 'n8n-workflow';
export declare class MinistryPlatformApi implements ICredentialType {
    name: string;
    displayName: string;
    documentationUrl: string;
    icon: Icon;
    properties: INodeProperties[];
    preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject): Promise<{
        accessToken: any;
    }>;
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
}
