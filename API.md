# API Documentation - Nexaven License System

## Base URL

```
Production: https://nexaven.com.tr/api
Development: http://localhost:5000/api
```

---

## Authentication

### Login

Authenticate admin users and receive a JWT token.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Error)**:
```json
{
  "error": "Kullanıcı yok"
}
```

---

## License Management (Admin Only)

All license management endpoints require authentication. Include the JWT token in the `Authorization` header.

### Get All Licenses

**Endpoint**: `GET /license`

**Headers**:
```
Authorization: YOUR_JWT_TOKEN
```

**Response**:
```json
[
  {
    "id": 1,
    "license_key": "NXV-AC-2026-001",
    "owner": "Flamingo Game Arena",
    "status": "active",
    "hwid": "CPU-SSD-MAC-HASH-123",
    "ip": "192.168.1.100",
    "expires_at": "2026-12-31T23:59:59.000Z"
  }
]
```

### Create New License

**Endpoint**: `POST /license`

**Headers**:
```
Authorization: YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "license_key": "NXV-AC-2026-002",
  "owner": "Example Gaming Center",
  "days": 365
}
```

**Parameters**:
- `license_key` (string, required): Unique license key
- `owner` (string, required): License owner name
- `days` (number, optional): License duration in days. Omit for unlimited license.

**Response**:
```json
{
  "status": "ok"
}
```

---

## License Validation (Client/Game Server)

### Check License

Validate a license key with hardware ID binding.

**Endpoint**: `POST /license/check`

**Rate Limit**: 5 requests per minute per IP

**Request Body**:
```json
{
  "license_key": "NXV-AC-2026-001",
  "hwid": "CPU-SSD-MAC-HASH-123"
}
```

**Response (Valid License)**:
```json
{
  "valid": true,
  "owner": "Flamingo Game Arena",
  "expires_at": "2026-12-31T23:59:59.000Z"
}
```

**Response (Invalid - License Not Found)**:
```json
{
  "valid": false,
  "reason": "Lisans yok"
}
```

**Response (Invalid - Expired)**:
```json
{
  "valid": false,
  "reason": "Lisans süresi dolmuş"
}
```

**Response (Invalid - HWID Mismatch)**:
```json
{
  "valid": false,
  "reason": "HWID uyuşmazlığı"
}
```

**Response (Invalid - Inactive)**:
```json
{
  "valid": false,
  "reason": "Pasif lisans"
}
```

**Response (Rate Limit Exceeded)**:
```json
{
  "error": "Çok fazla istek"
}
```

**Status Code**: `429 Too Many Requests`

---

## HWID Binding Logic

1. **First Validation**: When a license is validated for the first time, the provided HWID is automatically bound to the license.
2. **Subsequent Validations**: The HWID in the request must match the bound HWID, or validation fails.
3. **HWID Format**: Any string format is accepted. Recommended to use a hash of CPU ID, MAC address, and disk serial.

---

## Integration Examples

### C# Example

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class LicenseValidator
{
    private static readonly HttpClient client = new HttpClient();
    private const string API_URL = "https://nexaven.com.tr/api/license/check";

    public static async Task<LicenseResponse> ValidateLicense(string licenseKey, string hwid)
    {
        var payload = new
        {
            license_key = licenseKey,
            hwid = hwid
        };

        var json = JsonConvert.SerializeObject(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync(API_URL, content);
        var result = await response.Content.ReadAsStringAsync();

        return JsonConvert.DeserializeObject<LicenseResponse>(result);
    }
}

public class LicenseResponse
{
    public bool valid { get; set; }
    public string owner { get; set; }
    public string expires_at { get; set; }
    public string reason { get; set; }
}
```

### Python Example

```python
import requests
import hashlib
import uuid

def get_hwid():
    """Generate HWID from MAC address"""
    mac = uuid.getnode()
    return hashlib.sha256(str(mac).encode()).hexdigest()

def validate_license(license_key):
    url = "https://nexaven.com.tr/api/license/check"
    hwid = get_hwid()
    
    payload = {
        "license_key": license_key,
        "hwid": hwid
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# Usage
result = validate_license("NXV-AC-2026-001")
if result["valid"]:
    print(f"License valid for: {result['owner']}")
else:
    print(f"License invalid: {result['reason']}")
```

### Node.js Example

```javascript
const axios = require('axios');
const crypto = require('crypto');
const { networkInterfaces } = require('os');

function getHWID() {
  const nets = networkInterfaces();
  const mac = Object.values(nets)
    .flat()
    .find(net => net.mac !== '00:00:00:00:00:00')?.mac;
  
  return crypto.createHash('sha256').update(mac).digest('hex');
}

async function validateLicense(licenseKey) {
  const hwid = getHWID();
  
  const response = await axios.post('https://nexaven.com.tr/api/license/check', {
    license_key: licenseKey,
    hwid: hwid
  });
  
  return response.data;
}

// Usage
validateLicense('NXV-AC-2026-001')
  .then(result => {
    if (result.valid) {
      console.log(`License valid for: ${result.owner}`);
    } else {
      console.log(`License invalid: ${result.reason}`);
    }
  });
```

### cURL Example

```bash
curl -X POST https://nexaven.com.tr/api/license/check \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "NXV-AC-2026-001",
    "hwid": "YOUR-HARDWARE-ID"
  }'
```

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 401 | Unauthorized (Missing or invalid JWT token) |
| 429 | Too Many Requests (Rate limit exceeded) |
| 500 | Internal Server Error |

---

## Rate Limiting

- **License Check Endpoint**: 5 requests per minute per IP address
- **Admin Endpoints**: No rate limit (protected by JWT authentication)

---

## Security Best Practices

1. **HWID Generation**: Use a combination of CPU ID, MAC address, and disk serial. Hash the result for security.
2. **HTTPS Only**: Always use HTTPS in production.
3. **Token Storage**: Store JWT tokens securely. Never expose them in client-side code.
4. **License Key Format**: Use strong, random license keys (e.g., `NXV-AC-YYYY-XXXX`).
5. **Rate Limiting**: Implement client-side caching to avoid hitting rate limits.

---

## Testing

### Test Endpoints

```bash
# Health check
curl https://nexaven.com.tr/api

# Test license validation (with dummy data)
curl -X POST https://nexaven.com.tr/api/license/check \
  -H "Content-Type: application/json" \
  -d '{"license_key":"TEST-KEY","hwid":"TEST-HWID"}'
```

---

## Support

For API support or questions:
- GitHub Issues: https://github.com/your-username/nexaven/issues
- Email: admin@nexaven.com.tr
