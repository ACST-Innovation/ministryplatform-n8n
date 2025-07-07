import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

import { Buffer } from 'buffer';
import { LoggerProxy } from 'n8n-workflow';

// In-memory token cache
const tokenCache = new Map<string, {
	access_token: string;
	expires_at: number;
}>();

async function getAccessToken(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
): Promise<string> {
	const credentials = await this.getCredentials('ministryPlatformApi');
	
	const cacheKey = `${credentials.baseUrl}:${credentials.clientId}`;
	const cached = tokenCache.get(cacheKey);
	
	// Check if we have a valid cached token (with 5-minute buffer)
	const now = Date.now();
	const bufferTime = 5 * 60 * 1000; // 5 minutes
	
	if (cached && cached.expires_at > (now + bufferTime)) {
		return cached.access_token;
	}
	
	// Request new token
	const tokenUrl = `${credentials.baseUrl}/ministryplatformapi/oauth/connect/token`;
	
	const bodyParams = [
		`client_id=${encodeURIComponent(credentials.clientId as string)}`,
		`client_secret=${encodeURIComponent(credentials.clientSecret as string)}`,
		`grant_type=client_credentials`,
		`scope=${encodeURIComponent(credentials.scope as string)}`,
	];
	const body = bodyParams.join('&');
	
	const options: IRequestOptions = {
		method: 'POST',
		url: tokenUrl,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body,
	};
	
	// Debug logging
	LoggerProxy.info('MinistryPlatform Token Request', {
		url: tokenUrl,
		method: options.method,
		headers: options.headers,
		body: body,
	});
	
	try {
		const response = await this.helpers.request(options);
		LoggerProxy.info('MinistryPlatform Token Response', {
			success: true,
			hasAccessToken: !!response.access_token,
			expiresIn: response.expires_in,
		});
		
		if (!response.access_token) {
			throw new NodeOperationError(
				this.getNode(),
				`No access token received from MinistryPlatform. Response received: ${JSON.stringify(response, null, 2)}`,
			);
		}
		
		// Cache the token
		const expiresIn = (response.expires_in || 3600) * 1000; // Convert to milliseconds
		const expiresAt = now + expiresIn;
		
		tokenCache.set(cacheKey, {
			access_token: response.access_token,
			expires_at: expiresAt,
		});
		
		return response.access_token;
	} catch (error: any) {
		// Create detailed debug info for the error
		const debugInfo = {
			url: tokenUrl,
			method: 'POST',
			headers: options.headers,
			body: body,
			status: error.response?.status,
			responseData: error.response?.data,
			originalError: error.message
		};
		
		throw new NodeOperationError(
			this.getNode(),
			`MinistryPlatform Token Request Failed: ${JSON.stringify(debugInfo, null, 2)}`
		);
	}
}

export async function ministryPlatformApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: any = {},
	qs: any = {},
): Promise<any> {
	const credentials = await this.getCredentials('ministryPlatformApi');
	
	// Get access token (from cache or fresh request)
	const accessToken = await getAccessToken.call(this);
	
	const options: IRequestOptions = {
		method,
		qs,
		body,
		url: `${credentials.baseUrl}/ministryplatformapi${resource}`,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	try {
		return await this.helpers.request(options);
	} catch (error: any) {
		// If we get a 401, clear the cache and try once more with a fresh token
		if (error.response?.status === 401) {
			const cacheKey = `${credentials.baseUrl}:${credentials.clientId}`;
			tokenCache.delete(cacheKey);
			
			try {
				const freshToken = await getAccessToken.call(this);
				options.headers!.Authorization = `Bearer ${freshToken}`;
				return await this.helpers.request(options);
			} catch (retryError: any) {
				throw new NodeApiError(this.getNode(), retryError);
			}
		}
		
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function ministryPlatformApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	query: any = {},
): Promise<any> {
	const returnData: any[] = [];

	let responseData;
	query.$top = query.$top || 100;
	let skip = 0;

	do {
		query.$skip = skip;
		responseData = await ministryPlatformApiRequest.call(this, method, endpoint, body, query);
		
		if (Array.isArray(responseData)) {
			returnData.push.apply(returnData, responseData);
		} else if (responseData.value && Array.isArray(responseData.value)) {
			returnData.push.apply(returnData, responseData.value);
		} else {
			returnData.push(responseData);
		}

		skip += query.$top;
	} while (
		responseData.length === query.$top || 
		(responseData.value && responseData.value.length === query.$top)
	);

	return returnData;
}
