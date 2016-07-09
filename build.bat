@echo off

set targetFolder=%~dp0examples\apple-farm\lib
echo Target folder: %targetFolder%

node src/index.js

xcopy /S /I /Y %~dp0hal-browser %~dp0examples\apple-farm\hal-browser\
xcopy /S /I /Y %~dp0src %~dp0examples\apple-farm\lib\


