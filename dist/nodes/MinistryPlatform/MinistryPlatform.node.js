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
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
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
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Contact',
                            value: 'contact',
                        },
                        {
                            name: 'Event',
                            value: 'event',
                        },
                        {
                            name: 'Donation',
                            value: 'donation',
                        },
                        {
                            name: 'Table',
                            value: 'table',
                        },
                    ],
                    default: 'contact',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['contact', 'event', 'donation', 'table'],
                        },
                    },
                    options: [
                        {
                            name: 'Create',
                            value: 'create',
                            action: 'Create a record',
                        },
                        {
                            name: 'Delete',
                            value: 'delete',
                            action: 'Delete a record',
                        },
                        {
                            name: 'Get',
                            value: 'get',
                            action: 'Get a record',
                        },
                        {
                            name: 'Get All',
                            value: 'getAll',
                            action: 'Get all records',
                        },
                        {
                            name: 'Update',
                            value: 'update',
                            action: 'Update a record',
                        },
                    ],
                    default: 'get',
                },
                // Table Name for generic table operations
                {
                    displayName: 'Table Name',
                    name: 'tableName',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['table'],
                        },
                    },
                    default: '',
                    placeholder: 'Contacts',
                    description: 'Name of the MinistryPlatform table to interact with',
                },
                // Record ID for get, update, delete operations
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
                // Fields for create and update operations
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
                // Additional options
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: {
                        show: {
                            operation: ['getAll'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Filter',
                            name: 'filter',
                            type: 'string',
                            default: '',
                            description: 'Filter expression for the query',
                        },
                        {
                            displayName: 'Select',
                            name: 'select',
                            type: 'string',
                            default: '',
                            description: 'Comma-separated list of fields to select',
                        },
                        {
                            displayName: 'Order By',
                            name: 'orderby',
                            type: 'string',
                            default: '',
                            description: 'Field to order results by',
                        },
                        {
                            displayName: 'Top',
                            name: 'top',
                            type: 'number',
                            default: 100,
                            description: 'Maximum number of records to return',
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        for (let i = 0; i < items.length; i++) {
            try {
                let responseData;
                const tableName = resource === 'table'
                    ? this.getNodeParameter('tableName', i)
                    : MinistryPlatform.getResourceTableName(resource);
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
                else if (operation === 'getAll') {
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
    static getResourceTableName(resource) {
        const tableMap = {
            contact: 'Contacts',
            event: 'Events',
            donation: 'Donations',
        };
        return tableMap[resource] || resource;
    }
}
exports.MinistryPlatform = MinistryPlatform;
