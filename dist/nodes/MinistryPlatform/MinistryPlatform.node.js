"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinistryPlatform = void 0;
const GenericFunctions_1 = require("./GenericFunctions");
class MinistryPlatform {
    constructor() {
        this.description = {
            displayName: 'MinistryPlatform',
            name: 'ministryPlatform',
            icon: 'file:ministryplatform.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["tableName"]}}',
            description: 'Consume MinistryPlatform API',
            defaults: {
                name: 'MinistryPlatform',
            },
            inputs: ["main" /* NodeConnectionType.Main */],
            outputs: ["main" /* NodeConnectionType.Main */],
            credentials: [
                {
                    name: 'ministryPlatformOAuth2Api',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Create',
                            value: 'create',
                            action: 'Create a record',
                        },
                        {
                            name: 'Get',
                            value: 'get',
                            action: 'Get a record',
                        },
                        {
                            name: 'List',
                            value: 'list',
                            action: 'List records',
                        },
                        {
                            name: 'Update',
                            value: 'update',
                            action: 'Update a record',
                        },
                        {
                            name: 'Delete',
                            value: 'delete',
                            action: 'Delete a record',
                        },
                    ],
                    default: 'get',
                },
                {
                    displayName: 'Table Name',
                    name: 'tableName',
                    type: 'string',
                    default: '',
                    placeholder: 'Contacts',
                    description: 'Name of the MinistryPlatform table to interact with',
                },
                {
                    displayName: 'Record ID',
                    name: 'recordId',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['get', 'update', 'delete'],
                        },
                    },
                    default: '',
                    description: 'ID of the record to retrieve, update, or delete',
                },
                {
                    displayName: 'Fields',
                    name: 'fields',
                    placeholder: 'Add Field',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    displayOptions: {
                        show: {
                            operation: ['create', 'update'],
                        },
                    },
                    default: {},
                    options: [
                        {
                            name: 'field',
                            displayName: 'Field',
                            values: [
                                {
                                    displayName: 'Field Name',
                                    name: 'name',
                                    type: 'string',
                                    default: '',
                                    description: 'Name of the field',
                                },
                                {
                                    displayName: 'Field Value',
                                    name: 'value',
                                    type: 'string',
                                    default: '',
                                    description: 'Value of the field',
                                },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: {
                        show: {
                            operation: ['list'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Filter',
                            name: 'filter',
                            type: 'string',
                            default: '',
                            description: 'OData filter expression (e.g., "Contact_ID eq 1")',
                            noDataExpression: true,
                        },
                        {
                            displayName: 'Select',
                            name: 'select',
                            type: 'string',
                            default: '',
                            description: 'Comma-separated list of fields to select',
                            noDataExpression: true,
                        },
                        {
                            displayName: 'Order By',
                            name: 'orderby',
                            type: 'string',
                            default: '',
                            description: 'Field to order results by',
                            noDataExpression: true,
                        },
                        {
                            displayName: 'Top',
                            name: 'top',
                            type: 'number',
                            default: 100,
                            description: 'Maximum number of records to return',
                        },
                        {
                            displayName: 'Skip',
                            name: 'skip',
                            type: 'number',
                            default: 0,
                            description: 'Number of records to skip for pagination',
                        },
                        {
                            displayName: 'Custom Parameters',
                            name: 'customParameters',
                            placeholder: 'Add Parameter',
                            type: 'fixedCollection',
                            typeOptions: {
                                multipleValues: true,
                            },
                            default: {},
                            options: [
                                {
                                    name: 'parameter',
                                    displayName: 'Parameter',
                                    values: [
                                        {
                                            displayName: 'Name',
                                            name: 'name',
                                            type: 'string',
                                            default: '',
                                            description: 'Parameter name (e.g., $expand, $count)',
                                        },
                                        {
                                            displayName: 'Value',
                                            name: 'value',
                                            type: 'string',
                                            default: '',
                                            description: 'Parameter value',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const operation = this.getNodeParameter('operation', 0);
        for (let i = 0; i < items.length; i++) {
            try {
                let responseData;
                const tableName = this.getNodeParameter('tableName', i);
                if (operation === 'create') {
                    const fields = this.getNodeParameter('fields.field', i, []);
                    const body = {};
                    fields.forEach(field => {
                        body[field.name] = field.value;
                    });
                    responseData = await GenericFunctions_1.ministryPlatformApiRequest.call(this, 'POST', `/tables/${tableName}`, body);
                }
                else if (operation === 'get') {
                    const recordId = this.getNodeParameter('recordId', i);
                    responseData = await GenericFunctions_1.ministryPlatformApiRequest.call(this, 'GET', `/tables/${tableName}/${recordId}`);
                }
                else if (operation === 'list') {
                    const additionalFields = this.getNodeParameter('additionalFields', i);
                    const qs = {};
                    if (additionalFields.filter)
                        qs.$filter = additionalFields.filter;
                    if (additionalFields.select)
                        qs.$select = additionalFields.select;
                    if (additionalFields.orderby)
                        qs.$orderby = additionalFields.orderby;
                    if (additionalFields.top)
                        qs.$top = additionalFields.top;
                    if (additionalFields.skip)
                        qs.$skip = additionalFields.skip;
                    // Add custom parameters
                    if (additionalFields.customParameters) {
                        const customParams = additionalFields.customParameters.parameter || [];
                        customParams.forEach((param) => {
                            if (param.name && param.value) {
                                qs[param.name] = param.value;
                            }
                        });
                    }
                    responseData = await GenericFunctions_1.ministryPlatformApiRequestAllItems.call(this, 'GET', `/tables/${tableName}`, {}, qs);
                }
                else if (operation === 'update') {
                    const recordId = this.getNodeParameter('recordId', i);
                    const fields = this.getNodeParameter('fields.field', i, []);
                    const body = {};
                    fields.forEach(field => {
                        body[field.name] = field.value;
                    });
                    responseData = await GenericFunctions_1.ministryPlatformApiRequest.call(this, 'PUT', `/tables/${tableName}/${recordId}`, body);
                }
                else if (operation === 'delete') {
                    const recordId = this.getNodeParameter('recordId', i);
                    responseData = await GenericFunctions_1.ministryPlatformApiRequest.call(this, 'DELETE', `/tables/${tableName}/${recordId}`);
                }
                const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), { itemData: { item: i } });
                returnData.push(...executionData);
            }
            catch (error) {
                if (this.continueOnFail()) {
                    const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                    returnData.push(...executionData);
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.MinistryPlatform = MinistryPlatform;
