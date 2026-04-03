async function getModels() {
  const res = await fetch('https://api.minimax.chat/v1/models', {
    headers: {
      'Authorization': 'Bearer sk-api-PdKFgMx7Opjk1UsbdMtEzqw0sxY4gOdEijtckkn3ZT7uYZu6b9jNuhhTu_V_-1_YKojfDb0nAPLclHRmgf_i7PxzpYPSCZI06cljqN8Jl9Ujnol5Kqpi_yU'
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

getModels();
