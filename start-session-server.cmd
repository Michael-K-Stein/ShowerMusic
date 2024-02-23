SET SERVER_DIR="src\session-server"

npm run build --prefix %SERVER_DIR% ^
    && cls ^
    && npm start --prefix %SERVER_DIR%