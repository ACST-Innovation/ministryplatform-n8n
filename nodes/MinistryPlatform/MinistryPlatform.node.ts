import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { ministryPlatformApiRequest, ministryPlatformApiRequestAllItems } from './GenericFunctionsClientCredentials';

export class MinistryPlatform implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MinistryPlatform',
		name: 'ministryPlatform',
		icon: 'file:ministryplatform.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["tableName"]}}',
		description: 'Consume MinistryPlatform API for church management data operations',
		defaults: {
			name: 'MinistryPlatform',
		},
		inputs: ['main'] as any,
		outputs: ['main'] as any,
		credentials: [
			{
				name: 'ministryPlatformApi',
				required: true,
			},
		],
		usableAsTool: true,
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Tools'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://help.acst.com/en/ministryplatform/developer-resources/developer-resources',
					},
				],
			},
		},
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
						action: 'Create new records in MinistryPlatform',
						description: 'Creates one or more new records in the specified MinistryPlatform table with the provided field values',
					},
					{
						name: 'Delete',
						value: 'delete',
						action: 'Delete a record from MinistryPlatform',
						description: 'Deletes an existing record from the specified MinistryPlatform table using the record ID',
					},
					{
						name: 'Get',
						value: 'get',
						action: 'Get a specific record from MinistryPlatform',
						description: 'Retrieves a single record from the specified MinistryPlatform table using the record ID',
					},
					{
						name: 'List',
						value: 'list',
						action: 'List records from MinistryPlatform',
						description: 'Retrieves multiple records from the specified MinistryPlatform table with optional filtering, sorting, and pagination',
					},
					{
						name: 'Update',
						value: 'update',
						action: 'Update records in MinistryPlatform',
						description: 'Updates one or more existing records in the specified MinistryPlatform table with new field values',
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
				description: 'Name of the MinistryPlatform table to interact with. Common tables include: Contacts, Participants, Events, Households, Groups, Donations, Volunteers, etc.',
			},
			{
				displayName: 'Record ID',
				name: 'recordId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['get', 'delete'],
					},
				},
				default: '',
				description: 'Unique identifier (primary key) of the record to retrieve or delete. For most tables, this is the table name followed by "_ID" (e.g., Contact_ID, Event_ID)',
			},
			{
				displayName: 'Records',
				name: 'records',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				default: '[]',
				description: 'Array of record objects to create or update. Each object should contain the field names and values for that record. Example: [{"Contact_ID": 159, "First_Name": "John", "Last_Name": "Doe"}, {"Contact_ID": 160, "First_Name": "Jane", "Last_Name": "Smith"}]',
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
						description: 'MS SQL WHERE clause syntax for filtering records. Examples: "Contact_ID > 1000", "Email_Address=\'user@example.com\'", "Display_Name LIKE \'%Smith%\'", "Created_Date >= \'2024-01-01\'"',
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;
				const tableName = this.getNodeParameter('tableName', i) as string;

				if (operation === 'create') {
					const records = this.getNodeParameter('records', i) as string;
					let body: any[];
					
					try {
						body = JSON.parse(records);
						if (!Array.isArray(body)) {
							throw new Error('Records must be an array');
						}
					} catch (error) {
						throw new Error(`Invalid JSON format in records: ${(error as Error).message}`);
					}

					responseData = await ministryPlatformApiRequest.call(this, 'POST', `/tables/${tableName}`, body);
				} else if (operation === 'get') {
					const recordId = this.getNodeParameter('recordId', i) as string;
					responseData = await ministryPlatformApiRequest.call(this, 'GET', `/tables/${tableName}/${recordId}`);
				} else if (operation === 'list') {
					const additionalFields = this.getNodeParameter('additionalFields', i) as any;
					const qs: any = {};

					if (additionalFields.select) qs.$select = additionalFields.select;
					if (additionalFields.filter) qs.$filter = additionalFields.filter;
					if (additionalFields.orderby) qs.$orderby = additionalFields.orderby;
					if (additionalFields.groupby) qs.$groupby = additionalFields.groupby;
					if (additionalFields.having) qs.$having = additionalFields.having;
					if (additionalFields.top) qs.$top = additionalFields.top;
					if (additionalFields.skip) qs.$skip = additionalFields.skip;
					if (additionalFields.distinct) qs.$distinct = additionalFields.distinct;
					if (additionalFields.userId) qs.$userId = additionalFields.userId;
					if (additionalFields.globalFilterId) qs.$globalFilterId = additionalFields.globalFilterId;

					responseData = await ministryPlatformApiRequestAllItems.call(
						this,
						'GET',
						`/tables/${tableName}`,
						{},
						qs,
					);
				} else if (operation === 'update') {
					const records = this.getNodeParameter('records', i) as string;
					let body: any[];
					
					try {
						body = JSON.parse(records);
						if (!Array.isArray(body)) {
							throw new Error('Records must be an array');
						}
					} catch (error) {
						throw new Error(`Invalid JSON format in records: ${(error as Error).message}`);
					}

					responseData = await ministryPlatformApiRequest.call(this, 'PUT', `/tables/${tableName}`, body);
				} else if (operation === 'delete') {
					const recordId = this.getNodeParameter('recordId', i) as string;
					responseData = await ministryPlatformApiRequest.call(this, 'DELETE', `/tables/${tableName}/${recordId}`);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
