"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ministryPlatformApiRequestAllItems = exports.ministryPlatformApiRequest = void 0;
const n8n_workflow_1 = require("n8n-workflow");
async function ministryPlatformApiRequest(method, resource, body = {}, qs = {}, uri, option = {}) {
    var _a, _b, _c, _d;
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
        // Handle token expiration - can come as 500 error with IDX10223 message
        const errorMessage = error.message || '';
        const responseData = ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || {};
        const responseMessage = responseData.Message || responseData.message || '';
        if (errorMessage.includes('token is expired') ||
            errorMessage.includes('IDX10223') ||
            responseMessage.includes('token is expired') ||
            responseMessage.includes('IDX10223')) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'OAuth2 token has expired. Please reconnect your MinistryPlatform credentials in n8n to refresh the token.', {
                description: 'The access token has expired and needs to be refreshed. Go to your credentials and reconnect to MinistryPlatform.'
            });
        }
        // Handle other authentication errors
        if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 401 || ((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) === 403) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Authentication failed. Please check your MinistryPlatform credentials.', {
                description: 'The request was unauthorized. Verify your OAuth2 credentials are correct and active.'
            });
        }
        // Handle 500 errors with more specific messaging
        if (((_d = error.response) === null || _d === void 0 ? void 0 : _d.status) === 500) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `MinistryPlatform server error: ${responseMessage || errorMessage || 'Internal server error'}`, {
                description: 'The MinistryPlatform server returned an error. Check your request parameters and try again.'
            });
        }
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
    }
}
exports.ministryPlatformApiRequest = ministryPlatformApiRequest;
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
exports.ministryPlatformApiRequestAllItems = ministryPlatformApiRequestAllItems;
