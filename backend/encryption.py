from cryptography.fernet import Fernet
from config import ENCRYPTION_KEY

cipher = Fernet(ENCRYPTION_KEY)

def encrypt_file(file_path):
    """Encrypt a file using AES."""
    with open(file_path, "rb") as f:
        data = f.read()
    encrypted_data = cipher.encrypt(data)
    with open(file_path, "wb") as f:
        f.write(encrypted_data)

def decrypt_file(file_path):
    """Decrypt a file using AES."""
    with open(file_path, "rb") as f:
        encrypted_data = f.read()
    decrypted_data = cipher.decrypt(encrypted_data)
    return decrypted_data