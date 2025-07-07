import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

export async function ministryPlatformApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: any = {},
	qs: any = {},
	uri?: string,
	option: any = {},
	isRetry: boolean = false,
): Promise<any> {
	const credentials = await this.getCredentials('ministryPlatformOAuth2Api');
	
	const options: IRequestOptions = {
		method,
		qs,
		body,
		uri: uri || `${credentials.environmentUrl}/ministryplatformapi${resource}`,
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	try {
		return await this.helpers.requestOAuth2.call(this, 'ministryPlatformOAuth2Api', options);
	} catch (error: any) {
		const errorMessage = error.message || '';
		const responseData = error.response?.data || {};
		const responseMessage = responseData.Message || responseData.message || '';
		
		// Check if this is a token expiration error
		const isTokenExpired = errorMessage.includes('token is expired') || 
			errorMessage.includes('IDX10223') || 
			responseMessage.includes('token is expired') ||
			responseMessage.includes('IDX10223');

		// If token is expired and this is not a retry, attempt automatic refresh
		if (isTokenExpired && !isRetry && error.response?.status === 500) {
			try {
				// Try using OAuth2 refresh via a fresh request
				const freshOptions: IRequestOptions = {
					...options,
					headers: {
						...options.headers,
						// Remove the old Authorization header to force refresh
					},
				};
				delete freshOptions.headers?.Authorization;
				
				// Make a fresh OAuth2 request which should trigger refresh
				return await this.helpers.requestOAuth2.call(this, 'ministryPlatformOAuth2Api', freshOptions);
			} catch (retryError: any) {
				// If retry fails, provide user-friendly error message
				throw new NodeOperationError(this.getNode(), 
					`OAuth2 token has expired and refresh failed: ${retryError.message}. Please reconnect your MinistryPlatform credentials in n8n.`, 
					{ 
						description: 'The access token has expired and automatic refresh failed. This may indicate the refresh token has also expired. Please reconnect your credentials manually.'
					}
				);
			}
		}
		
		// Handle token expiration on retry or other scenarios
		if (isTokenExpired) {
			throw new NodeOperationError(this.getNode(), 
				'OAuth2 token has expired. Please reconnect your MinistryPlatform credentials in n8n to refresh the token.', 
				{ 
					description: 'The access token has expired and needs to be refreshed. Go to your credentials and reconnect to MinistryPlatform.'
				}
			);
		}
		
		// Handle other authentication errors
		if (error.response?.status === 401 || error.response?.status === 403) {
			throw new NodeOperationError(this.getNode(), 
				'Authentication failed. Please check your MinistryPlatform credentials.', 
				{ 
					description: 'The request was unauthorized. Verify your OAuth2 credentials are correct and active.'
				}
			);
		}
		
		// Handle 500 errors with more specific messaging
		if (error.response?.status === 500) {
			throw new NodeOperationError(this.getNode(), 
				`MinistryPlatform server error: ${responseMessage || errorMessage || 'Internal server error'}`, 
				{ 
					description: 'The MinistryPlatform server returned an error. Check your request parameters and try again.'
				}
			);
		}
		
		throw new NodeApiError(this.getNode(), error as any);
	}
}

export async function ministryPlatformApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	query: any = {},
): Promise<any> {
	// If user specified a $top value, respect it and don't paginate
	if (query.$top) {
		return await ministryPlatformApiRequest.call(this, method, endpoint, body, query);
	}

	// Otherwise, paginate through all results
	const returnData: any[] = [];
	let responseData;
	const pageSize = 100;
	let skip = query.$skip || 0;
	const originalSkip = skip;

	do {
		const paginatedQuery = { ...query, $top: pageSize, $skip: skip };
		responseData = await ministryPlatformApiRequest.call(this, method, endpoint, body, paginatedQuery);
		
		if (Array.isArray(responseData)) {
			returnData.push.apply(returnData, responseData);
		} else if (responseData.value && Array.isArray(responseData.value)) {
			returnData.push.apply(returnData, responseData.value);
		} else {
			returnData.push(responseData);
			break;
		}

		skip += pageSize;
	} while (
		responseData.length === pageSize || 
		(responseData.value && responseData.value.length === pageSize)
	);

	return returnData;
}
