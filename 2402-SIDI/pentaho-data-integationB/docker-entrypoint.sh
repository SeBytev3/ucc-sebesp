#!/bin/bash
set -e

: ${EXT_DIR:="/pdi-ext"}

: ${PDI_HADOOP_CONFIG:="hdp25"}

: ${PDI_MAX_LOG_LINES:="10000"}
: ${PDI_MAX_LOG_TIMEOUT:="1440"}
: ${PDI_MAX_OBJ_TIMEOUT:="240"}

: ${CERT_COUNTRY:="CN"}
: ${CERT_STATE:="Sichuan"}
: ${CERT_LOCATION:="Chengdu"}
: ${CERT_ORGANIZATION:="Company"}
: ${CERT_ORG_UNIT:="GPRB"}
: ${CERT_NAME:="Panda"}

: ${SERVER_NAME:="pdi-server"}
: ${SERVER_HOST:="`hostname`"}
: ${SERVER_PORT:="8080"}
: ${SERVER_USER:="admin"}
: ${SERVER_PASSWD:=""}

: ${MASTER_NAME:="pdi-master"}
: ${MASTER_HOST:="localhost"}
: ${MASTER_PORT:="8080"}
: ${MASTER_CONTEXT:="pentaho"}
: ${MASTER_USER:="admin"}
: ${MASTER_PASSWD:="password"}

fix_permission() {
	# only change when HOST_USER_ID is not empty(and not root)
	if [ "$HOST_USER_ID" != "" ] && [ $HOST_USER_ID != 0 ]; then
		echo "Fixing permissions..."
		
		# based on https://github.com/schmidigital/permission-fix/blob/master/tools/permission_fix
		UNUSED_USER_ID=21338

		# Setting User Permissions
		DOCKER_USER_CURRENT_ID=`id -u $PDI_USER`

		if [ "$DOCKER_USER_CURRENT_ID" != "$HOST_USER_ID" ]; then
			DOCKER_USER_OLD=`getent passwd $HOST_USER_ID | cut -d: -f1`

			if [ ! -z "$DOCKER_USER_OLD" ]; then
				usermod -o -u $UNUSED_USER_ID $DOCKER_USER_OLD
			fi

			usermod -o -u $HOST_USER_ID $PDI_USER || true
		fi
		
		# all sub-directories
		find $KETTLE_HOME -type d -print0 | xargs -0 chown $PDI_USER
		# and then files and directories under /tmp
		chown -Rf $PDI_USER /tmp $KETTLE_HOME/logs || true
	fi
}

apply_changes() {
	# initialize PDI directories
	if [ ! -f .initialized ]; then
		echo "Initializing..."
		find /tmp -maxdepth 1 -name "*.zip" -print0 | xargs -0 rm > /dev/null 2>&1 || echo "Done"
		find /tmp -maxdepth 1 -name "*.log" -print0 | xargs -0 rm > /dev/null 2>&1 || echo "Done"
		rm -rf .pentaho/* .kettle/* system/karaf/caches/* system/karaf/data/* && mkdir -p .kettle
		find $KETTLE_HOME -type d -print0 | xargs -0 chown $PDI_USER
		touch .initialized
	fi
	
	# you can mount a volume pointing to /pdi-ext for customization
	if [ -d $EXT_DIR ]; then
		# if you have custom scripts to run, let's do it
		if [ -f $EXT_DIR/custom_install.sh ]; then
			echo "Running custom installation script..."
			. $EXT_DIR/custom_install.sh
		# otherwise, simply override files based what we have under ext directory
		else
			echo "Copying files from $EXT_DIR to $KETTLE_HOME..."
			/bin/cp -Rf $EXT_DIR/. .
		fi
	fi

	if [ ! -d system/karaf/data/log ]; then
		mkdir -p logs system/karaf/data/log system/karaf/data/tmp
		if [ -f plugins/pentaho-big-data-plugin/plugin.properties ]; then
			sed -i 's/^\(active.hadoop.configuration=\).*/\1'"$PDI_HADOOP_CONFIG"'/' plugins/pentaho-big-data-plugin/plugin.properties
		fi
		sed -i 's|\(PENTAHO_DI_JAVA_OPTIONS=\).*|\1"'"$PENTAHO_DI_JAVA_OPTIONS"'"|' spoon.sh
	fi
}

