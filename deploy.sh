#!/bin/bash
export TWILIO_ACCOUNT_SID=$(cat ./twilio/.env | grep ACCOUNT_SID | cut -d '=' -f 2)

export TWILIO_AUTH_TOKEN=$(cat ./twilio/.env | grep AUTH_TOKEN | cut -d '=' -f 2)

cd twilio && twilio serverless:deploy