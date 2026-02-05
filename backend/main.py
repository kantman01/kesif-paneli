from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
# Sadece senin subdomaininden gelen isteklere yanıt verir (Güvenlik için)
CORS(app) 

def get_subdomains(domain):
    # crt.sh API kullanımı
    url = f"https://crt.sh/?q=%25.{domain}&output=json"
    try:
        response = requests.get(url, timeout=20)
        if response.status_code == 200:
            # Tekil sonuçları ayıkla
            subs = sorted(list(set(item['name_value'] for item in response.json())))
            return subs
    except Exception as e:
        return []
    return []

@app.route('/scan', methods=['POST'])
def scan():
    data = request.json
    target = data.get('domain')
    if not target:
        return jsonify({"error": "Eksik veri"}), 400
    
    results = get_subdomains(target)
    return jsonify({"domain": target, "subdomains": results})

if __name__ == '__main__':
    # host='0.0.0.0' Windows sunucunun dış dünyaya kapısını açar
    app.run(host='0.0.0.0', port=5000)