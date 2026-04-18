

async function run() {
  const result = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'nikhil', email: 'nikhilpatel102005@gmail.com', password: 'password123' })
  });
  const text = await result.text();
  console.log(result.status, text);
}
run();
