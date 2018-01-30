[Meshmap](http://mesh-map.com/)
===============================

Meshmap is a Node.js-based web application which allows users to share and edit maps in real time.

Pre-requisites
--------------

You'll need Node.js 8.0 or higher in order to run Meshmap.

It is recommended that you also install PostgreSQL 9.1 or higher. Meshmap can run without it but all user data will be lost each time the application shuts down.

Getting source and dependencies
-------------------------------

Clone the git repository by running:
```
git clone https://github.com/brettmclean/meshmap.git
```

Enter the newly-created _meshmap_ directory:
```
cd meshmap
```

Meshmap depends on several Node.js modules that you will need to install. Run the following to download these dependencies:
```
npm install
```

If you do not already have [Grunt](http://gruntjs.com/) installed, you'll need to do that now. If you're running on Linux or Mac OS X, you may need to run this with sudo to give it the permissions it needs to install Grunt globally:
```
npm install -g grunt-cli
```

Basic configuration
-------------------

Running Meshmap requires a valid Google Maps JavaScript API key. Sign in to [Google API Console](https://console.developers.google.com/) using your Google account to create one.

Open _config/client.json_ and replace the _map.key_ value with your API key.

Building and running Meshmap
----------------------------

Building Meshmap is as simple as running:
```
grunt
```

This will create an _app_ directory containing your application as well as a copy of your config files. If you're building Meshmap for running in a production environment, you should build in release mode instead:
```
grunt release
```

This will perform extra code quality checks as well as minify client-side resources for faster downloads.

Once Meshmap has been configured and built, you can run it using:
```
node app
```

Connect to http://localhost:8888 in your web browser and you're good to go!

Creating database (optional)
---------------------------------------------

If you need user data to persist between application restarts (e.g. in a production environment), you will need to set up a PostgreSQL database. SQL scripts are included in the _datastore-setup/postgres_ directory.

#### Linux and Mac OS X

Open _datastore-setup/postgres/config.sh_ in your favorite text editor and replace the following values:

* **DB_SUPERUSER**: The name of your PostgreSQL installation's superuser. This is usually "postgres". We will need to run as the superuser to create a new database and database user.
* **DB_USER**: The name of a new PostgreSQL user that will own the Meshmap database. The application will connect to the database as this user.
* **DB_PASSWORD**: The password DB_USER will use to log in.
* **DB_NAME**: The name of the PostgreSQL database that should be created. In most cases, this can left as "meshmap".

Save _config.sh_.

Ensure these scripts have executable permissions:
```
chmod +x datastore-setup/postgres/*.sh
```

You can now run setup.sh on your database server. Because we need to run some scripts as the PostgreSQL superuser, we'll need to run as root:
```
sudo datastore-setup/postgres/setup.sh
```

If this script fails to work properly on your system, follow the Windows instructions below instead.

#### Windows

Open the following files in your favorite text editor:

* datastore-setup/postgres/sql/base/create_databases.sql
* datastore-setup/postgres/sql/base/create_users.sql

In each of these files, make the following substitutions:

* Replace **&lt;DB_USER&gt;** with the name of a new PostgreSQL user that will own the Meshmap database. The application will connect to the database as this user. The name _meshmap_ works well here.
* Replace **&lt;DB_PASSWORD&gt;** with the password &lt;DB_USER&gt; will use to log in.
* Replace **&lt;DB_NAME&gt;** with the name of the PostgreSQL database that should be created. The name _meshmap_ works well here.

Connect to your PostgreSQL instance as the superuser (usually _postgres_) and run create_users.sql and then create_databases.sql.

Now, connect to your new database (_&lt;DB_NAME&gt;_) as your new database user (_&lt;DB_USER&gt;_) and run create_schema.sql.

Contributors
------------

https://github.com/brettmclean/meshmap/graphs/contributors

License
-------

This project is available under the [GPLv3](http://www.gnu.org/licenses/gpl-3.0.txt) license.
