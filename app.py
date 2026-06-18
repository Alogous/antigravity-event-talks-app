from flask import Flask, jsonify, render_template
import xml.etree.ElementTree as ET
import requests
from bs4 import BeautifulSoup
import os

app = Flask(__name__)

# Cache for fetched releases to speed up requests
cache = {
    "data": None,
    "last_fetched": None
}

def fetch_and_parse_releases():
    url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
    response = requests.get(url, timeout=15)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch feed: status code {response.status_code}")
    
    root = ET.fromstring(response.content)
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    
    entries = []
    for entry in root.findall('atom:entry', ns):
        date = entry.find('atom:title', ns).text.strip()
        updated = entry.find('atom:updated', ns).text.strip()
        
        # Link handling (alternate link)
        link = ""
        for l in entry.findall('atom:link', ns):
            if l.attrib.get('rel') == 'alternate' or not l.attrib.get('rel'):
                link = l.attrib.get('href', '')
                break
                
        content_elem = entry.find('atom:content', ns)
        content_html = content_elem.text if content_elem is not None else ""
        
        # Parse content HTML and split into sub-updates by <h3> tags
        soup = BeautifulSoup(content_html, 'html.parser')
        sub_updates = []
        
        current_type = "Update"
        current_content_nodes = []
        
        # bs4 .contents lets us traverse direct child elements and strings
        for element in soup.contents:
            if element.name == 'h3':
                # If we have accumulated contents, save them before moving to next h3
                if current_content_nodes:
                    html_content = "".join(str(node) for node in current_content_nodes).strip()
                    plain_text = BeautifulSoup(html_content, 'html.parser').get_text().strip()
                    sub_updates.append({
                        'type': current_type,
                        'html': html_content,
                        'plain_text': plain_text
                    })
                current_type = element.get_text().strip()
                current_content_nodes = []
            else:
                current_content_nodes.append(element)
                
        # Append the last accumulated section
        if current_content_nodes:
            html_content = "".join(str(node) for node in current_content_nodes).strip()
            plain_text = BeautifulSoup(html_content, 'html.parser').get_text().strip()
            # Clean up trailing spaces/newlines
            if html_content or current_type != "Update":
                sub_updates.append({
                    'type': current_type,
                    'html': html_content,
                    'plain_text': plain_text
                })
        
        # If no updates were split (empty content or no structure), put the whole content
        if not sub_updates and content_html.strip():
            plain_text = soup.get_text().strip()
            sub_updates.append({
                'type': 'Update',
                'html': content_html,
                'plain_text': plain_text
            })
            
        entries.append({
            'date': date,
            'updated': updated,
            'link': link,
            'updates': sub_updates
        })
        
    return entries

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/releases', methods=['GET'])
def get_releases():
    try:
        # Check cache, fetch if not loaded
        if not cache["data"]:
            cache["data"] = fetch_and_parse_releases()
        return jsonify({
            "status": "success",
            "releases": cache["data"]
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/refresh', methods=['POST'])
def refresh_releases():
    try:
        cache["data"] = fetch_and_parse_releases()
        return jsonify({
            "status": "success",
            "releases": cache["data"]
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    # Run locally on port 5000
    app.run(debug=True, port=5000)
