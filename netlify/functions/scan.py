import json
import requests

def get_subdomains(domain):
    # API URL'sini temizle
    target_domain = domain.strip().lower()
    url = f"https://crt.sh/?q=%25.{target_domain}&output=json"
    
    try:
        # User-agent eklemek crt.sh'ın engellemesini önler
        headers = {'User-Agent': 'Mozilla/5.0 ReconLens/1.0'}
        response = requests.get(url, headers=headers, timeout=25) 
        
        if response.status_code == 200:
            data = response.json()
            subs = set()
            for item in data:
                name = item['name_value'].lower()
                # Birden fazla subdomain tek satırda gelebilir (\n ile ayrılmış)
                for sub_name in name.split("\n"):
                    # Wildcard (*) içermeyenleri ekle
                    if "*" not in sub_name:
                        subs.add(sub_name)
            
            return sorted(list(subs))
            
    except Exception as e:
        print(f"Hata detayı: {e}")
        return []
    return []

def handler(event, context):
    """
    Netlify bu fonksiyonu her istek geldiğinde tetikler.
    """
    
    # Sadece POST isteklerine izin ver
    if event['httpMethod'] != 'POST':
        return {
            'statusCode': 405,
            'body': json.dumps({"error": "Sadece POST metodu desteklenir"})
        }

    try:
        # Gelen JSON verisini oku
        if not event['body']:
            return {
                'statusCode': 400,
                'body': json.dumps({"error": "İstek gövdesi boş olamaz"})
            }
            
        body = json.loads(event['body'])
        target = body.get('domain')

        if not target:
            return {
                'statusCode': 400,
                'body': json.dumps({"error": "Lütfen bir domain giriniz"})
            }

        # Subdomainleri çek
        results = get_subdomains(target)

        # Yanıtı döndür
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',  # CORS izni (Dışarıdan erişim için)
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                "status": "success",
                "domain": target, 
                "count": len(results),
                "subdomains": results
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({"error": str(e)})
        }