module.exports = async function saveCloudLead(payload) {
  const url = process.env.GOOGLE_SCRIPT_URL;
  const token = process.env.LEAD_API_TOKEN;
  if (!url || !token) throw new Error('Cloud lead storage is not configured');
  const response = await fetch(url, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({token, lead: payload}), signal: AbortSignal.timeout(20000)
  });
  const result = await response.json();
  if (!response.ok || result.ok !== true || !result.id) throw new Error('Cloud lead save failed');
  return result.id;
};
