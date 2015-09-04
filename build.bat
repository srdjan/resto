@echo off

set targetFolder=%~dp0examples\apple-farm\lib
echo Target folder: %targetFolder%

babel src --out-dir %targetFolder%

