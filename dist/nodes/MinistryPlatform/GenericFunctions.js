"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ministryPlatformApiRequest = ministryPlatformApiRequest;
exports.ministryPlatformApiRequestAllItems = ministryPlatformApiRequestAllItems;
const n8n_workflow_1 = require("n8n-workflow");
async function ministryPlatformApiRequest(method, resource, body = {}, qs = {}, uri, option = {}, isRetry = false) {
    const credentials = await this.getCredentials('ministryPlatformOAuth2Api');
    const options = {
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
    }
    catch (error) {
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
                // Try the request one more time - n8n should attempt refresh automatically
                return await ministryPlatformApiRequest.call(this, method, resource, body, qs, uri, option, true);
            }
            catch (retryError) {
                // If retry fails, provide user-friendly error message
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'OAuth2 token has expired. Please reconnect your MinistryPlatform credentials in n8n to refresh the token.', {
                    description: 'The access token has expired. Automatic refresh was attempted but failed. Please reconnect your credentials manually to get a new token.'
                });
            }
        }
        // Handle token expiration on retry or other scenarios
        if (isTokenExpired) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'OAuth2 token has expired. Please reconnect your MinistryPlatform credentials in n8n to refresh the token.', {
                description: 'The access token has expired and needs to be refreshed. Go to your credentials and reconnect to MinistryPlatform.'
            });
        }
        // Handle other authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Authentication failed. Please check your MinistryPlatform credentials.', {
                description: 'The request was unauthorized. Verify your OAuth2 credentials are correct and active.'
            });
        }
        // Handle 500 errors with more specific messaging
        if (error.response?.status === 500) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `MinistryPlatform server error: ${responseMessage || errorMessage || 'Internal server error'}`, {
                description: 'The MinistryPlatform server returned an error. Check your request parameters and try again.'
            });
        }
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
    }
}
async function ministryPlatformApiRequestAllItems(method, endpoint, body = {}, query = {}) {
    // If user specified a $top value, respect it and don't paginate
    if (query.$top) {
        return await ministryPlatformApiRequest.call(this, method, endpoint, body, query);
    }
    // Otherwise, paginate through all results
    const returnData = [];
    let responseData;
    const pageSize = 100;
    let skip = query.$skip || 0;
    const originalSkip = skip;
    do {
        const paginatedQuery = { ...query, $top: pageSize, $skip: skip };
        responseData = await ministryPlatformApiRequest.call(this, method, endpoint, body, paginatedQuery);
        if (Array.isArray(responseData)) {
            returnData.push.apply(returnData, responseData);
        }
        else if (responseData.value && Array.isArray(responseData.value)) {
            returnData.push.apply(returnData, responseData.value);
        }
        else {
            returnData.push(responseData);
            break;
        }
        skip += pageSize;
    } while (responseData.length === pageSize ||
        (responseData.value && responseData.value.length === pageSize));
    return returnData;
}
