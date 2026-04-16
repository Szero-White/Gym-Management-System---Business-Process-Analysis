@echo off
echo === KIEM TRA 4 TAI KHOAN ===
echo.
echo Testing Manager (Admin)...
curl -s -X POST http://127.0.0.1:5000/api/auth/login -H Content-Type:application/json -d "{\"username\":\"Manager\",\"password\":\"111222\"}" | findstr token >nul && echo [OK] Manager: Thanh cong || echo [FAIL] Manager: That bai
echo.
echo Testing letan1 (Receptionist)...
curl -s -X POST http://127.0.0.1:5000/api/auth/login -H Content-Type:application/json -d "{\"username\":\"letan1\",\"password\":\"111222\"}" | findstr token >nul && echo [OK] letan1: Thanh cong || echo [FAIL] letan1: That bai
echo.
echo Testing vanbhlv (Trainer)...
curl -s -X POST http://127.0.0.1:5000/api/auth/login -H Content-Type:application/json -d "{\"username\":\"vanbhlv\",\"password\":\"111222\"}" | findstr token >nul && echo [OK] vanbhlv: Thanh cong || echo [FAIL] vanbhlv: That bai
echo.
echo Testing nguyenvana (Customer)...
curl -s -X POST http://127.0.0.1:5000/api/auth/login -H Content-Type:application/json -d "{\"username\":\"nguyenvana\",\"password\":\"111222\"}" | findstr token >nul && echo [OK] nguyenvana: Thanh cong || echo [FAIL] nguyenvana: That bai
echo.
echo === HOAN TAT ===
pause
