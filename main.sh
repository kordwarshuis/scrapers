#!/bin/bash

# TODO: start all scripts from the root folder

source .env

# Name of the collection where the documents are to be imported
collection_name='test4'

# URL of the endpoint to import documents
url="https://${TYPESENSE_HOST}.a1.typesense.net/collections/${collection_name}/documents/import?action=create"


#############
############# SCRAPING
#############

#############
# GLEIF SCRAPE
#############

cd ./gleif
pwd

# First create the sitemap
#sh create-sitemap-gleif.sh

# Then scrape the website based on this sitemap
node scrape-gleif.js


#############
# ACDC SCRAPE
#############

cd ../ACDC
pwd
node scrape-acdc.js


#############
# WOT-TERMS SCRAPE
#############

cd ../WOT-terms
pwd
node scrape-WOT-terms.js

cd ..





##############
############## IMPORTING
##############

# WOT-terms
# Create a JSONL file from the JSON file
jq -c '.[]' ./output/WOT-terms.json > ./output/WOT-terms.jsonl 

# Import the documents
curl -H "X-TYPESENSE-API-KEY: ${TYPESENSE_ADMIN_API_KEY}" \
      -X POST \
      -T ./output/WOT-terms.jsonl \
      "$url"

# ACDC
# Create a JSONL file from the JSON file
jq -c '.[]' ./output/acdc.json > ./output/acdc.jsonl 

# Import the documents
curl -H "X-TYPESENSE-API-KEY: ${TYPESENSE_ADMIN_API_KEY}" \
      -X POST \
      -T ./output/acdc.jsonl \
      "$url"

# Gleif
# Create a JSONL file from the JSON file
jq -c '.[]' ./output/gleif.json > ./output/gleif.jsonl 

# Import the documents
curl -H "X-TYPESENSE-API-KEY: ${TYPESENSE_ADMIN_API_KEY}" \
      -X POST \
      -T ./output/gleif.jsonl \
      "$url"
