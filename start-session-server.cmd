SET NODE_TLS_REJECT_UNAUTHORIZED=0
@REM SET NODE_EXTRA_CA_CERTS
SET SERVER_DIR="src\session-server"

npm run build --prefix %SERVER_DIR% ^
    && cls ^
    && npm start --prefix %SERVER_DIR%