import PDFDocument from "pdfkit";
import { Readable } from "stream";

interface BudgetPDFData {
  budget: {
    id: number;
    title: string;
    description: string | null;
    laborCost: string;
    laborHours: string;
    materialCost: string;
    thirdPartyCost: string;
    otherDirectCosts: string;
    totalDirectCosts: string;
    indirectCostsTotal: string;
    totalCosts: string;
    profitMargin: string;
    grossValue: string;
    cbsRate: string;
    cbsAmount: string;
    ibsRate: string;
    ibsAmount: string;
    totalConsumptionTaxes: string;
    finalPrice: string;
    irpjAmount: string;
    csllAmount: string;
    netProfit: string;
    effectiveMargin: string;
    status: string;
    createdAt: Date;
  };
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export async function generateBudgetPDF(data: BudgetPDFData & { items?: any[] }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Cabeçalho com Logo e Dados da Empresa
    const logoPath = "/home/ubuntu/erp_system/server/assets/logo_wiisite.png";
    const logoWidth = 80;
    const logoHeight = 40;
    const logoX = 40;
    const logoY = 40;

    // Logo à esquerda (com tratamento de erro)
    try {
      const fs = require('fs');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, logoX, logoY, { width: logoWidth, height: logoHeight });
      } else {
        console.warn('Logo não encontrada:', logoPath);
      }
    } catch (error: any) {
      console.error('Erro ao carregar logo:', error?.message || error);
    }

    // Dados da empresa à direita
    const companyX = 350;
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("WIISITE DIGITAL LTDA - ME", companyX, logoY, { align: "right" });

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#64748b")
      .text("CNPJ: 55.895.370/0001-26", companyX, logoY + 12, { align: "right" });

    doc
      .text("Tel: (11) 99492-3018", companyX, logoY + 22, { align: "right" });

    // Mover para baixo do logo
    doc.y = logoY + logoHeight + 10;

    // Linha separadora
    doc
      .strokeColor("#2563eb")
      .lineWidth(1)
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .stroke()
      .moveDown(0.5);

    // Número do Orçamento
    doc
      .fillColor("#000000")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`ORÇAMENTO Nº ${data.budget.budgetNumber || data.budget.id.toString().padStart(6, "0")}`, { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#64748b")
      .text(`Emitido em ${new Date(data.budget.createdAt).toLocaleDateString("pt-BR")}`, { align: "center" })
      .moveDown(0.8);

    // Dados do Cliente - Compacto
    const clientBoxY = doc.y;
    doc
      .fillColor("#f1f5f9")
      .rect(40, clientBoxY, 515, 55)
      .fill();

    doc
      .fillColor("#1e40af")
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("CLIENTE", 50, clientBoxY + 8);

    const customerName = data.budget.customerName || data.customer?.name || "Não informado";
    const customerEmail = data.budget.customerEmail || data.customer?.email || "";
    const customerPhone = data.budget.customerPhone || data.customer?.phone || "";
    const customerAddress = data.budget.customerAddress || "";

    doc
      .fillColor("#000000")
      .fontSize(8)
      .font("Helvetica")
      .text(`Nome: ${customerName}`, 50, clientBoxY + 22);

    if (customerEmail || customerPhone) {
      doc.text(
        `${customerEmail ? `Email: ${customerEmail}` : ""}${customerEmail && customerPhone ? " | " : ""}${customerPhone ? `Tel: ${customerPhone}` : ""}`,
        50,
        clientBoxY + 34
      );
    }

    if (customerAddress) {
      doc.text(`Endereço: ${customerAddress}`, 50, clientBoxY + 46, { width: 500 });
    }

    doc.moveDown(1.5);

    // Título e Descrição - Compacto
    doc
      .fillColor("#000000")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(data.budget.title, { align: "left" })
      .moveDown(0.3);

    if (data.budget.description) {
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#64748b")
        .text(data.budget.description, { align: "left", width: 515 })
        .moveDown(0.5);
    }

    // Serviços inclusos (se houver items)
    if (data.items && data.items.length > 0) {
      doc.fillColor("#1e40af").fontSize(9).font("Helvetica-Bold").text("SERVIÇOS INCLUSOS", 40);
      doc.moveDown(0.3);

      doc.fontSize(8).font("Helvetica").fillColor("#000000");
      data.items.forEach((item: any) => {
        doc.text(`• ${item.productName || item.description || 'Serviço'}`, 50);
      });
      doc.moveDown(0.5);
    }

    // Formatação de moeda
    const formatCurrency = (value: string | number) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return "R$ 0,00";
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(numValue);
    };

    // Impostos
    const startY = doc.y;
    doc.fillColor("#1e40af").fontSize(9).font("Helvetica-Bold").text("IMPOSTOS INCLUSOS", 40, startY);
    doc.moveDown(0.5);

    doc.fontSize(8).font("Helvetica").fillColor("#000000");
    doc.text(`CBS (${data.budget.cbsRate}%): ${formatCurrency(data.budget.cbsAmount)}`, 40);
    doc.text(`IBS (${data.budget.ibsRate}%): ${formatCurrency(data.budget.ibsAmount)}`, 40);
    doc.text(`IRPJ: ${formatCurrency(data.budget.irpjAmount)}`, 40);
    doc.text(`CSLL: ${formatCurrency(data.budget.csllAmount)}`, 40);
    doc.font("Helvetica-Bold").text(`Total Impostos: ${formatCurrency(data.budget.totalConsumptionTaxes)}`, 40);
    doc.moveDown(0.5);

    // Valor Total em Destaque
    doc.moveDown(3);
    const totalBoxY = doc.y;
    doc
      .fillColor("#2563eb")
      .rect(40, totalBoxY, 515, 30)
      .fill();

    doc
      .fillColor("#ffffff")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`VALOR TOTAL: ${formatCurrency(data.budget.finalPrice)}`, 40, totalBoxY + 10, {
        width: 515,
        align: "center",
      });

    // Rodapé Compacto
    doc
      .moveDown(1.5)
      .fontSize(7)
      .fillColor("#64748b")
      .font("Helvetica")
      .text("Este orçamento é válido por 30 dias a partir da data de emissão.", { align: "center" })
      .moveDown(0.3)
      .text("Valores sujeitos a alteração sem aviso prévio.", { align: "center" });

    doc.end();
  });
}
