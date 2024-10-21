import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function CategoryForm() {
  const [category, setCategory] = useState({ name: '' })
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      fetchCategory()
    }
  }, [id])

  const fetchCategory = async () => {
    try {
      const response = await axios.get(`http://localhost:3335/api/v1/categories/${id}`)
      setCategory(response.data)
    } catch (error) {
      console.error('Error fetching category:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (id) {
        await axios.put(`http://localhost:3335/api/v1/categories/${id}`, category)
      } else {
        await axios.post('http://localhost:3335/api/v1/categories', category)
      }
      navigate('/categories')
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleChange = (e) => {
    setCategory({ ...category, [e.target.name]: e.target.value })
  }

  return (
    <div>
      <h2>{id ? 'Edit Category' : 'Add New Category'}</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" name="name" value={category.name} onChange={handleChange} required />
        </Form.Group>
        <Button variant="primary" type="submit">
          {id ? 'Update' : 'Create'} Category
        </Button>
      </Form>
    </div>
  )
}