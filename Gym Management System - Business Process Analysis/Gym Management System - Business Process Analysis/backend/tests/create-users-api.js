const http = require('http');

// Step 1: Login as admin
const loginData = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const users = [
  { username: 'Manager', password: '111222', email: 'manager@gym.com', fullName: 'Quan Ly', phoneNumber: '0900000001', role: 'admin' },
  { username: 'letan1', password: '111222', email: 'letan1@gym.com', fullName: 'Le Tan 1', phoneNumber: '0900000002', role: 'receptionist' },
  { username: 'vanbhlv', password: '111222', email: 'vanbhlv@gym.com', fullName: 'Van BHLV', phoneNumber: '0900000003', role: 'trainer' },
  { username: 'nguyenvana', password: '111222', email: 'nguyenvana@gym.com', fullName: 'Nguyen Van A', phoneNumber: '0900000004', role: 'customer' }
];

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(responseData)); }
        catch (e) { resolve({ error: responseData }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function createUsers() {
  try {
    // Try to login as admin
    console.log('Login as admin...');
    const loginRes = await makeRequest(loginOptions, loginData);
    
    if (!loginRes.token) {
      console.log('Admin login failed:', loginRes.message || 'No token');
      console.log('Trying to create admin user directly via MongoDB...');
      return;
    }
    
    console.log('Admin logged in, token received');
    const token = loginRes.token;
    
    // Create each user
    for (const user of users) {
      const userData = JSON.stringify(user);
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
          'Content-Length': userData.length
        }
      };
      
      try {
        const res = await makeRequest(options, userData);
        if (res.user) {
          console.log(`✅ Created: ${user.username} (${user.role})`);
        } else {
          console.log(`⚠️ ${user.username}: ${res.message || 'Unknown error'}`);
        }
      } catch (e) {
        console.log(`❌ ${user.username}: ${e.message}`);
      }
    }
    
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createUsers();
