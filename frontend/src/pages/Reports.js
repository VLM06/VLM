import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reports = ({ token }) => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading reports...</div>;

  return (
    <div className="reports">
      <h2>📈 Reports & Analytics</h2>

      {reports && (
        <>
          <div style={{ marginTop: '20px' }}>
            <h3>Sales by Status</h3>
            <div className="table-container" style={{ marginTop: '15px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.salesByStatus.map((stat, idx) => (
                    <tr key={idx}>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: stat._id === 'completed' ? '#27ae60' : '#f39c12',
                          color: 'white',
                          fontSize: '12px'
                        }}>
                          {stat._id}
                        </span>
                      </td>
                      <td>{stat.count}</td>
                      <td>${stat.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3>Top Products</h3>
            <div className="table-container" style={{ marginTop: '15px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Total Quantity Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.topProducts.length === 0 ? (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', color: '#999' }}>No sales data</td>
                    </tr>
                  ) : (
                    reports.topProducts.map((product, idx) => (
                      <tr key={idx}>
                        <td>{product._id}</td>
                        <td>{product.quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
