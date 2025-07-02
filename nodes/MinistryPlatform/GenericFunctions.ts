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
