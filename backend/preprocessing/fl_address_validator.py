import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class USPSAPIService:
    """Service for interacting with USPS API"""

    def __init__(self):
        self.client_id = os.getenv('USPS_CLIENT_ID')
        self.client_secret = os.getenv('USPS_CLIENT_SECRET')
        self.base_url = 'https://apis.usps.com'
        self.access_token = None

    def get_access_token(self):
        """Get OAuth2 access token from USPS API"""
        url = f'{self.base_url}/oauth2/v3/token'

        payload = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'grant_type': 'client_credentials'
        }

        headers = {
            'Content-Type': 'application/json'
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()

            data = response.json()
            self.access_token = data.get('access_token')

            print(f"Successfully obtained access token")
            print(f"Token: {self.access_token[:20]}..." if self.access_token else "No token received")

            return self.access_token

        except requests.exceptions.RequestException as e:
            print(f"Error obtaining access token: {e}")
            if hasattr(e.response, 'text'):
                print(f"Response: {e.response.text}")
            return None

    def validate_fl_address(self, address_data=None):
        """Validate a Florida address using USPS API"""
        if not self.access_token:
            print("No access token available. Getting token first...")
            self.get_access_token()

        # Hardcoded test address for now
        street_address = "610 SW 3Rd St"
        zip = "32601"
        state = "FL"

        url = f'{self.base_url}/addresses/v3/address'

        params = {
            'streetAddress': street_address,
            'ZIPCode': zip,
            'state': state
        }

        headers = {
            'accept': 'application/json',
            'Authorization': f'Bearer {self.access_token}'
        }

        try:
            print(f"\nValidating address: {street_address}, {zip}, {state}")
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()

            data = response.json()
            print(f"Address validation successful!")
            print(f"Response: {data}")

            return data

        except requests.exceptions.RequestException as e:
            print(f"Error validating address: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response status: {e.response.status_code}")
                print(f"Response: {e.response.text}")
            return None



def test_usps_service():
    """Test the USPS API service"""
    print("=" * 60)
    print("USPS API Service Test")
    print("=" * 60)

    # Initialize service
    service = USPSAPIService()

    # Check if credentials are loaded
    print(f"\nClient ID loaded: {'Yes' if service.client_id else 'No'}")
    print(f"Client Secret loaded: {'Yes' if service.client_secret else 'No'}")

    if not service.client_id or not service.client_secret:
        print("\nERROR: Missing credentials in .env file")
        return

    # Test getting access token
    print("\n--- Testing OAuth2 Token Retrieval ---")
    token = service.get_access_token()

    if token:
        print("\n✓ OAuth2 token retrieved successfully!")

        # Test address validation
        print("\n--- Testing Address Validation ---")
        result = service.validate_fl_address()

        if result:
            print("\nAll tests passed!")
        else:
            print("\nAddress validation failed")
    else:
        print("\nService test failed")

    print("=" * 60)


if __name__ == "__main__":
    test_usps_service()

