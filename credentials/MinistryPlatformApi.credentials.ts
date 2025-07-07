import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
	ICredentialTestFunctions,
	IRequestOptions,
	INodeCredentialTestResult,
} from 'n8n-workflow';

export class MinistryPlatformApi implements ICredentialType {
	name = 'ministryPlatformApi';
	displayName = 'MinistryPlatform API';
	documentationUrl = 'https://help.acst.com/en/ministryplatform/developer-resources/developer-resources';
	icon: Icon = 'file:ministryplatform.svg';
	properties: INodeProperties[] = [
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
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test = {
		request: {
			baseURL: '={{$credentials.baseUrl}}/ministryplatformapi',
			url: '/tables',
		},
		async test(
			this: ICredentialTestFunctions,
			credentials: any,
		): Promise<INodeCredentialTestResult> {
			const baseUrl = credentials.baseUrl as string;
			const clientId = credentials.clientId as string;
			const clientSecret = credentials.clientSecret as string;
			const scope = credentials.scope as string;
			
			// Test token request
			const tokenUrl = `${baseUrl}/ministryplatformapi/oauth/connect/token`;
			const tokenBody = [
				`client_id=${encodeURIComponent(clientId)}`,
				`client_secret=${encodeURIComponent(clientSecret)}`,
				`grant_type=client_credentials`,
				`scope=${encodeURIComponent(scope)}`,
			].join('&');
			
			const tokenOptions: IRequestOptions = {
				method: 'POST',
				url: tokenUrl,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: tokenBody,
			};
			
			// Log the token request
			this.logger.info('MP Token Request', {
				url: tokenUrl,
				method: 'POST',
				headers: tokenOptions.headers,
				body: tokenBody,
			});
			
			try {
				const tokenResponse = await this.helpers.request(tokenOptions);
				
				// Log the token response
				this.logger.info('MP Token Response', {
					success: true,
					hasAccessToken: !!tokenResponse.access_token,
					expiresIn: tokenResponse.expires_in,
					tokenType: tokenResponse.token_type,
				});
				
				if (!tokenResponse.access_token) {
					return {
						status: 'Error',
						message: 'No access token received',
					};
				}
				
				// Test API request with token
				const apiUrl = `${baseUrl}/ministryplatformapi/tables`;
				const apiOptions: IRequestOptions = {
					method: 'GET',
					url: apiUrl,
					headers: {
						'Authorization': `Bearer ${tokenResponse.access_token}`,
						'Content-Type': 'application/json',
					},
				};
				
				// Log the API request
				this.logger.info('MP API Request', {
					url: apiUrl,
					method: 'GET',
					headers: apiOptions.headers,
				});
				
				const apiResponse = await this.helpers.request(apiOptions);
				
				// Log the API response
				this.logger.info('MP API Response', {
					success: true,
					responseType: typeof apiResponse,
					isArray: Array.isArray(apiResponse),
					length: Array.isArray(apiResponse) ? apiResponse.length : 'not array',
				});
				
				return {
					status: 'OK',
					message: 'Authentication successful',
				};
				
			} catch (error: any) {
				// Log the error
				this.logger.error('MP Test Error', {
					url: tokenUrl,
					error: error.message,
					statusCode: error.response?.status,
					responseData: error.response?.data,
				});
				
				return {
					status: 'Error',
					message: `Authentication failed: ${error.message}`,
				};
			}
		}
	};
}
