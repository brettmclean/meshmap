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
RELEASES_SQL_DIR=$SQL_DIR/releases

cat $SQL_DIR/setup/create_users.sql | replace_config_values | su $DB_SUPERUSER -l -c 'psql'
cat $SQL_DIR/setup/create_databases.sql | replace_config_values | su $DB_SUPERUSER -l -c 'psql'

export PGPASSWORD=$DB_PASSWORD

while read script_file; do
	cat "$RELEASES_SQL_DIR/$script_file" | psql -U $DB_USER -h localhost -d $DB_NAME
done < $RELEASES_SQL_DIR/script_files

#cat $SQL_DIR/base/insert_test_data.sql | replace_config_values | psql -U $DB_USER -h localhost -d $DB_NAME
