@echo off
REM ******************************************************************************
REM
REM Pentaho
REM
REM Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
REM
REM Use of this software is governed by the Business Source License included
REM in the LICENSE.TXT file.
REM
REM Change Date: 2028-08-13
REM ******************************************************************************

setlocal
pushd %~dp0

SET STARTTITLE="Import"
SET SPOON_CONSOLE=1
call Spoon.bat -main org.pentaho.di.imp.Import %*
popd
