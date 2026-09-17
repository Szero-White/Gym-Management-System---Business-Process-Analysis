/**
 * Test script kiem tra 4 tai khoan dang nhap
 * Chay: node test-login-all.js
 */

const http = require('http');

const API_URL = 'localhost';
const API_PORT = 5000;

const testAccounts = [
  { username: 'Manager', password: '111222', role: 'Admin' },
  { username: 'letan1', password: '111222', role: 'Receptionist' },
  { username: 'vanbhlv', password: '111222', role: 'Trainer' },
  { username: 'nguyenvana', password: '111222', role: 'Customer' }
];

function testLogin(account) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      username: account.username,
      password: account.password
    });

    const options = {
      hostname: API_URL,
      port: API_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.token) {
            console.log(`✅ [${account.role}] ${account.username}: DANG NHAP THANH CONG`);
            resolve(true);
          } else {
            console.log(`❌ [${account.role}] ${account.username}: THAT BAI - ${parsed.message || 'Loi khong xac dinh'}`);
            resolve(false);
          }
        } catch (e) {
          console.log(`❌ [${account.role}] ${account.username}: THAT BAI - Loi ket noi`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ [${account.role}] ${account.username}: THAT BAI - ${error.message}`);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('=== KIEM TRA 4 TAI KHOAN ===\n');
  
  let successCount = 0;
  
  for (const account of testAccounts) {
    const success = await testLogin(account);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n=== KET QUA: ${successCount}/4 tai khoan hoat dong ===`);
  
  if (successCount === 0) {
    console.log('\n⚠️ TAT CA TAI KHOAN DEU LOI!');
    console.log('Nguyen nhan co the:');
    console.log('- Backend chua chay (port 5000)');
    console.log('- MongoDB chua chay');
    console.log('- Database chua co du lieu');
  } else if (successCount === 4) {
    console.log('\n✅ TAT CA TAI KHOAN DEU HOAT DONG!');
  }
}

runTests();
