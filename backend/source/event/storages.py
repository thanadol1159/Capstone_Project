from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage

class MediaStorage(S3Boto3Storage):
    bucket_name = 'media'
    custom_domain = f"{settings.MINIO_ENDPOINT}/{bucket_name}"

class StaticStorage(S3Boto3Storage):
    bucket_name = 'static'
    custom_domain = f"{settings.MINIO_ENDPOINT}/{bucket_name}"
