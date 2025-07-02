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
			// Additional options for non-contact resources
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['getAll'],
						resource: ['event', 'donation', 'table'],
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
			// Additional options for contact resource
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['getAll'],
						resource: ['contact'],
					},
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Search by contact name ($name parameter)',
					},
					{
						displayName: 'Logon Name',
						name: 'logOnName',
						type: 'string',
						default: '',
						description: 'Search by logon name ($logOnName parameter)',
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

					// Handle contact-specific parameters
					if (resource === 'contact') {
						if (additionalFields.name) qs.$name = additionalFields.name;
						if (additionalFields.logOnName) qs.$logOnName = additionalFields.logOnName;
					} else {
						// Handle standard filter for other resources
						if (additionalFields.filter) qs.$filter = additionalFields.filter;
					}

					// Common parameters for all resources
					if (additionalFields.select) qs.$select = additionalFields.select;
					if (additionalFields.orderby) qs.$orderby = additionalFields.orderby;
					if (additionalFields.top) qs.$top = additionalFields.top;

					// Add custom parameters
					if (additionalFields.customParameters) {
						const customParams = additionalFields.customParameters.parameter || [];
						customParams.forEach((param: {name: string, value: string}) => {
							if (param.name && param.value) {
								qs[param.name] = param.value;
							}
						});
					}

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
