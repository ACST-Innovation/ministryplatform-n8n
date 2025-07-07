"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ministryPlatformApiRequest = ministryPlatformApiRequest;
exports.ministryPlatformApiRequestAllItems = ministryPlatformApiRequestAllItems;
const n8n_workflow_1 = require("n8n-workflow");
const n8n_workflow_2 = require("n8n-workflow");
// In-memory token cache
const tokenCache = new Map();
async function getAccessToken() {
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
        `client_id=${encodeURIComponent(credentials.clientId)}`,
        `client_secret=${encodeURIComponent(credentials.clientSecret)}`,
        `grant_type=client_credentials`,
        `scope=${encodeURIComponent(credentials.scope)}`,
    ];
    const body = bodyParams.join('&');
    const options = {
        method: 'POST',
        url: tokenUrl,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    };
    // Debug logging
    n8n_workflow_2.LoggerProxy.info('MinistryPlatform Token Request', {
        url: tokenUrl,
        method: options.method,
        headers: options.headers,
        body: body,
    });
    try {
        const response = await this.helpers.request(options);
        n8n_workflow_2.LoggerProxy.info('MinistryPlatform Token Response', {
            success: true,
            hasAccessToken: !!response.access_token,
            expiresIn: response.expires_in,
        });
        if (!response.access_token) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No access token received from MinistryPlatform');
        }
        // Cache the token
        const expiresIn = (response.expires_in || 3600) * 1000; // Convert to milliseconds
        const expiresAt = now + expiresIn;
        tokenCache.set(cacheKey, {
            access_token: response.access_token,
            expires_at: expiresAt,
        });
        return response.access_token;
    }
    catch (error) {
        n8n_workflow_2.LoggerProxy.error('MinistryPlatform Token Error', {
            url: tokenUrl,
            error: error.message,
            statusCode: error.response?.status,
            responseData: error.response?.data,
        });
        // Add debug info to error message
        const debugInfo = `
Debug Info:
- URL: ${tokenUrl}
- Method: POST
- Headers: ${JSON.stringify(options.headers)}
- Body: ${body}
- Status: ${error.response?.status}
- Response: ${JSON.stringify(error.response?.data)}
		`;
        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
            ...error,
            message: `${error.message}\n${debugInfo}`
        });
    }
}
async function ministryPlatformApiRequest(method, resource, body = {}, qs = {}) {
    const credentials = await this.getCredentials('ministryPlatformApi');
    // Get access token (from cache or fresh request)
    const accessToken = await getAccessToken.call(this);
    const options = {
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
    }
    catch (error) {
        // If we get a 401, clear the cache and try once more with a fresh token
        if (error.response?.status === 401) {
            const cacheKey = `${credentials.baseUrl}:${credentials.clientId}`;
            tokenCache.delete(cacheKey);
            try {
                const freshToken = await getAccessToken.call(this);
                options.headers.Authorization = `Bearer ${freshToken}`;
                return await this.helpers.request(options);
            }
            catch (retryError) {
                throw new n8n_workflow_1.NodeApiError(this.getNode(), retryError);
            }
        }
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
    }
}
async function ministryPlatformApiRequestAllItems(method, endpoint, body = {}, query = {}) {
    const returnData = [];
    let responseData;
    query.$top = query.$top || 100;
    let skip = 0;
    do {
        query.$skip = skip;
        responseData = await ministryPlatformApiRequest.call(this, method, endpoint, body, query);
        if (Array.isArray(responseData)) {
            returnData.push.apply(returnData, responseData);
        }
        else if (responseData.value && Array.isArray(responseData.value)) {
            returnData.push.apply(returnData, responseData.value);
        }
        else {
            returnData.push(responseData);
        }
        skip += query.$top;
    } while (responseData.length === query.$top ||
        (responseData.value && responseData.value.length === query.$top));
    return returnData;
}
