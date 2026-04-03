from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['restaurant_id'] = user.restaurant.id if user.restaurant else None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add restaurant_id to the response body
        data['restaurant_id'] = self.user.restaurant.id if self.user.restaurant else None
        return data
