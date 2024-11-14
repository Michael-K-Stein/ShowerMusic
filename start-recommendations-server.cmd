SET NODE_TLS_REJECT_UNAUTHORIZED=0
SET SERVER_DIR="src\recommendations"

npm run build --prefix %SERVER_DIR% ^
    && cls ^
    && npm start --prefix %SERVER_DIR%