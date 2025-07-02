# Agent Instructions for n8n-nodes-ministryplatform

## Development Environment
- **OS**: Windows 11 (default development environment)
- **Node.js**: Required for n8n custom node development
- **Package Manager**: npm

## Project Structure
```
n8n-mp/
├── credentials/
│   └── MinistryPlatformOAuth2Api.credentials.ts
├── nodes/
│   └── MinistryPlatform/
│       ├── MinistryPlatform.node.ts
│       ├── GenericFunctions.ts
│       └── ministryplatform.svg
├── dist/ (generated after build)
├── package.json
├── tsconfig.json
├── gulpfile.js
├── .eslintrc.js
└── README.md
```

## Development Commands

### Build Commands
- `npm run build` - Compile TypeScript and build icons
- `npm run dev` - Watch mode for development
- `tsc` - TypeScript compiler (direct)

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lintfix` - Fix ESLint issues automatically  
- `npm run format` - Format code with Prettier

### Testing
- `npm test` - Run tests (if test framework is added)
- Manual testing requires n8n installation and node installation

## n8n Specific Information

### Node Registration
- Credentials: `dist/credentials/MinistryPlatformOAuth2Api.credentials.js`
- Nodes: `dist/nodes/MinistryPlatform/MinistryPlatform.node.js`
- n8n API Version: 1

### Installation in n8n
1. Build the package: `npm run build`
2. Install in n8n: `npm install n8n-nodes-ministryplatform`
3. Restart n8n to load the new node

## MinistryPlatform API Details

### Authentication
- **Type**: OAuth2 Authorization Code flow
- **Auth URL**: `https://mpi.ministryplatform.com/oauth/connect/authorize`
- **Token URL**: `https://mpi.ministryplatform.com/oauth/connect/token`
- **Scope**: `http://www.thinkministry.com/dataplatform/scopes/all offline_access`
- **Base URL**: `https://mpi.ministryplatform.com/ministryplatformapi`

### API Documentation
- Swagger UI: https://mpi.ministryplatform.com/ministryplatformapi/swagger/ui/index
- Note: Firefox may be already authenticated if accessing swagger

### Supported Operations
- CREATE: POST `/tables/{tableName}`
- GET: GET `/tables/{tableName}/{recordId}`
- LIST: GET `/tables/{tableName}` (with query parameters)
- UPDATE: PUT `/tables/{tableName}/{recordId}`
- DELETE: DELETE `/tables/{tableName}/{recordId}`

### Query Parameters for LIST Operation
The MinistryPlatform API uses MS SQL syntax for query parameters, NOT OData:

- **$filter**: MS SQL WHERE clause syntax (e.g., `Contact_ID > 1000`, `Email_Address='user@example.com'`)
- **$select**: Comma-separated field list (e.g., `Contact_ID,Display_Name,Email_Address`)
- **$orderby**: SQL ORDER BY syntax (e.g., `Display_Name ASC`, `Created_Date DESC`)
- **$groupby**: SQL GROUP BY syntax
- **$having**: SQL HAVING clause
- **$top**: Limit number of results
- **$skip**: Skip number of results for pagination
- **$distinct**: Return distinct records (boolean)
- **$userId**: User context for queries
- **$globalFilterId**: Apply global filter by ID

### Filter Syntax Examples (MS SQL, not OData)
```sql
-- String equality
Email_Address='patrick@acst.com'

-- String contains
Display_Name LIKE '%Smith%'

-- Number comparison
Contact_ID > 1000

-- Date comparison
Created_Date >= '2024-01-01'

-- Multiple conditions
Contact_ID > 1000 AND Email_Address LIKE '%gmail.com%'

-- Null checks
Email_Address IS NOT NULL

-- IN clause
Contact_ID IN (1001, 1002, 1003)
```

## Code Style & Conventions
- TypeScript strict mode enabled
- ESLint with n8n-nodes-base plugin
- Prettier for code formatting
- Follow n8n community node guidelines
- Use PascalCase for class names
- Use camelCase for properties and methods

## File Organization
- **credentials/**: OAuth2 credential definitions
- **nodes/**: Node implementations and utilities
- **dist/**: Compiled output (git ignored)
- **GenericFunctions.ts**: Shared API request functions
- **{NodeName}.node.ts**: Main node implementation

## Troubleshooting
- If build fails, check TypeScript configuration
- For OAuth2 issues, verify MinistryPlatform app configuration
- **Token Expiration**: If getting "token is expired" errors, the user needs to reconnect their MinistryPlatform credentials in n8n
- API errors may indicate authentication or permission issues
- Use n8n logs for debugging node execution

## Dependencies
- **Runtime**: n8n-workflow (peer dependency)
- **Development**: TypeScript, ESLint, Prettier, Gulp
- **Build**: TypeScript compiler, Gulp for icon processing

## Windows 11 Specific Notes
- Use Windows file paths with backslashes in local development
- PowerShell or Command Prompt for running npm commands
- Consider using Windows Terminal for better development experience
- File permissions should not be an issue on Windows for this project type
