#!/usr/bin/env bash

replace_config_values ()
{
	sed 's/<DB_USER>/'$DB_USER'/' | sed 's/<DB_PASSWORD>/'$DB_PASSWORD'/' | sed 's/<DB_NAME>/'$DB_NAME'/'
}