_gen_keystore() {
	echo "Generating keystore..."
	# delete existing keystore if it exists
	rm -f pwd/pdi.ks

	# generate keystore as required
	_KS_PWD="$(dd if=/dev/urandom bs=255 count=1 | tr -dc 'a-zA-Z0-9' | fold -w $((96 + RANDOM % 32)) | head -n 1)"
	_KEY_PWD="$(dd if=/dev/urandom bs=255 count=1 | tr -dc 'a-zA-Z0-9' | fold -w $((96 + RANDOM % 32)) | head -n 1)"

	$JAVA_HOME/bin/keytool -keystore pwd/pdi.ks -alias pdi -noprompt \
		-genkey -keyalg RSA -validity 36500 \
		-dname "CN=$CERT_NAME, OU=$CERT_ORG_UNIT, O=$CERT_ORGANIZATION, L=$CERT_LOCATION, ST=$CERT_STATE, C=$CERT_COUNTRY" \
		-storepass $_KS_PWD -keypass $_KEY_PWD

	[[ "$DEBUG" ]] && echo "=> Store [$_KS_PWD]"
	[[ "$DEBUG" ]] && echo "=>   Key [$_KEY_PWD]"

	_KS_PWD=$(./encr.sh -carte $_KS_PWD | tail -1)
	_KEY_PWD=$(./encr.sh -carte $_KEY_PWD | tail -1)
}

_gen_password() {
	echo "Generating encrypted password..."
	if [[ "$SERVER_PASSWD" == "" ]]; then
		_ADMIN_PWD="$(dd if=/dev/urandom bs=255 count=1 | tr -dc 'a-zA-Z0-9' | fold -w $((96 + RANDOM % 32)) | head -n 1)"
	else
		_ADMIN_PWD="$SERVER_PASSWD"
	fi

	[[ "$DEBUG" ]] && echo "=> [$_ADMIN_PWD]"

	if [[ $_ADMIN_PWD == Encrypted* ]]; then
		SERVER_PASSWD="$_ADMIN_PWD"
	else
		SERVER_PASSWD=$(./encr.sh -kettle $_ADMIN_PWD | tail -1)
	fi

	_ADMIN_PWD=""
}

gen_rest_conf() {
	# unset doesn't work
	echo "Clean up sensitive environment variabiles..."
	SERVER_PASSWD=""
	MASTER_PASSWD=""
	_KS_PWD=""
	_KEY_PWD=""
	export SERVER_PASSWD MASTER_PASSWD

	if [ ! -f .kettle/kettle.properties ]; then
		echo "Generating kettle.properties..."
		cat <<< "# This file was generated by Pentaho Data Integration.
#
# Here are a few examples of variables to set:
#
# PRODUCTION_SERVER = hercules
# TEST_SERVER = zeus
# DEVELOPMENT_SERVER = thor
#
# Note: lines like these with a # in front of it are comments
#
# Read more at https://github.com/pentaho/pentaho-kettle/blob/6.1.0.1-R/engine/src/kettle-variables.xml
KETTLE_EMPTY_STRING_DIFFERS_FROM_NULL=Y
KETTLE_DISABLE_CONSOLE_LOGGING=Y

KETTLE_FORCED_SSL=Y

# Master Detector ( start in 1 second, and repeat detection every 10 seconds)
#KETTLE_MASTER_DETECTOR_INITIAL_DELAY=1000
#KETTLE_MASTER_DETECTOR_REFRESH_INTERVAL=10000

KETTLE_REDIRECT_STDERR=Y
KETTLE_REDIRECT_STDOUT=Y
KETTLE_SYSTEM_HOSTNAME=${SERVER_HOST}

# Less memory consumption, hopefully
KETTLE_STEP_PERFORMANCE_SNAPSHOT_LIMIT=1

# Tracing
#KETTLE_TRACING_ENABLED=Y
#KETTLE_TRACING_HTTP_URL=http://localhost:9411
" > .kettle/kettle.properties
	fi

	if [ ! -f classes/log4j.xml ]; then
		echo "Generating log4j.xml..."
		cat <<< '<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE log4j:configuration SYSTEM "log4j.dtd">
<log4j:configuration xmlns:log4j="http://jakarta.apache.org/log4j/" debug="false">

	<!-- ================================= -->
	<!-- Preserve messages in a local file -->
	<!-- ================================= -->

	<appender name="PENTAHOFILE" class="org.apache.log4j.RollingFileAppender">
		<param name="File" value="logs/pdi.log"/>
		<param name="Append" value="true"/>
		<param name="MaxFileSize" value="10MB"/>
		<param name="MaxBackupIndex" value="5"/>
		<layout class="org.apache.log4j.PatternLayout">
			<param name="ConversionPattern" value="%d %-5p [%c] %m%n"/>
		</layout>
	</appender>

	<!-- ================ -->
	<!-- Limit categories -->
	<!-- ================ -->

	<category name="org.pentaho.di">
		<priority value="INFO" />
	</category>

	<category name="org.pentaho.platform.osgi">
		<priority value="INFO" />
	</category>

	<category name="org.pentaho.platform.engine.core.system.status">
		<priority value="INFO"/>
	</category>

	<!-- ======================= -->
	<!-- Setup the Root category -->
	<!-- ======================= -->

	<root>
		<priority value="ERROR" />
		<appender-ref ref="PENTAHOFILE"/>
	</root>
</log4j:configuration>' > classes/log4j.xml
	fi
}

