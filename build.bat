@echo off

set targetFolder=%~dp0examples\apple-farm\lib
echo Target folder: %targetFolder%

xcopy /S /I /Y %~dp0hal-browser %~dp0examples\apple-farm\hal-browser\

node src/server.js --out-dir %targetFolder%

