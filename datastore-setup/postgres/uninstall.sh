#!/usr/bin/env bash

# We require root access for various things
if [[ $EUID -ne 0 ]]; then
	echo "You must be root to run this script." 1>&2
	exit 1
fi

# Read in configuration
MY_DIR=`dirname $0`
source $MY_DIR/config.sh
source $MY_DIR/common.sh

SQL_DIR=$MY_DIR/sql

cat $SQL_DIR/setup/delete_databases.sql | replace_config_values | su $DB_SUPERUSER -l -c 'psql'
cat $SQL_DIR/setup/delete_users.sql | replace_config_values | su $DB_SUPERUSER -l -c 'psql'
