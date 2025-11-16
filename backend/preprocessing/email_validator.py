import requests
from typing import Optional, Dict


class EmailValidatorService:
    """Service for validating email addresses using rapid-email-verifier API"""

    def __init__(self):
        self.base_url = 'https://rapid-email-verifier.fly.dev/api/validate'

    def validate_email(self, email: str) -> Optional[Dict]:
        """
        Validate an email address using the rapid-email-verifier API

        Args:
            email: The email address to validate

        Returns:
            Dictionary containing validation results or None if request fails
        """
        if not email or '@' not in email:
            print(f"Invalid email format: {email}")
            return None

        params = {
            'email': email
        }

        try:
            print(f"\nValidating email: {email}")
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()

            data = response.json()

            # Display validation results
            self._display_results(email, data)

            return data

        except requests.exceptions.RequestException as e:
            print(f"Error validating email: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response status: {e.response.status_code}")
                print(f"Response: {e.response.text}")
            return None

    def _display_results(self, email: str, data: Dict):
        """Display validation results in a readable format"""
        print(f"\n{'=' * 60}")
        print(f"Email Validation Results for: {email}")
        print(f"{'=' * 60}")

        # Display all fields from the response
        for key, value in data.items():
            print(f"{key}: {value}")

        print(f"{'=' * 60}")

    def validate_batch(self, emails: list) -> Dict[str, Optional[Dict]]:
        """
        Validate multiple email addresses

        Args:
            emails: List of email addresses to validate

        Returns:
            Dictionary mapping email addresses to their validation results
        """
        results = {}

        print(f"\n{'=' * 60}")
        print(f"Batch Email Validation - {len(emails)} emails")
        print(f"{'=' * 60}")

        for email in emails:
            result = self.validate_email(email)
            results[email] = result

        return results


def test_email_validator():
    """Test the email validator service"""
    print("=" * 60)
    print("Email Validator Service Test")
    print("=" * 60)

    # Initialize service
    service = EmailValidatorService()

    # Test single email validation
    print("\n--- Testing Single Email Validation ---")

    # Test with valid email
    test_email_valid = "test@example.com"
    result1 = service.validate_email(test_email_valid)

    if result1:
        print("\nValid email test passed!")

    # Test with potentially invalid email
    test_email_invalid = "invalid.email@nonexistent-domain-12345.com"
    result2 = service.validate_email(test_email_invalid)

    if result2:
        print("\n✓ Invalid email test completed!")

    # Test batch validation
    print("\n--- Testing Batch Email Validation ---")
    test_emails = [
        "admin@gmail.com",
        "user@yahoo.com",
        "contact@test.org",
        "fake@fakefakedomain.xyz"
    ]

    batch_results = service.validate_batch(test_emails)

    print(f"\n{'=' * 60}")
    print("Batch Validation Summary")
    print(f"{'=' * 60}")
    print(f"Total emails validated: {len(batch_results)}")
    successful = sum(1 for v in batch_results.values() if v is not None)
    print(f"Successful validations: {successful}")
    print(f"Failed validations: {len(batch_results) - successful}")

    print("\nAll tests completed!")
    print("=" * 60)


if __name__ == "__main__":
    test_email_validator()