gen_slave_config() {
	# check if configuration file exists
	if [ ! -f pwd/slave.xml ]; then
		echo "Generating slave server configuration..."
		_gen_keystore
		_gen_password

		if [[ ! $MASTER_PASSWD == Encrypted* ]]; then
			MASTER_PASSWD=$(./encr.sh -kettle $MASTER_PASSWD | tail -1)
		fi

		# this is tricky as encr.sh will generate kettle.properties without required configuration
		rm -f .kettle/kettle.properties
		
		cat <<< "<slave_config>
    <masters>
        <slaveserver>
            <name>${MASTER_NAME}</name>
            <hostname>${MASTER_HOST}</hostname>
            <port>${MASTER_PORT}</port>
            <webAppName>${MASTER_CONTEXT}</webAppName>
            <username>${MASTER_USER}</username>
            <password>${MASTER_PASSWD}</password>
            <master>Y</master>
            <sslMode>Y</sslMode>
        </slaveserver>
    </masters>
    <report_to_masters>Y</report_to_masters>
    <slaveserver>
        <name>${SERVER_NAME}</name>
        <hostname>${SERVER_HOST}</hostname>
        <port>${SERVER_PORT}</port>
        <username>${SERVER_USER}</username>
        <password>${SERVER_PASSWD}</password>
        <master>N</master>
        <sslMode>Y</sslMode>
        <get_properties_from_master>Master</get_properties_from_master>
        <override_existing_properties>Y</override_existing_properties>
        <sslConfig>
            <keyStore>pwd/pdi.ks</keyStore>
            <keyStorePassword>${_KS_PWD}</keyStorePassword>
            <keyPassword>${_KEY_PWD}</keyPassword>
        </sslConfig>
    </slaveserver>

    <max_log_lines>${PDI_MAX_LOG_LINES}</max_log_lines>
    <max_log_timeout_minutes>${PDI_MAX_LOG_TIMEOUT}</max_log_timeout_minutes>
    <object_timeout_minutes>${PDI_MAX_OBJ_TIMEOUT}</object_timeout_minutes>
</slave_config>" > pwd/slave.xml
	fi
}

gen_master_config() {
	# check if configuration file exists
	if [ ! -f pwd/master.xml ]; then
		echo "Generating master server configuration..."
		_gen_keystore
		_gen_password

		rm -f .kettle/kettle.properties

		cat <<< "<slave_config>
        <slaveserver>
            <name>${SERVER_NAME}</name>
            <hostname>${SERVER_HOST}</hostname>
            <port>${SERVER_PORT}</port>
            <username>${SERVER_USER}</username>
            <password>${SERVER_PASSWD}</password>
            <master>Y</master>
            <sslMode>Y</sslMode>
            <sslConfig>
                <keyStore>pwd/pdi.ks</keyStore>
                <keyStorePassword>${_KS_PWD}</keyStorePassword>
                <keyPassword>${_KEY_PWD}</keyPassword>
            </sslConfig>
        </slaveserver>

        <max_log_lines>${PDI_MAX_LOG_LINES}</max_log_lines>
        <max_log_timeout_minutes>${PDI_MAX_LOG_TIMEOUT}</max_log_timeout_minutes>
        <object_timeout_minutes>${PDI_MAX_OBJ_TIMEOUT}</object_timeout_minutes>
</slave_config>" > pwd/master.xml
	fi
}

# run as slave server
if [ "$1" = 'slave' ]; then
	apply_changes
	gen_slave_config
	gen_rest_conf

	fix_permission
	
	# update configuration based on environment variables
	# send log output to stdout
	#sed -i 's/^\(.*rootLogger.*\), *out *,/\1, stdout,/' system/karaf/etc/org.ops4j.pax.logging.cfg
	#sed -i -e 's|.*\(runtimeFeatures=\).*|\1'"ssh,http,war,kar,cxf"'|' system/karaf/etc-carte/org.pentaho.features.cfg 

	# now start the PDI server
	echo "Starting Carte as slave server..."
	su -c "$KETTLE_HOME/carte.sh $KETTLE_HOME/pwd/slave.xml" $PDI_USER
elif [ "$1" = 'master' ]; then
	apply_changes
	gen_master_config
	gen_rest_conf

	fix_permission
	
	# now start the PDI server
	echo "Starting Carte as master server(it's better use BA server instead)..."
	su -c "$KETTLE_HOME/carte.sh $KETTLE_HOME/pwd/master.xml" $PDI_USER
fi

exec "$@"
