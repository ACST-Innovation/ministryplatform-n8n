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
	} catch (error) {
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
