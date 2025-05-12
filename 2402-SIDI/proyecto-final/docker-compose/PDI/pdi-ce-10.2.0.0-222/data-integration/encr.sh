#!/bin/sh
# ******************************************************************************
#
# Pentaho
#
# Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
#
# Use of this software is governed by the Business Source License included
# in the LICENSE.TXT file.
#
# Change Date: 2028-08-13
# ******************************************************************************


BASEDIR="`dirname $0`"
cd "$BASEDIR"
DIR="`pwd`"
cd - > /dev/null
java -cp "$DIR"/lib/pentaho-encryption-support-10.2.0.0-222.jar:"$DIR"/lib/jetty-util-9.4.51.v20230217.jar:"$DIR"/classes org.pentaho.support.encryption.Encr "$@"

