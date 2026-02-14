import { useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";

export default function OrderPrint() {
  const params = useParams();
  const orderId = parseInt(params.id as string);
  
  const { data: orderData, isLoading } = trpc.orders.getById.useQuery({ id: orderId });

  useEffect(() => {
    if (orderData && !isLoading) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [orderData, isLoading]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p style={{ fontSize: "16px" }}>Carregando pedido...</p>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p style={{ fontSize: "16px", color: "#dc2626" }}>Pedido não encontrado</p>
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

  const statusMap: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    in_production: "Em Produção",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111827; background: #fff; }
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          @page { margin: 10mm 10mm; size: A4; }
        }
      `}</style>

      {/* Botões flutuantes */}
      <div className="no-print" style={{
        position: "fixed", top: 20, right: 20, display: "flex", gap: 8, zIndex: 100,
      }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: "10px 20px", backgroundColor: "#2563eb", color: "#fff",
            border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Imprimir
        </button>
        <button
          onClick={() => window.close()}
          style={{
            padding: "10px 20px", backgroundColor: "#6b7280", color: "#fff",
            border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Fechar
        </button>
      </div>

      <div style={{ maxWidth: "210mm", margin: "0 auto", padding: "30px 40px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

        {/* Cabeçalho */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 16, borderBottom: "2px solid #2563eb", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#1e40af" }}>WIISITE DIGITAL LTDA - ME</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>CNPJ: 55.895.370/0001-26</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>Tel: (11) 99492-3018</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>Emitido em</div>
            <div style={{ fontSize: 12, fontWeight: "bold" }}>{formatDate(order.orderDate)}</div>
          </div>
        </div>

        {/* Título do Documento */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: "bold", color: "#000" }}>PEDIDO Nº {order.orderNumber}</div>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
            Status: {statusMap[order.status] || order.status}
          </div>
        </div>

        {/* Dados do Cliente */}
        <div style={{ backgroundColor: "#f1f5f9", borderRadius: 6, padding: "12px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: "bold", color: "#1e40af", marginBottom: 6 }}>CLIENTE</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px", fontSize: 10 }}>
            <div><span style={{ fontWeight: "bold", color: "#4b5563" }}>Nome: </span>{customer?.name || "Não informado"}</div>
            {customer?.email && (
              <div><span style={{ fontWeight: "bold", color: "#4b5563" }}>Email: </span>{customer.email}</div>
            )}
            {customer?.phone && (
              <div><span style={{ fontWeight: "bold", color: "#4b5563" }}>Telefone: </span>{customer.phone}</div>
            )}
            {customer?.document && (
              <div><span style={{ fontWeight: "bold", color: "#4b5563" }}>CPF/CNPJ: </span>{customer.document}</div>
            )}
            {customer?.address && (
              <div style={{ gridColumn: "1 / -1" }}><span style={{ fontWeight: "bold", color: "#4b5563" }}>Endereço: </span>{customer.address}{customer.city ? `, ${customer.city}` : ""}{customer.state ? ` - ${customer.state}` : ""}</div>
            )}
          </div>
        </div>

        {/* Tabela de Itens */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: "bold", color: "#1e40af", marginBottom: 8 }}>ITENS DO PEDIDO</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #d1d5db", color: "#374151" }}>Produto/Serviço</th>
                <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "bold", borderBottom: "2px solid #d1d5db", color: "#374151", width: 80 }}>Qtd</th>
                <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: "bold", borderBottom: "2px solid #d1d5db", color: "#374151", width: 120 }}>Preço Unit.</th>
                <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: "bold", borderBottom: "2px solid #d1d5db", color: "#374151", width: 120 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, index: number) => (
                <tr key={item.item.id} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>
                    {item.product?.name || `Produto #${item.item.productId}`}
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>
                    {item.item.quantity}
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>
                    {formatPrice(item.item.unitPrice)}
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>
                    {formatPrice(item.item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Valor Total em Destaque */}
        <div style={{
          backgroundColor: "#2563eb", borderRadius: 6, padding: "14px 20px",
          display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 16,
        }}>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            VALOR TOTAL: {formatPrice(order.totalAmount)}
          </span>
        </div>

        {/* Observações */}
        {order.notes && (
          <div style={{ backgroundColor: "#fffbeb", borderRadius: 6, padding: "12px 16px", marginBottom: 16, border: "1px solid #fde68a" }}>
            <div style={{ fontSize: 11, fontWeight: "bold", color: "#92400e", marginBottom: 4 }}>OBSERVAÇÕES</div>
            <div style={{ fontSize: 10, color: "#78350f", lineHeight: 1.5 }}>{order.notes}</div>
          </div>
        )}

        {/* Rodapé */}
        <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid #d1d5db", textAlign: "center" }}>
          <p style={{ fontSize: 8, color: "#64748b", marginBottom: 4 }}>
            Este documento é válido como comprovante de pedido.
          </p>
          <p style={{ fontSize: 8, color: "#64748b", marginBottom: 4 }}>
            Documento gerado em {new Date().toLocaleString("pt-BR")}
          </p>
          <p style={{ fontSize: 8, color: "#94a3b8" }}>
            WIISITE DIGITAL LTDA - ME | CNPJ: 55.895.370/0001-26 | Tel: (11) 99492-3018
          </p>
        </div>

      </div>
    </>
  );
}
