"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinistryPlatform = void 0;
const GenericFunctionsClientCredentials_1 = require("./GenericFunctionsClientCredentials");
class MinistryPlatform {
    description = {
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
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'ministryPlatformApi',
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
                        name: 'List',
                        value: 'list',
                        action: 'List records',
                    },
                    {
                        name: 'Update',
                        value: 'update',
                        action: 'Update a record',
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
                        displayName: 'Distinct',
                        name: 'distinct',
                        type: 'boolean',
                        default: false,
                        description: 'Whether to return only distinct records',
                    },
                    {
                        displayName: 'Filter',
                        name: 'filter',
                        type: 'string',
                        default: '',
                        description: 'MS SQL WHERE clause syntax (e.g., "Contact_ID > 1000", "Email_Address=\'user@example.com\'")',
                    },
                    {
                        displayName: 'Global Filter ID',
                        name: 'globalFilterId',
                        type: 'number',
                        default: 0,
                        description: 'Global filter ID to apply',
                    },
                    {
                        displayName: 'Group By',
                        name: 'groupby',
                        type: 'string',
                        default: '',
                        description: 'Field to group results by',
                    },
                    {
                        displayName: 'Having',
                        name: 'having',
                        type: 'string',
                        default: '',
                        description: 'Having clause for grouped results',
                    },
                    {
                        displayName: 'Order By',
                        name: 'orderby',
                        type: 'string',
                        default: '',
                        description: 'Field to order results by (e.g., "Display_Name asc")',
                    },
                    {
                        displayName: 'Select',
                        name: 'select',
                        type: 'string',
                        default: '',
                        description: 'Comma-separated list of fields to select',
                    },
                    {
                        displayName: 'Skip',
                        name: 'skip',
                        type: 'number',
                        default: 0,
                        description: 'Number of records to skip for pagination',
                    },
                    {
                        displayName: 'Top',
                        name: 'top',
                        type: 'number',
                        default: 100,
                        description: 'Maximum number of records to return',
                    },
                    {
                        displayName: 'User ID',
                        name: 'userId',
                        type: 'number',
                        default: 0,
                        description: 'User ID for context-sensitive queries',
                    },
                ],
            },
        ],
    };
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
                    responseData = await GenericFunctionsClientCredentials_1.ministryPlatformApiRequest.call(this, 'POST', `/tables/${tableName}`, body);
                }
                else if (operation === 'get') {
                    const recordId = this.getNodeParameter('recordId', i);
                    responseData = await GenericFunctionsClientCredentials_1.ministryPlatformApiRequest.call(this, 'GET', `/tables/${tableName}/${recordId}`);
                }
                else if (operation === 'list') {
                    const additionalFields = this.getNodeParameter('additionalFields', i);
                    const qs = {};
                    if (additionalFields.select)
                        qs.$select = additionalFields.select;
                    if (additionalFields.filter)
                        qs.$filter = additionalFields.filter;
                    if (additionalFields.orderby)
                        qs.$orderby = additionalFields.orderby;
                    if (additionalFields.groupby)
                        qs.$groupby = additionalFields.groupby;
                    if (additionalFields.having)
                        qs.$having = additionalFields.having;
                    if (additionalFields.top)
                        qs.$top = additionalFields.top;
                    if (additionalFields.skip)
                        qs.$skip = additionalFields.skip;
                    if (additionalFields.distinct)
                        qs.$distinct = additionalFields.distinct;
                    if (additionalFields.userId)
                        qs.$userId = additionalFields.userId;
                    if (additionalFields.globalFilterId)
                        qs.$globalFilterId = additionalFields.globalFilterId;
                    responseData = await GenericFunctionsClientCredentials_1.ministryPlatformApiRequestAllItems.call(this, 'GET', `/tables/${tableName}`, {}, qs);
                }
                else if (operation === 'update') {
                    const recordId = this.getNodeParameter('recordId', i);
                    const fields = this.getNodeParameter('fields.field', i, []);
                    const body = {};
                    fields.forEach(field => {
                        body[field.name] = field.value;
                    });
                    responseData = await GenericFunctionsClientCredentials_1.ministryPlatformApiRequest.call(this, 'PUT', `/tables/${tableName}/${recordId}`, body);
                }
                else if (operation === 'delete') {
                    const recordId = this.getNodeParameter('recordId', i);
                    responseData = await GenericFunctionsClientCredentials_1.ministryPlatformApiRequest.call(this, 'DELETE', `/tables/${tableName}/${recordId}`);
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
