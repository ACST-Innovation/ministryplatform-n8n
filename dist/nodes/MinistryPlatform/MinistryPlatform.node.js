"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinistryPlatform = void 0;
const GenericFunctions_1 = require("./GenericFunctions");
class MinistryPlatform {
    description = {
        displayName: 'MinistryPlatform',
        name: 'ministryPlatform',
        icon: 'file:ministryplatform.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["tableName"]}}',
        description: 'Consume MinistryPlatform API',
        defaults: {
            name: 'MinistryPlatform',
        },
        inputs: ["main" /* NodeConnectionType.Main */],
        outputs: ["main" /* NodeConnectionType.Main */],
        credentials: [
            {
                name: 'ministryPlatformOAuth2Api',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Create',
                        value: 'create',
                        action: 'Create a record',
                    },
                    {
                        name: 'Get',
                        value: 'get',
                        action: 'Get a record',
                    },
                    {
                        name: 'List',
                        value: 'list',
                        action: 'List records',
                    },
                    {
                        name: 'Update',
                        value: 'update',
                        action: 'Update a record',
                    },
                    {
                        name: 'Delete',
                        value: 'delete',
                        action: 'Delete a record',
                    },
                    {
                        name: 'Refresh Authentication',
                        value: 'refreshAuth',
                        action: 'Refresh OAuth2 authentication token',
                    },
                    {
                        name: 'Test Token Endpoint',
                        value: 'testTokenEndpoint',
                        action: 'Test the OAuth2 token endpoint URL',
                    },
                ],
                default: 'get',
            },
            {
                displayName: 'Table Name',
                name: 'tableName',
                type: 'string',
                default: '',
                placeholder: 'Contacts',
                description: 'Name of the MinistryPlatform table to interact with',
            },
            {
                displayName: 'Record ID',
                name: 'recordId',
                type: 'string',
                displayOptions: {
                    show: {
                        operation: ['get', 'update', 'delete'],
                    },
                },
                default: '',
                description: 'ID of the record to retrieve, update, or delete',
            },
            {
                displayName: 'Fields',
                name: 'fields',
                placeholder: 'Add Field',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                displayOptions: {
                    show: {
                        operation: ['create', 'update'],
                    },
                },
                default: {},
                options: [
                    {
                        name: 'field',
                        displayName: 'Field',
                        values: [
                            {
                                displayName: 'Field Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                description: 'Name of the field',
                            },
                            {
                                displayName: 'Field Value',
                                name: 'value',
                                type: 'string',
                                default: '',
                                description: 'Value of the field',
                            },
                        ],
                    },
                ],
            },
            {
                displayName: 'Additional Fields',
                name: 'additionalFields',
                type: 'collection',
                placeholder: 'Add Field',
                default: {},
                displayOptions: {
                    show: {
                        operation: ['list'],
                    },
                },
                options: [
                    {
                        displayName: 'Select',
                        name: 'select',
                        type: 'string',
                        default: '',
                        description: 'Comma-separated list of fields to select',
                    },
                    {
                        displayName: 'Filter',
                        name: 'filter',
                        type: 'string',
                        default: '',
                        description: 'MS SQL WHERE clause syntax (e.g., "Contact_ID > 1000", "Email_Address=\'user@example.com\'")',
                    },
                    {
                        displayName: 'Order By',
                        name: 'orderby',
                        type: 'string',
                        default: '',
                        description: 'Field to order results by (e.g., "Display_Name asc")',
                    },
                    {
                        displayName: 'Group By',
                        name: 'groupby',
                        type: 'string',
                        default: '',
                        description: 'Field to group results by',
                    },
                    {
                        displayName: 'Having',
                        name: 'having',
                        type: 'string',
                        default: '',
                        description: 'Having clause for grouped results',
                    },
                    {
                        displayName: 'Top',
                        name: 'top',
                        type: 'number',
                        default: 100,
                        description: 'Maximum number of records to return',
                    },
                    {
                        displayName: 'Skip',
                        name: 'skip',
                        type: 'number',
                        default: 0,
                        description: 'Number of records to skip for pagination',
                    },
                    {
                        displayName: 'Distinct',
                        name: 'distinct',
                        type: 'boolean',
                        default: false,
                        description: 'Return only distinct records',
                    },
                    {
                        displayName: 'User ID',
                        name: 'userId',
                        type: 'number',
                        default: 0,
                        description: 'User ID for context-sensitive queries',
                    },
                    {
                        displayName: 'Global Filter ID',
                        name: 'globalFilterId',
                        type: 'number',
                        default: 0,
                        description: 'Global filter ID to apply',
                    },
                ],
            },
        ],
    };
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const operation = this.getNodeParameter('operation', 0);
        for (let i = 0; i < items.length; i++) {
            try {
                let responseData;
                const tableName = this.getNodeParameter('tableName', i);
                if (operation === 'create') {
                    const fields = this.getNodeParameter('fields.field', i, []);
                    const body = {};
                    fields.forEach(field => {
                        body[field.name] = field.value;
                    });
                    responseData = await GenericFunctions_1.ministryPlatformApiRequest.call(this, 'POST', `/tables/${tableName}`, body);
                }
                else if (operation === 'get') {
                    const recordId = this.getNodeParameter('recordId', i);
                    responseData = await GenericFunctions_1.ministryPlatformApiRequest.call(this, 'GET', `/tables/${tableName}/${recordId}`);
                }
                else if (operation === 'list') {
                    const additionalFields = this.getNodeParameter('additionalFields', i);
                    const qs = {};
                    if (additionalFields.select)
                        qs.$select = additionalFields.select;
                    if (additionalFields.filter)
                        qs.$filter = additionalFields.filter;
                    if (additionalFields.orderby)
                        qs.$orderby = additionalFields.orderby;
                    if (additionalFields.groupby)
                        qs.$groupby = additionalFields.groupby;
                    if (additionalFields.having)
                        qs.$having = additionalFields.having;
                    if (additionalFields.top)
                        qs.$top = additionalFields.top;
                    if (additionalFields.skip)
                        qs.$skip = additionalFields.skip;
                    if (additionalFields.distinct)
                        qs.$distinct = additionalFields.distinct;
                    if (additionalFields.userId)
                        qs.$userId = additionalFields.userId;
                    if (additionalFields.globalFilterId)
                        qs.$globalFilterId = additionalFields.globalFilterId;
                    responseData = await GenericFunctions_1.ministryPlatformApiRequestAllItems.call(this, 'GET', `/tables/${tableName}`, {}, qs);
                }
                else if (operation === 'update') {
                    const recordId = this.getNodeParameter('recordId', i);
                    const fields = this.getNodeParameter('fields.field', i, []);
                    const body = {};
                    fields.forEach(field => {
                        body[field.name] = field.value;
                    });
                    responseData = await GenericFunctions_1.ministryPlatformApiRequest.call(this, 'PUT', `/tables/${tableName}/${recordId}`, body);
                }
                else if (operation === 'delete') {
                    const recordId = this.getNodeParameter('recordId', i);
                    responseData = await GenericFunctions_1.ministryPlatformApiRequest.call(this, 'DELETE', `/tables/${tableName}/${recordId}`);
                }
                else if (operation === 'refreshAuth') {
                    // Check credential details and try refresh
                    try {
                        const credentials = await this.getCredentials('ministryPlatformOAuth2Api');
                        const oauthData = credentials.oauthTokenData;
                        responseData = {
                            hasRefreshToken: !!(oauthData?.refresh_token),
                            tokenExpiresAt: oauthData?.expires_at || 'N/A',
                            currentTime: new Date().toISOString(),
                            scope: credentials.scope || 'N/A',
                        };
                        // Try the API call
                        const testResponse = await GenericFunctions_1.ministryPlatformApiRequest.call(this, 'GET', '/tables');
                        responseData = {
                            ...responseData,
                            success: true,
                            message: 'Token is still valid or was automatically refreshed',
                            refreshedAt: new Date().toISOString(),
                            tablesCount: Array.isArray(testResponse) ? testResponse.length : 'N/A',
                        };
                    }
                    catch (error) {
                        const hasRefreshToken = responseData?.hasRefreshToken || false;
                        responseData = {
                            ...responseData,
                            success: false,
                            message: hasRefreshToken
                                ? 'Token refresh failed - refresh token may be expired'
                                : 'No refresh token available - MinistryPlatform did not issue a refresh token',
                            error: error.message,
                            refreshedAt: new Date().toISOString(),
                            suggestion: hasRefreshToken
                                ? 'Please reconnect your MinistryPlatform OAuth2 credentials manually - the refresh token may have expired'
                                : 'Please reconnect your credentials AND check your MinistryPlatform OAuth2 app configuration to ensure it issues refresh tokens',
                            nextSteps: hasRefreshToken
                                ? ['Reconnect credentials in n8n']
                                : [
                                    'Reconnect credentials in n8n',
                                    'Check MinistryPlatform OAuth app settings',
                                    'Verify grant types include "Authorization Code" and "Refresh Token"',
                                    'Ensure offline_access scope is properly configured in MinistryPlatform'
                                ]
                        };
                    }
                }
                else if (operation === 'testTokenEndpoint') {
                    // Test the token endpoint with a manual refresh token request
                    try {
                        const credentials = await this.getCredentials('ministryPlatformOAuth2Api');
                        const oauthData = credentials.oauthTokenData;
                        if (!oauthData?.refresh_token) {
                            responseData = {
                                success: false,
                                message: 'No refresh token available to test with',
                                suggestion: 'Reconnect credentials first to get a refresh token'
                            };
                        }
                        else {
                            // Test different possible token URLs
                            const testUrls = [
                                credentials.accessTokenUrl, // Current configured URL
                                `${credentials.environmentUrl}/oauth/connect/token`, // Without /ministryplatformapi
                                `${credentials.environmentUrl}/ministryplatformapi/oauth/connect/token`, // With /ministryplatformapi
                            ];
                            const results = [];
                            for (const tokenUrl of testUrls) {
                                try {
                                    const bodyParams = [
                                        `grant_type=refresh_token`,
                                        `refresh_token=${encodeURIComponent(oauthData.refresh_token)}`,
                                        `client_id=${encodeURIComponent(credentials.clientId)}`,
                                        `client_secret=${encodeURIComponent(credentials.clientSecret)}`,
                                    ].join('&');
                                    const response = await this.helpers.httpRequest({
                                        url: tokenUrl,
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                        },
                                        body: bodyParams,
                                    });
                                    results.push({
                                        url: tokenUrl,
                                        success: true,
                                        hasAccessToken: !!response.access_token,
                                        response: response
                                    });
                                }
                                catch (error) {
                                    results.push({
                                        url: tokenUrl,
                                        success: false,
                                        error: error.message,
                                        statusCode: error.response?.status,
                                        responseBody: error.response?.data
                                    });
                                }
                            }
                            responseData = {
                                success: true,
                                message: 'Token endpoint testing completed',
                                testResults: results,
                                recommendation: results.find(r => r.success)?.url || 'No working URL found'
                            };
                        }
                    }
                    catch (error) {
                        responseData = {
                            success: false,
                            message: 'Token endpoint test failed',
                            error: error.message,
                        };
                    }
                }
                const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), { itemData: { item: i } });
                returnData.push(...executionData);
            }
            catch (error) {
                if (this.continueOnFail()) {
                    const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                    returnData.push(...executionData);
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.MinistryPlatform = MinistryPlatform;
