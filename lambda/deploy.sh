#!/bin/bash

# Deployment script for Dropbox-S3 Sync Lambda
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Dropbox to S3 Sync Lambda Deployment ===${NC}\n"

# Configuration
FUNCTION_NAME="dropbox-s3-sync"
RUNTIME="nodejs18.x"
HANDLER="index.handler"
TIMEOUT=300
MEMORY=512

# Check if function name is provided as argument
if [ ! -z "$1" ]; then
    FUNCTION_NAME=$1
fi

echo "Function name: $FUNCTION_NAME"

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install

# Package the function
echo -e "\n${YELLOW}Packaging function...${NC}"
rm -f function.zip
zip -r function.zip index.js node_modules package.json > /dev/null
echo -e "${GREEN}✓ Package created: function.zip${NC}"

# Check if function exists
echo -e "\n${YELLOW}Checking if function exists...${NC}"
if aws lambda get-function --function-name $FUNCTION_NAME 2>/dev/null; then
    # Update existing function
    echo -e "${YELLOW}Updating existing function...${NC}"
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip
    
    echo -e "${GREEN}✓ Function updated successfully!${NC}"
else
    # Create new function
    echo -e "${YELLOW}Function doesn't exist. Please provide the following to create it:${NC}"
    echo ""
    read -p "IAM Role ARN: " ROLE_ARN
    
    if [ -z "$ROLE_ARN" ]; then
        echo -e "${RED}Error: IAM Role ARN is required${NC}"
        exit 1
    fi
    
    echo -e "\n${YELLOW}Creating function...${NC}"
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role $ROLE_ARN \
        --handler $HANDLER \
        --zip-file fileb://function.zip \
        --timeout $TIMEOUT \
        --memory-size $MEMORY \
        --description "Syncs files from Dropbox to S3"
    
    echo -e "${GREEN}✓ Function created successfully!${NC}"
    echo -e "\n${YELLOW}Don't forget to set environment variables:${NC}"
    echo "  - DROPBOX_ACCESS_TOKEN"
    echo "  - DROPBOX_PATH"
    echo "  - S3_BUCKET"
    echo "  - S3_PREFIX (optional)"
fi

# Show next steps
echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
echo -e "\nTo test the function:"
echo -e "  ${YELLOW}aws lambda invoke --function-name $FUNCTION_NAME --payload '{}' response.json${NC}"
echo -e "\nTo view logs:"
echo -e "  ${YELLOW}aws logs tail /aws/lambda/$FUNCTION_NAME --follow${NC}"

# Cleanup
echo -e "\n${YELLOW}Cleaning up...${NC}"
rm -f response.json
echo -e "${GREEN}Done!${NC}"
