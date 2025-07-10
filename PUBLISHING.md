# Publishing Guide for n8n-nodes-ministryplatform

This guide covers how to publish the MinistryPlatform n8n community node to npm and optionally submit it for n8n verification.

## Prerequisites

- Node.js and npm installed
- npm account with publishing permissions
- Built and tested the node locally

## Publishing Steps

### 1. Pre-publish Checks

Run the build and linting:
```bash
npm run build
npm run lint
```

Fix any linting issues:
```bash
npm run lintfix
```

### 2. Version Management

Update the version in package.json:
```bash
# For patch updates (bug fixes)
npm version patch

# For minor updates (new features)
npm version minor

# For major updates (breaking changes)
npm version major
```

### 3. Test Build

Ensure the package builds correctly:
```bash
npm run prepublishOnly
```

### 4. Publish to npm

Login to npm (if not already logged in):
```bash
npm login
```

Publish the package:
```bash
npm publish
```

For scoped packages (if using @organization/package-name):
```bash
npm publish --access=public
```

## Post-Publishing

### 1. Verify Installation

Test the published package:
```bash
npm install n8n-nodes-ministryplatform
```

### 2. Documentation

Update any external documentation with the new version.

## n8n Verification (Optional)

To submit for n8n verification and inclusion in the verified community nodes:

### Prerequisites for Verification

1. **Technical Requirements:**
   - Package name starts with `n8n-nodes-`
   - Includes `n8n-community-node-package` keyword
   - No runtime dependencies (only devDependencies and peerDependencies)
   - Passes all automated checks
   - Proper n8n configuration in package.json

2. **UX Requirements:**
   - Clear, descriptive node names
   - Consistent parameter naming
   - Proper error handling
   - User-friendly descriptions

3. **Documentation:**
   - Comprehensive README
   - Clear installation instructions
   - Usage examples
   - API documentation

### Submission Process

1. Ensure all requirements are met
2. Package is published to npm
3. Submit via [n8n verification form](https://internal.users.n8n.cloud/form/f0ff9304-f34a-420e-99da-6103a2f8ac5b)

## Current Package Status

✅ Package name: `n8n-nodes-ministryplatform` (correct format)
✅ Keywords: includes `n8n-community-node-package`
✅ Proper n8n configuration in package.json
✅ No runtime dependencies
✅ Comprehensive README
✅ MIT License
✅ Repository URL configured

## Troubleshooting

### Publish Errors

- **401 Unauthorized**: Login with `npm login`
- **403 Forbidden**: Check package name availability
- **Version exists**: Update version number

### Verification Issues

- Check all technical guidelines are met
- Ensure no runtime dependencies
- Verify UX guidelines compliance
- Update documentation if needed

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [n8n Community Node Standards](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/)
- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)
