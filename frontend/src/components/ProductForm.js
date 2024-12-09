import React, { useState, useEffect } from 'react'
import { Form, Button, Image } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function ProductForm() {
  const [product, setProduct] = useState({
    name: '',
    quantity: 0,
    inStock: true,
    productImage: '',
    price: 0,
    expiryDate: '',
    categoryId: ''
  })
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { error: 'Você precisa estar autenticado para acessar esta página.' } });
    } else {
      fetchCategories()
      if (id) {
        fetchProduct()
      }
    }
    
  }, [id])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3335/api/v1/categories')
      if (Array.isArray(response.data)) {
        setCategories(response.data)
      } else {
        setError('Unexpected data format received from the categories API')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Failed to fetch categories. Please try again later.')
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:3335/api/v1/products/${id}`)
      setProduct(response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Failed to fetch product. Please try again later.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (id) {
        await axios.put(`http://localhost:3335/api/v1/products/${id}`, product)
      } else {
        await axios.post('http://localhost:3335/api/v1/products', product)
      }
      navigate('/products')
    } catch (error) {
      console.error('Error saving product:', error)
      setError('Failed to save product. Please try again later.')
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>
  }

  return (
    <div>
      <h2>{id ? 'Edit Product' : 'Add New Product'}</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" name="name" value={product.name} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Quantity</Form.Label>
          <Form.Control type="number" name="quantity" value={product.quantity} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check 
            type="checkbox" 
            label="In Stock" 
            name="inStock" 
            checked={product.inStock} 
            onChange={handleChange} 
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Product Image URL</Form.Label>
          <Form.Control type="text" name="productImage" value={product.productImage} onChange={handleChange} required />
        </Form.Group>
        {product.productImage && (
          <Image src={product.productImage} alt="Product Preview" className="mb-3" width={100} height={100} rounded />
        )}
        <Form.Group className="mb-3">
          <Form.Label>Price</Form.Label>
          <Form.Control type="number" name="price" value={product.price} onChange={handleChange} step="0.01" required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Expiry Date</Form.Label>
          <Form.Control 
            type="date" 
            name="expiryDate" 
            value={product.expiryDate ? product.expiryDate.split('T')[0] : ''} 
            onChange={handleChange} 
            required 
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select name="categoryId" value={product.categoryId} onChange={handleChange} required>
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Button variant="primary" type="submit">
          {id ? 'Update' : 'Create'} Product
        </Button>
      </Form>
    </div>
  )
}