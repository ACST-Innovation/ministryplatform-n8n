"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ministryPlatformApiRequestAllItems = exports.ministryPlatformApiRequest = void 0;
const n8n_workflow_1 = require("n8n-workflow");
async function ministryPlatformApiRequest(method, resource, body = {}, qs = {}, uri, option = {}) {
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
