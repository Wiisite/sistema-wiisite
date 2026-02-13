import { useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";

export default function OrderPrint() {
  const params = useParams();
  const orderId = parseInt(params.id as string);
  
  const { data: orderData, isLoading } = trpc.orders.getById.useQuery({ id: orderId });

  useEffect(() => {
    // Abrir dialog de impressão automaticamente após carregar
    if (orderData && !isLoading) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [orderData, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Carregando pedido...</p>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Pedido não encontrado</p>
      </div>
    );
  }

  const { order, customer, items } = orderData;

  const formatPrice = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const statusMap = {
    pending: "Pendente",
    approved: "Aprovado",
    in_production: "Em Produção",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  return (
    <>
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 1cm;
          }
        }
        
        .print-container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .header {
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        
        .document-title {
          font-size: 20px;
          font-weight: bold;
          color: #374151;
          margin-top: 10px;
        }
        
        .info-section {
          margin-bottom: 25px;
        }
        
        .info-label {
          font-weight: bold;
          color: #4b5563;
          margin-right: 10px;
        }
        
        .info-value {
          color: #111827;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        .items-table th {
          background-color: #f3f4f6;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          border-bottom: 2px solid #d1d5db;
        }
        
        .items-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table tr:last-child td {
          border-bottom: none;
        }
        
        .total-row {
          background-color: #f9fafb;
          font-weight: bold;
          font-size: 16px;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #d1d5db;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        
        .no-print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px 20px;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .no-print-button:hover {
          background-color: #1d4ed8;
        }
      `}</style>

      <button 
        className="no-print no-print-button"
        onClick={() => window.close()}
      >
        Fechar
      </button>

      <div className="print-container">
        <div className="header">
          <div className="company-name">WIISITE DIGITAL LTDA - ME</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>CNPJ: 55.895.370/0001-26 | Tel: (11) 99492-3018</div>
          <div className="document-title">Pedido #{order.orderNumber}</div>
        </div>

        <div className="info-section">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <span className="info-label">Cliente:</span>
              <span className="info-value">{customer?.name || "-"}</span>
            </div>
            <div>
              <span className="info-label">Data:</span>
              <span className="info-value">{formatDate(order.orderDate)}</span>
            </div>
            <div>
              <span className="info-label">Status:</span>
              <span className="info-value">{statusMap[order.status as keyof typeof statusMap]}</span>
            </div>
            <div>
              <span className="info-label">Total:</span>
              <span className="info-value">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="info-section">
            <div className="info-label">Observações:</div>
            <div className="info-value" style={{ marginTop: "5px" }}>{order.notes}</div>
          </div>
        )}

        <table className="items-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th style={{ textAlign: "center" }}>Quantidade</th>
              <th style={{ textAlign: "right" }}>Preço Unit.</th>
              <th style={{ textAlign: "right" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr key={item.item.id}>
                <td>{item.product?.name || `Produto #${item.item.productId}`}</td>
                <td style={{ textAlign: "center" }}>{item.item.quantity}</td>
                <td style={{ textAlign: "right" }}>{formatPrice(item.item.unitPrice)}</td>
                <td style={{ textAlign: "right" }}>{formatPrice(item.item.subtotal)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan={3} style={{ textAlign: "right", paddingRight: "20px" }}>
                TOTAL:
              </td>
              <td style={{ textAlign: "right" }}>{formatPrice(order.totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <div className="footer">
          <p>Documento gerado em {new Date().toLocaleString("pt-BR")}</p>
          <p>WIISITE DIGITAL LTDA - ME | CNPJ: 55.895.370/0001-26</p>
        </div>
      </div>
    </>
  );
}
