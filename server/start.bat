@echo off
start npm start
timeout /t 2 /nobreak > NUL
start vivaldi.exe http://localhost:3000