import cloudinary
import cloudinary.uploader
import os

def init_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True
    )

def upload_image(file, folder="avatars"):
    """Загрузить изображение в Cloudinary"""
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder=f"aggregation_games/{folder}",
            transformation=[
                {'width': 800, 'height': 800, 'crop': 'limit'},
                {'quality': 'auto'}
            ]
        )
        return result['secure_url']
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        return None

def delete_image(public_id):
    """Удалить изображение из Cloudinary"""
    try:
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception as e:
        print(f"Error deleting from Cloudinary: {e}")
        return False