"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinistryPlatformOAuth2Api = void 0;
class MinistryPlatformOAuth2Api {
    constructor() {
        this.name = 'ministryPlatformOAuth2Api';
        this.extends = ['oAuth2Api'];
        this.displayName = 'MinistryPlatform OAuth2 API';
        this.documentationUrl = 'https://www.ministryplatform.com/';
        this.properties = [
            {
                displayName: 'Grant Type',
                name: 'grantType',
                type: 'hidden',
                default: 'authorizationCode',
            },
            {
                displayName: 'Environment URL',
                name: 'environmentUrl',
                type: 'string',
                default: '',
                placeholder: 'https://your-instance.ministryplatform.com',
                description: 'The base URL for your MinistryPlatform environment',
            },
            {
                displayName: 'Authorization URL',
                name: 'authUrl',
                type: 'string',
                default: '',
                placeholder: 'https://your-instance.ministryplatform.com/ministryplatformapi/oauth/connect/authorize',
                description: 'Copy your Environment URL above and add: /ministryplatformapi/oauth/connect/authorize',
            },
            {
                displayName: 'Access Token URL',
                name: 'accessTokenUrl',
                type: 'string',
                default: '',
                placeholder: 'https://your-instance.ministryplatform.com/ministryplatformapi/oauth/connect/token',
                description: 'Copy your Environment URL above and add: /ministryplatformapi/oauth/connect/token',
            },
            {
                displayName: 'Scope',
                name: 'scope',
                type: 'hidden',
                default: 'http://www.thinkministry.com/dataplatform/scopes/all offline_access',
            },
            {
                displayName: 'Use Refresh Token',
                name: 'useRefreshToken',
                type: 'hidden',
                default: true,
            },
            {
                displayName: 'Auth URI Query Parameters',
                name: 'authQueryParameters',
                type: 'hidden',
                default: '',
            },
            {
                displayName: 'Authentication',
                name: 'authentication',
                type: 'hidden',
                default: 'body',
            },
            {
                displayName: 'Token Request Method',
                name: 'tokenRequestMethod',
                type: 'hidden',
                default: 'POST',
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
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '=Bearer {{$credentials.oauthTokenData.access_token}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.environmentUrl}}/ministryplatformapi',
                url: '/tables',
            },
        };
    }
}
exports.MinistryPlatformOAuth2Api = MinistryPlatformOAuth2Api;
