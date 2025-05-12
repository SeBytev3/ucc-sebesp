# Basado en el trabajo de zhicwu desde el github: zhicwu/docker-pdi-ce
# Y también desde su docker: zhicwu/pdi-ce que trabaja con la version 7.1 y muchos enlaces ya no funcionan

# Pull Base Image
FROM openjdk:11

# Set Environment Variables
ENV PDI_VERSION=9.4 PDI_BUILD=9.4.0.0-343 PDI_PATCH=7.1.0.5 PDI_USER=pentaho \
	KETTLE_HOME=/data-integration POSTGRESQL_DRIVER_VERSION=42.7.4\
	ORACLE_VERSION=236 \
	PENTAHO_DI_JAVA_OPTIONS="--add-opens java.base/java.net=ALL-UNNAMED --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/sun.net.www.protocol.jar=ALL-UNNAMED -Xms1024m -Xmx2048m -Djava.library.path=libswt/win64:/bin -Djava.locale.providers=COMPAT,SPI"

# Add Cron Jobs
COPY purge-old-files.sh /usr/local/bin/purge-old-files.sh

# Install Required Packages, Configure Crons and Add User
RUN apt-get update \
	&& apt-get install -y wget curl unzip gnupg \
	&& echo "deb http://cz.archive.ubuntu.com/ubuntu bionic main universe" >> /etc/apt/sources.list \
	&& apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 3B4FE6ACC0B21F32 \
	&& apt-get update \
	&& apt-get install -y libwebkitgtk-1.0-0 \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*
	
# Crear usuario
RUN useradd -md $KETTLE_HOME -s /bin/bash $PDI_USER 

# Descargar y descomprimir Pentaho Data Integration Community Edition
RUN wget --progress=dot:giga https://github.com/ambientelivre/legacy-pentaho-ce/releases/download/pdi-ce-${PDI_BUILD}/pdi-ce-${PDI_BUILD}.zip \
	&& unzip -q *.zip \
	&& rm -f *.zip

# Descargar jmx_prometheus_javaagent.jar
RUN wget --progress=dot:giga -O /usr/local/jmx_prometheus_javaagent.jar https://repo1.maven.org/maven2/io/prometheus/jmx/jmx_prometheus_javaagent/0.16.1/jmx_prometheus_javaagent-0.16.1.jar

# Añadir script de entrada y plantillas
COPY docker-entrypoint.sh $KETTLE_HOME/docker-entrypoint.sh

# Cambiar directorio de trabajo
WORKDIR $KETTLE_HOME

# Download and Apply Patches
RUN wget --progress=dot:giga https://github.com/zhicwu/pdi-cluster/releases/download/${PDI_PATCH}/pentaho-kettle-${PDI_PATCH}.jar \
	&& unzip -q pentaho-kettle*.jar -d classes \
	&& rm -f pentaho-kettle*.jar

# Descargar controladores JDBC
RUN wget --no-check-certificate --progress=dot:giga https://jdbc.postgresql.org/download/postgresql-${POSTGRESQL_DRIVER_VERSION}.jar \
    && curl -L -o ojdbc8.jar https://download.oracle.com/otn-pub/otn_software/jdbc/${ORACLE_VERSION}/ojdbc8.jar \
    && rm -f lib/postgre*.jar lib/ojdbc*.jar \
    && mv *.jar lib/.

# Install Plugins
# TODO:
# 1) https://github.com/graphiq-data/pdi-streamschemamerge-plugin
# 2) https://github.com/graphiq-data/pdi-fastjsoninput-plugin

# Configure PDI
# plugins/kettle5-log4j-plugin/log4j.xml
RUN rm -rf system/osgi/log4j.xml classes/log4j.xml pwd/* simple-jndi/* system/karaf/data/tmp \
	&& ln -s $JMX_EXPORTER_FILE jmx-exporter.jar \
	&& mkdir -p /var/spool/cron/crontabs \
	&& echo "01 * * * * /usr/local/bin/purge-old-files.sh 2>>/var/log/cron.log" > /var/spool/cron/crontabs/root \
	&& chmod 0600 /var/spool/cron/crontabs/root \
	&& chmod +x *.sh /usr/local/bin/*.sh \
	&& sed -i -e 's|\(.*if \[ \$OS = "linux" \]; then\)|if \[ \$OS = "n/a" \]; then|' spoon.sh \
	&& if [ -f system/karaf/etc/org.apache.karaf.features.cfg ]; then \
           sed -i 's/^\(respectStartLvlDuringFeatureStartup=\).*/\1true/' system/karaf/etc/org.apache.karaf.features.cfg \
           && sed -i 's/^\(featuresBootAsynchronous=\).*/\1false/' system/karaf/etc/org.apache.karaf.features.cfg; \
       fi

# Definir punto de entrada
ENTRYPOINT ["./docker-entrypoint.sh"]

#VOLUME ["$KETTLE_HOME/logs", "$KETTLE_HOME/system/karaf/caches", "$KETTLE_HOME/system/karaf/data", "/tmp"]

#  8080 - Carte Web Service
#  8802 - Karaf SSHD
#  9052 - OSGi Service
#EXPOSE 8080 8802 9052

#CMD ["slave"]
