"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshAuthentication = void 0;
const GenericFunctions_1 = require("./GenericFunctions");
class RefreshAuthentication {
    description = {
        displayName: 'Refresh Authentication',
        name: 'refreshAuthentication',
        icon: 'file:ministryplatform.svg',
        group: ['transform'],
        version: 1,
        subtitle: 'Manually refresh MinistryPlatform OAuth2 tokens',
        description: 'Refresh MinistryPlatform OAuth2 authentication tokens',
        defaults: {
            name: 'Refresh Authentication',
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
                        name: 'Refresh Token',
                        value: 'refreshToken',
                        action: 'Refresh the OAuth2 access token',
                        description: 'Manually refresh the OAuth2 access token using the refresh token',
                    },
                ],
                default: 'refreshToken',
            },
        ],
    };
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const operation = this.getNodeParameter('operation', i);
                if (operation === 'refreshToken') {
                    // Try to make a simple API call - this should trigger automatic refresh if needed
                    try {
                        const testResponse = await GenericFunctions_1.ministryPlatformApiRequest.call(this, 'GET', '/tables');
                        const executionData = this.helpers.constructExecutionMetaData([{
                                json: {
                                    success: true,
                                    message: 'Token is still valid or was automatically refreshed',
                                    refreshedAt: new Date().toISOString(),
                                    tablesCount: Array.isArray(testResponse) ? testResponse.length : 'N/A',
                                },
                            }], { itemData: { item: i } });
                        returnData.push(...executionData);
                    }
                    catch (error) {
                        // If the API call fails, provide detailed error info
                        const executionData = this.helpers.constructExecutionMetaData([{
                                json: {
                                    success: false,
                                    message: 'Token refresh failed or API call failed',
                                    error: error.message,
                                    refreshedAt: new Date().toISOString(),
                                    suggestion: 'Please reconnect your MinistryPlatform OAuth2 credentials manually',
                                },
                            }], { itemData: { item: i } });
                        returnData.push(...executionData);
                    }
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    const executionData = this.helpers.constructExecutionMetaData([{
                            json: {
                                success: false,
                                error: error.message,
                                refreshedAt: new Date().toISOString(),
                            },
                        }], { itemData: { item: i } });
                    returnData.push(...executionData);
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.RefreshAuthentication = RefreshAuthentication;
