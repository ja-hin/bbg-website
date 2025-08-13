// Direct test of SMS account 2000203989
import axios from 'axios';

async function testDirectSMS() {
  const baseUrl = 'https://media.smsgupshup.com/GatewayAPI/rest';
  const params = new URLSearchParams({
    userid: '2000203989',
    password: 'EEoHp1K9S',
    send_to: '919953410422',
    v: '1.1',
    format: 'json',
    msg_type: 'TEXT',
    method: 'SENDMESSAGE',
    msg: 'Direct Node.js test of SMS account 2000203989'
  });

  const fullUrl = `${baseUrl}?${params.toString()}`;
  console.log('Testing URL:', fullUrl);

  try {
    const response = await axios.get(fullUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });

    console.log('Direct SMS test response:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('Direct SMS test failed:', error.message);
    console.error('Response:', error.response?.data);
  }
}

testDirectSMS();