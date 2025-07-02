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
- **Scope**: `http://www.thinkministry.com/dataplatform/scopes/all`
- **Base URL**: `https://mpi.ministryplatform.com/ministryplatformapi`

### API Documentation
- Swagger UI: https://mpi.ministryplatform.com/ministryplatformapi/swagger/ui/index
- Note: Firefox may be already authenticated if accessing swagger

### Supported Resources
- **Contacts** (table: Contacts)
- **Events** (table: Events)  
- **Donations** (table: Donations)
- **Generic Tables** (any MinistryPlatform table)

### Operations
- CREATE: POST `/tables/{tableName}`
- GET: GET `/tables/{tableName}/{recordId}`
- GET ALL: GET `/tables/{tableName}` (with OData query parameters)
- UPDATE: PUT `/tables/{tableName}/{recordId}`
- DELETE: DELETE `/tables/{tableName}/{recordId}`

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
