import React, { useState, useEffect } from 'react'
import { Table, Button, Image } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3335/api/v1/products')
      console.log('API Response:', response.data)
      
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data)
      } else {
        setError('Unexpected data format received from the API')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to fetch products. Please try again later.')
    }
  }

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:3335/api/v1/products/${id}`)
        fetchProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
        setError('Failed to delete product. Please try again later.')
      }
    }
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>
  }

  return (
    <div>
      <h2>Produtos</h2>
      <Link to="/products/new" className="btn btn-primary mb-3">Criar Produto</Link>
      {products.length === 0 ? (
        <p>No products found. Try adding some!</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Imagem</th>
              <th>Nome</th>
              <th>Quantidade</th>
              <th>Estoque</th>
              <th>Preço</th>
              <th>Expiração</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <Image src={product.productImage} alt={product.name} width={50} height={50} rounded />
                </td>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
                <td>{product.inStock ? 'Yes' : 'No'}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{new Date(product.expiryDate).toLocaleDateString()}</td>
                <td>
                  <Link to={`/products/edit/${product.id}`} className="btn btn-sm btn-info me-2">Editar</Link>
                  <Button variant="danger" size="sm" onClick={() => deleteProduct(product.id)}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}