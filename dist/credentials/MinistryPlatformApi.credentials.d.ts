import { IAuthenticateGeneric, ICredentialType, INodeProperties, Icon, ICredentialTestFunctions, INodeCredentialTestResult } from 'n8n-workflow';
export declare class MinistryPlatformApi implements ICredentialType {
    name: string;
    displayName: string;
    documentationUrl: string;
    icon: Icon;
    properties: INodeProperties[];
    authenticate: IAuthenticateGeneric;
    test: {
        request: {
            baseURL: string;
            url: string;
        };
        test(this: ICredentialTestFunctions, credentials: any): Promise<INodeCredentialTestResult>;
    };
}
