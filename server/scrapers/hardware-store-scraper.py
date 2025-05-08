import trafilatura
import json
import os
import sys
import urllib.parse
import random
from typing import Dict, List, Optional, Union

# Simple cache to avoid repeated requests
cache = {}

def get_website_text_content(url: str) -> str:
    """
    This function takes a url and returns the main text content of the website.
    The text content is extracted using trafilatura and easier to understand.
    """
    if url in cache:
        return cache[url]
        
    # Send a request to the website
    downloaded = trafilatura.fetch_url(url)
    text = trafilatura.extract(downloaded)
    
    if text:
        cache[url] = text
        return text
    return "Could not extract content from the website."

def search_hardware_store(query: str, store: str = "homedepot") -> List[Dict]:
    """
    Search for products in a hardware store.
    Returns a list of products with name, price, and availability.
    """
    # For this example, we'll use a combination of mock data and real data extraction
    # In a real application, you would parse the actual search results
    
    # Clean and encode the query for URL
    encoded_query = urllib.parse.quote(query)
    
    # Simulate store-specific URLs
    urls = {
        "homedepot": f"https://www.homedepot.com/s/{encoded_query}",
        "lowes": f"https://www.lowes.com/search?searchTerm={encoded_query}",
        "aceharware": f"https://www.acehardware.com/search?query={encoded_query}"
    }
    
    # Define store information
    store_info = {
        "homedepot": {"name": "Home Depot", "address": "3721 W Dublin Granville Rd, Columbus, OH 43235"},
        "lowes": {"name": "Lowe's", "address": "2345 Silver Dr, Columbus, OH 43211"},
        "aceharware": {"name": "Ace Hardware", "address": "4780 Reed Rd, Columbus, OH 43220"}
    }
    
    if store not in urls:
        return []
        
    # For demo purposes, use fixed results to avoid rate limiting
    # You would normally scrape the actual website here
    
    # Create a deterministic but varied price for the same item at different stores
    base_price = sum(ord(c) for c in query) % 10000 + 1000  # Between $10-$110
    
    # Create store-specific variation
    if store == "homedepot":
        price_factor = 1.0
    elif store == "lowes":
        price_factor = 0.95  # Slightly cheaper
    else:
        price_factor = 1.05  # Slightly more expensive
        
    price = int(base_price * price_factor)
    
    # Generate a more specific product name based on the query
    if "switch" in query.lower():
        specific_name = f"{query.title()} - Single Pole"
    elif "faucet" in query.lower():
        specific_name = f"{query.title()} - Chrome Finish"
    elif "pipe" in query.lower():
        specific_name = f"{query.title()} - 10ft Length"
    else:
        specific_name = query.title()
    
    # Create mock product data
    product = {
        "id": hash(f"{store}_{query}") % 10000,
        "name": specific_name,
        "price": price,
        "inStock": True,
        "image": f"https://example.com/{store}_{encoded_query}.jpg",
        "description": f"Professional grade {query.lower()} for residential and commercial use",
        "store": store_info[store]["name"],
        "address": store_info[store]["address"],
        "distance": f"{(random.random() * 10):.1f} miles"
    }
    
    return [product]

def search_all_stores(query: str) -> List[Dict]:
    """Search all supported hardware stores for a product"""
    
    stores = ["homedepot", "lowes", "aceharware"]
    results = []
    
    for store in stores:
        store_results = search_hardware_store(query, store)
        results.extend(store_results)
    
    # Sort by price
    results.sort(key=lambda x: x["price"])
    
    return results

if __name__ == "__main__":
    # Accept a search query as a command line argument
    if len(sys.argv) > 1:
        query = sys.argv[1]
        results = search_all_stores(query)
        print(json.dumps(results, indent=2))
    else:
        print(json.dumps({"error": "No search query provided"}))