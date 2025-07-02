import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

import { ministryPlatformApiRequest, ministryPlatformApiRequestAllItems } from './GenericFunctions';

export class MinistryPlatform implements INodeType {
	description: INodeTypeDescription = {
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
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;
				const tableName = resource === 'table' 
					? this.getNodeParameter('tableName', i) as string
					: MinistryPlatform.getResourceTableName(resource);

				if (operation === 'create') {
					const fields = this.getNodeParameter('fields.field', i, []) as Array<{name: string, value: string}>;
					const body: any = {};
					fields.forEach(field => {
						body[field.name] = field.value;
					});

					responseData = await ministryPlatformApiRequest.call(this, 'POST', `/tables/${tableName}`, body);
				} else if (operation === 'get') {
					const recordId = this.getNodeParameter('recordId', i) as string;
					responseData = await ministryPlatformApiRequest.call(this, 'GET', `/tables/${tableName}/${recordId}`);
				} else if (operation === 'getAll') {
					const additionalFields = this.getNodeParameter('additionalFields', i) as any;
					const qs: any = {};

					if (additionalFields.filter) qs.$filter = additionalFields.filter;
					if (additionalFields.select) qs.$select = additionalFields.select;
					if (additionalFields.orderby) qs.$orderby = additionalFields.orderby;
					if (additionalFields.top) qs.$top = additionalFields.top;

					responseData = await ministryPlatformApiRequestAllItems.call(
						this,
						'GET',
						`/tables/${tableName}`,
						{},
						qs,
					);
				} else if (operation === 'update') {
					const recordId = this.getNodeParameter('recordId', i) as string;
					const fields = this.getNodeParameter('fields.field', i, []) as Array<{name: string, value: string}>;
					const body: any = {};
					fields.forEach(field => {
						body[field.name] = field.value;
					});

					responseData = await ministryPlatformApiRequest.call(this, 'PUT', `/tables/${tableName}/${recordId}`, body);
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

	static getResourceTableName(resource: string): string {
		const tableMap: Record<string, string> = {
			contact: 'Contacts',
			event: 'Events',
			donation: 'Donations',
		};
		
		return tableMap[resource] || resource;
	}
}
