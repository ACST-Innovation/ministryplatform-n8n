"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinistryPlatformApi = void 0;
class MinistryPlatformApi {
    name = 'ministryPlatformApi';
    displayName = 'MinistryPlatform API';
    documentationUrl = 'https://help.acst.com/en/ministryplatform/developer-resources/developer-resources';
    icon = 'file:ministryplatform.svg';
    properties = [
        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: '',
            placeholder: 'https://your-instance.ministryplatform.com',
            description: 'The base URL for your MinistryPlatform environment',
        },
        {
            displayName: 'Client ID',
            name: 'clientId',
            type: 'string',
            default: '',
        },
        {
            displayName: 'Client Secret',
            name: 'clientSecret',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
        },
        {
            displayName: 'Scope',
            name: 'scope',
            type: 'string',
            default: 'http://www.thinkministry.com/dataplatform/scopes/all',
            description: 'OAuth2 scope for API access',
        },
    ];
    // This will be handled dynamically in GenericFunctions
    authenticate = {
        type: 'generic',
        properties: {},
    };
    test = {
        request: {
            baseURL: '={{$credentials.baseUrl}}/ministryplatformapi',
            url: '/tables',
        },
    };
}
exports.MinistryPlatformApi = MinistryPlatformApi;
