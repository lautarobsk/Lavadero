from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from core.models import Employee

class RegisterTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_success_full_data(self):
        data = {
            'first_name': 'Juan',
            'last_name': 'Pérez',
            'dni': '38.123.456',
            'phone': '341 555-1234',
            'email': 'juan@example.com',
            'password': 'password123'
        }
        response = self.client.post('/api/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['dni'], '38123456')
        self.assertEqual(response.data['user']['first_name'], 'Juan')
        self.assertEqual(response.data['user']['last_name'], 'Pérez')
        self.assertEqual(response.data['user']['email'], 'juan@example.com')
        self.assertEqual(response.data['user']['phone'], '341 555-1234')
        self.assertIn('tokens', response.data)

        # Verificar BD
        user = User.objects.get(username='38123456')
        self.assertEqual(user.first_name, 'Juan')
        self.assertEqual(user.last_name, 'Pérez')
        self.assertEqual(user.email, 'juan@example.com')
        employee = Employee.objects.get(user=user)
        self.assertEqual(employee.phone, '341 555-1234')

    def test_register_success_optional_fields_empty(self):
        data = {
            'first_name': 'María',
            'last_name': 'González',
            'dni': '40111222',
            'phone': '',
            'email': '',
            'password': 'pass'
        }
        response = self.client.post('/api/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['dni'], '40111222')
        self.assertEqual(response.data['user']['email'], '')

        user = User.objects.get(username='40111222')
        self.assertEqual(user.email, '')
        employee = Employee.objects.get(user=user)
        self.assertEqual(employee.phone, '')

    def test_register_duplicate_dni(self):
        User.objects.create_user(username='35000000', password='pass')
        data = {
            'first_name': 'Carlos',
            'last_name': 'López',
            'dni': '35000000',
            'password': 'pass'
        }
        response = self.client.post('/api/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('dni', response.data)

    def test_register_invalid_dni_format(self):
        data = {
            'first_name': 'Ana',
            'last_name': 'Ruiz',
            'dni': '35A12B',
            'password': 'pass'
        }
        response = self.client.post('/api/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('dni', response.data)

    def test_register_missing_required_fields(self):
        data = {
            'first_name': '',
            'last_name': '',
            'dni': '',
            'password': 'pass'
        }
        response = self.client.post('/api/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('first_name', response.data)
        self.assertIn('last_name', response.data)
        self.assertIn('dni', response.data)

