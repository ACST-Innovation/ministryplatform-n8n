import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { ministryPlatformApiRequest } from './GenericFunctions';

export class RefreshAuthentication implements INodeType {
	description: INodeTypeDescription = {
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
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				if (operation === 'refreshToken') {
					// Try to make a simple API call - this should trigger automatic refresh if needed
					try {
						const testResponse = await ministryPlatformApiRequest.call(this, 'GET', '/tables');
						
						const executionData = this.helpers.constructExecutionMetaData(
							[{
								json: {
									success: true,
									message: 'Token is still valid or was automatically refreshed',
									refreshedAt: new Date().toISOString(),
									tablesCount: Array.isArray(testResponse) ? testResponse.length : 'N/A',
								},
							}],
							{ itemData: { item: i } },
						);

						returnData.push(...executionData);
					} catch (error: any) {
						// If the API call fails, provide detailed error info
						const executionData = this.helpers.constructExecutionMetaData(
							[{
								json: {
									success: false,
									message: 'Token refresh failed or API call failed',
									error: error.message,
									refreshedAt: new Date().toISOString(),
									suggestion: 'Please reconnect your MinistryPlatform OAuth2 credentials manually',
								},
							}],
							{ itemData: { item: i } },
						);

						returnData.push(...executionData);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						[{
							json: {
								success: false,
								error: (error as Error).message,
								refreshedAt: new Date().toISOString(),
							},
						}],
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
