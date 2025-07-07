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
        async test(credentials) {
            const baseUrl = credentials.baseUrl;
            const clientId = credentials.clientId;
            const clientSecret = credentials.clientSecret;
            const scope = credentials.scope;
            // Test token request
            const tokenUrl = `${baseUrl}/ministryplatformapi/oauth/connect/token`;
            const tokenBody = [
                `client_id=${encodeURIComponent(clientId)}`,
                `client_secret=${encodeURIComponent(clientSecret)}`,
                `grant_type=client_credentials`,
                `scope=${encodeURIComponent(scope)}`,
            ].join('&');
            const tokenOptions = {
                method: 'POST',
                url: tokenUrl,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: tokenBody,
            };
            try {
                const tokenResponse = await this.helpers.request(tokenOptions);
                if (!tokenResponse.access_token) {
                    return {
                        status: 'Error',
                        message: `No access token received. Request: ${JSON.stringify({
                            url: tokenUrl,
                            headers: tokenOptions.headers,
                            body: tokenBody,
                        }, null, 2)}`,
                    };
                }
                // Test API request with token
                const apiUrl = `${baseUrl}/ministryplatformapi/tables`;
                const apiOptions = {
                    method: 'GET',
                    url: apiUrl,
                    headers: {
                        'Authorization': `Bearer ${tokenResponse.access_token}`,
                        'Content-Type': 'application/json',
                    },
                };
                await this.helpers.request(apiOptions);
                return {
                    status: 'OK',
                    message: 'Authentication successful',
                };
            }
            catch (error) {
                const debugInfo = {
                    tokenRequest: {
                        url: tokenUrl,
                        method: 'POST',
                        headers: tokenOptions.headers,
                        body: tokenBody,
                    },
                    error: {
                        message: error.message,
                        statusCode: error.response?.status,
                        responseData: error.response?.data,
                        responseHeaders: error.response?.headers,
                    }
                };
                return {
                    status: 'Error',
                    message: `Authentication failed: ${error.message}\n\nDEBUG INFO:\n${JSON.stringify(debugInfo, null, 2)}`,
                };
            }
        }
    };
}
exports.MinistryPlatformApi = MinistryPlatformApi;
