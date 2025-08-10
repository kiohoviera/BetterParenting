
const apiKey = process.env.OPENAI_API_KEY;

async function testOpenAIConnection() {
  try {
    console.log('Testing OpenAI API connection...');
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable not found');
    }
    
    console.log('✅ API key found in environment variables');
    console.log('API key starts with:', apiKey.substring(0, 8) + '...');
    
    // Test API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello from Replit!" in exactly 3 words.'
          }
        ],
        max_tokens: 10,
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Successfully connected to OpenAI API');
      console.log('Test response:', data.choices[0].message.content);
      console.log('Usage:', data.usage);
    } else {
      const errorData = await response.json();
      throw new Error(`API call failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    console.log('\n🎉 OpenAI API test passed! The secret is working correctly.');
    
  } catch (error) {
    console.error('❌ OpenAI API test failed:', error.message);
    if (error.message.includes('environment variable not found')) {
      console.error('Make sure you have added OPENAI_API_KEY as a secret in the Secrets tab');
    }
  }
}

testOpenAIConnection();
