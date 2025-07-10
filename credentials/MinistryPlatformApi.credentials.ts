import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
	ICredentialDataDecryptedObject,
	IHttpRequestHelper,
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
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'hidden',
			default: '',
			typeOptions: {
				expirable: true,
			},
		},
	];

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		const tokenResponse = await this.helpers.httpRequest({
			method: 'POST',
			url: `${credentials.baseUrl}/ministryplatformapi/oauth/connect/token`,
			body: {
				grant_type: 'client_credentials',
				client_id: credentials.clientId,
				client_secret: credentials.clientSecret,
				scope: credentials.scope,
			},
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
		
		return { accessToken: tokenResponse.access_token };
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Authorization': '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
	request: {
	 baseURL: '={{$credentials.baseUrl}}/ministryplatformapi',
	  url: '/tables',
	},
	};
}
