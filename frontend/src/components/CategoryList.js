import React, { useState, useEffect } from 'react'
import { Table, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

export default function CategoryList() {
  const [categories, setCategories] = useState([])
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { error: 'Você precisa estar autenticado para acessar esta página.' } });
    } else {
      fetchCategories();
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3335/api/v1/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`http://localhost:3335/api/v1/categories/${id}`)
        fetchCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  return (
    <div>
      <h2>Categorias</h2>
      <Link to="/categories/new" className="btn btn-primary mb-3">Criar Categoria</Link>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>{category.name}</td>
              <td>
                <Link to={`/categories/edit/${category.id}`} className="btn btn-sm btn-info me-2">Editar</Link>
                <Button variant="danger" size="sm" onClick={() => deleteCategory(category.id)}>Excluir</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}