@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM Required ENV vars:
@REM   JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars
@REM   MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM   MAVEN_BATCH_PAUSE - set to 'on' to wait for a keystroke before ending
@REM   MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM       set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM   MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------

@IF "%__MAVEN_CMD_ECHO__%" == "on" ECHO ON

@REM enable echoing by setting MAVEN_BATCH_ECHO to 'on'
@IF "%MAVEN_BATCH_ECHO%" == "on" ECHO ON

@REM set %HOME% to equivalent of $HOME
IF "%HOME%" == "" (SET "HOME=%HOMEDRIVE%%HOMEPATH%")

@REM Execute a user defined script before this one
IF EXIST "%HOME%\mavenrc_pre.cmd" CALL "%HOME%\mavenrc_pre.cmd"

SET MAVEN_PROJECTBASEDIR=%~dp0

IF NOT "%MAVEN_SKIP_RC%" == "" GOTO skipRcPre
@REM check for pre script, once with legacy .bat ending and once with .cmd ending
IF EXIST "%USERPROFILE%\mavenrc_pre.bat"  CALL "%USERPROFILE%\mavenrc_pre.bat" %*
IF EXIST "%USERPROFILE%\mavenrc_pre.cmd"  CALL "%USERPROFILE%\mavenrc_pre.cmd" %*
:skipRcPre

SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

SET DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties") DO (
    IF "%%A"=="wrapperUrl" SET DOWNLOAD_URL=%%B
)

@REM Find the script path
SET MAVEN_CMD_LINE_ARGS=%*

SET MAVEN_JAVA_EXE="%JAVA_HOME%\bin\java.exe"
IF NOT EXIST %MAVEN_JAVA_EXE% SET MAVEN_JAVA_EXE=java

:OkJava

SET WRAPPER_DIR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper

IF NOT EXIST %WRAPPER_JAR% (
    echo Downloading Maven Wrapper...
    powershell -Command "&{$webclient = new-object System.Net.WebClient; $webclient.DownloadFile(%DOWNLOAD_URL%, %WRAPPER_JAR%)}"
)

%MAVEN_JAVA_EXE% -cp %WRAPPER_JAR% %WRAPPER_LAUNCHER% %MAVEN_CMD_LINE_ARGS%

IF NOT "%MAVEN_SKIP_RC%" == "" GOTO skipRcPost
@REM check for post script, once with legacy .bat ending and once with .cmd ending
IF EXIST "%USERPROFILE%\mavenrc_post.bat" CALL "%USERPROFILE%\mavenrc_post.bat"
IF EXIST "%USERPROFILE%\mavenrc_post.cmd" CALL "%USERPROFILE%\mavenrc_post.cmd"
:skipRcPost
