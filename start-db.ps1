$MONGOD_EXE = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
$DB_PATH = "C:\mongodb_data"

if (-not (Test-Path $DB_PATH)) {
    New-Item -ItemType Directory -Path $DB_PATH
}

Write-Host "Starting MongoDB on port 27017..." -ForegroundColor Green
& $MONGOD_EXE --dbpath $DB_PATH --port 27017
