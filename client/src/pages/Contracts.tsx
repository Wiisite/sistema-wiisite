import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Calendar, DollarSign, Edit2, FileText, Plus, Printer, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusMap = {
  active: { label: "Ativo", color: "bg-green-500" },
  suspended: { label: "Suspenso", color: "bg-yellow-500" },
  cancelled: { label: "Cancelado", color: "bg-red-500" },
  expired: { label: "Expirado", color: "bg-gray-500" },
};

const contractTypeMap: Record<string, string> = {
  maintenance: "Manutenção",
  hosting: "Hospedagem",
  support: "Suporte",
  software_license: "Licença de Software",
  other: "Outro",
};

const generateSoftwareLicenseContract = (
  customer: any,
  contractData: { monthlyValue: string; startDate: string }
) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  
  return `CONTRATO DE LICENÇA DE USO DE SOFTWARE

CONTRATANTE: ${customer?.name || '[RAZÃO SOCIAL DA EMPRESA]'}, com sede em ${customer?.address || '[ENDEREÇO]'}, bairro ${customer?.city || '[BAIRRO]'}, CEP ${customer?.zipCode || '[CEP]'}, no Estado ${customer?.state || '[ESTADO]'}, inscrita no CNPJ sob o nº ${customer?.document || '[CNPJ]'}, neste ato representada pelo seu diretor(a) [NOME DO RESPONSÁVEL], [NACIONALIDADE], [ESTADO CIVIL], [PROFISSÃO], CPF nº [CPF], residente e domiciliado em [ENDEREÇO COMPLETO].

CONTRATADA: [RAZÃO SOCIAL DA CONTRATADA], com sede em [ENDEREÇO DA CONTRATADA], inscrita no CNPJ sob o nº: [CNPJ DA CONTRATADA], neste ato representada pelo seu diretor [NOME DO DIRETOR], [NACIONALIDADE], [ESTADO CIVIL], [PROFISSÃO], CPF nº: [CPF], residente e domiciliado em [ENDEREÇO COMPLETO].

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Licença de Uso e Prestação de Serviços de Software, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.

DO OBJETO DO CONTRATO

Cláusula 1°: O presente instrumento tem como objeto a licença de uso do Software de gestão e gerenciamento ERP, de propriedade da CONTRATADA, o qual é capaz de controlar todas as informações da empresa contratante, integrando dados, recursos e processos, das áreas de vendas, finanças, contabilidade, fiscal, estoque, compras, produção e logística.

DA LICENÇA DE USO DO SOFTWARE

Cláusula 2°: A licença de uso concedida por meio deste Contrato dá à CONTRATANTE o direito não exclusivo e intransferível de usar o Software unicamente para processamento de seus dados, conforme condições aqui descritas.

Parágrafo único: Somente poderá ter acesso ao sistema a CONTRATANTE, seus funcionários e o contador da empresa contratante. Nenhuma outra pessoa poderá ter acesso ao sistema.

DA LIMITAÇÃO DE RESPONSABILIDADE

Cláusula 3°: O acesso ao Software é totalmente web e realizado através de navegadores de internet. A CONTRATADA não é responsável por disponibilizar internet para uso dos sistemas;

Cláusula 4°: As informações inseridas no sistema são de total responsabilidade da CONTRATANTE;

Cláusula 5°: A CONTRATANTE pode solicitar a migração das informações do sistema atual utilizado para o sistema contratado e cabe a CONTRATANTE a conferência das informações depois de inseridas no sistema;

Cláusula 6°: Todas as informações fiscais dos produtos para emissão de notas são de responsabilidade da CONTRATANTE e ela deverá pedir auxílio do seu contador no ato do cadastro. A CONTRATANTE é responsável por enviar todas as informações que o contador solicitar, caso precise de ajuda poderá solicitar ao suporte;

Cláusula 7°: O controle de acesso dos funcionários da empresa aos módulos do sistema recai sobre a CONTRATANTE, por sua vez, caso necessite de ajuda, poderá recorrer ao suporte da CONTRATADA para auxiliar na tarefa;

Cláusula 8°: A CONTRATADA não é responsável pelo estado da máquina, ou seja, não é responsável por formatar ou configurar o computador. Em regra, não haverá necessidade, pois o sistema é totalmente WEB e não precisa ser instalado na máquina;

Cláusula 9°: A CONTRATADA não tem responsabilidade pelas informações fiscais, somente disponibiliza o emissor de notas para o cliente usar;

Cláusula 10°: A CONTRATADA não fornece os componentes periféricos para uso na empresa (Mouse, teclado, impressora, leitor de código de barras) a compra desses equipamentos é de responsabilidade do cliente CONTRATANTE do software;

Cláusula 11°: A CONTRATADA não faz e nem é responsável por cadastrar as informações de uso do sistema (produtos, clientes, caixas, contas a pagar, contas a receber);

Cláusula 12°: A CONTRATADA não é responsável por emissão ou atualização do certificado digital, nem geração do CSC para emissão de notas. (Essas ações devem ser feitas com o contador da CONTRATANTE).

DA ATUALIZAÇÃO OU MANUTENÇÃO DO SOFTWARE

Cláusula 13°: O backup do banco de dados é feito 1x por semana e é de responsabilidade da CONTRATADA, caso o cliente solicite que sejam feitas alterações nos dados por meio de backup, então deverá ser solicitado e planejado a restauração dos dados;

Cláusula 14°: O suporte acontecerá através do AnyDesk ou Teamviewer (softwares de conexão remota) caso não seja resolvido pelos programas de conexão remota então será enviado um técnico na empresa da CONTRATANTE. O técnico será enviado de acordo com a disponibilidade.

DAS OBRIGAÇÕES DA CONTRATADA

Cláusula 15°: Fornecer o software ora cedido na forma e modo ajustados;

Cláusula 16°: Auxiliar a CONTRATANTE na solução de quaisquer dúvidas existentes a respeito do software;

Cláusula 17°: Ser responsável pelos atos praticados por seus funcionários, bem como pelos danos que os mesmos venham causar para a CONTRATANTE, em decorrência de eventuais prestações de serviços necessários ao uso do software objeto deste contrato;

Cláusula 18°: Corrigir qualquer erro ou defeito relatado pelo CONTRATANTE que seja referente ao software ora cedido.

DAS OBRIGAÇÕES DA CONTRATANTE

Cláusula 19°: Auxiliar e cooperar com a CONTRATADA, quando se fizer necessário, na análise e solução de erros, caso existentes, no software cedido;

Cláusula 20°: Fornecer à CONTRATADA, quando solicitado, todos os dados, e informações relevantes, para viabilizar e facilitar a prestação dos serviços de manutenção, atualização e, caso necessário, suporte técnico.

DO PAGAMENTO

Cláusula 21°: Pela prestação dos serviços de Software, a CONTRATANTE pagará à CONTRATADA a quantia mensal de R$ ${contractData.monthlyValue || '0,00'} (${contractData.monthlyValue ? 'valor por extenso' : 'zero reais'}), até o dia 10 de cada mês, sendo cobrada a primeira parcela quando o sistema estiver pronto para uso e for apresentado na empresa.

Parágrafo único: Decorridos 12 (doze) meses de execução deste Contrato, os preços serão reajustados pelo Índice de Preços ao Consumidor Amplo - IPCA.

DO INADIMPLEMENTO E DA MULTA

Cláusula 22°: Em caso de inadimplemento por parte da CONTRATANTE quanto ao pagamento do serviço prestado, do atraso deverá incidir multa diária 1% (um por cento) sobre o valor do preço mensal ajustado acrescido de juros de 1% (um por cento) e correção monetária.

DA RESCISÃO E VIGÊNCIA

Cláusula 23°: A vigência deste contrato é por prazo indeterminado a contar de sua assinatura, no entanto, poderá o presente instrumento ser rescindido por qualquer uma das partes, em qualquer momento, sem que haja qualquer tipo de motivo relevante, não obstante, a outra parte deverá ser avisada previamente por escrito, no prazo mínimo de 30 (trinta) dias do encerramento da atividade. Podendo ser rescindido em comum acordo a qualquer tempo;

Cláusula 24°: A CONTRATADA poderá rescindir o presente contrato, independentemente de qualquer notificação na hipótese de inadimplência reiterada de qualquer cláusula ou condição do presente contrato e demais casos previstos na legislação em vigor;

Cláusula 25°: Caso a CONTRATANTE rescinda o contrato, sem justo motivo, e sem respeito ao prazo mínimo determinado na cláusula 23°, deverá arcar com o valor equivalente a uma parcela deste contrato, a qual não se confunde com os valores devidos pelo uso do software;

Cláusula 26°: Nenhuma das partes será responsável perante a outra por qualquer falha ou atraso no cumprimento das obrigações constantes do presente contrato, causados por caso fortuito ou força maior.

DA PROTEÇÃO DE DADOS

Cláusula 27°: A CONTRATADA, por si e por seus colaboradores, obriga-se a atuar no presente Contrato em conformidade com a Legislação vigente sobre Proteção de Dados Pessoais e as determinações de órgãos reguladores/fiscalizadores sobre a matéria, em especial a Lei 13.709/2018.

DO USO DA IMAGEM

Cláusula 28°: A CONTRATANTE autoriza a CONTRATADA a fazer uso de sua imagem, de seus funcionários e ambiente de trabalho, em fotos e/ou filmes, sem finalidade comercial, para serem usadas nos meios de comunicação que entender pertinentes, para divulgação dos serviços prestados pela CONTRATADA, bem como para a divulgação de promoções e sorteios.

FORO

Cláusula 29°: Para dirimir as controvérsias oriundas desse contrato de prestação de serviços, as partes elegem o foro da comarca de [CIDADE]-[UF].

CONDIÇÕES GERAIS

Cláusula 30°: Fica compactuado entre as partes a total inexistência de vínculo trabalhista, excluindo as obrigações previdenciárias e os encargos sociais, não havendo entre CONTRATADA e CONTRATANTE qualquer tipo de relação de subordinação;

Cláusula 31°: Salvo com a expressa autorização da CONTRATADA, não pode a CONTRATANTE transferir ou subcontratar os serviços previstos neste instrumento, sob o risco de ocorrer a rescisão imediata;

Cláusula 32°: A CONTRATADA não disponibiliza de nenhuma forma os códigos fontes do sistema, esses não podem ser exigidos ou solicitados;

Cláusula 33°: E por estarem assim justas e acertadas, as partes firmam o presente instrumento em 2 (duas) vias de igual teor e forma, assinadas e rubricadas, tudo na presença das duas testemunhas abaixo.

[CIDADE], ${formattedDate}


__________________________________________________
CONTRATANTE
${customer?.name || '[RAZÃO SOCIAL DA EMPRESA CONTRATANTE]'}


__________________________________________________
CONTRATADA
[RAZÃO SOCIAL DA EMPRESA CONTRATADA]


__________________________________________
TESTEMUNHA 1
Nome:
CPF:


__________________________________________
TESTEMUNHA 2
Nome:
CPF:
`;
};

export default function Contracts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewContractOpen, setViewContractOpen] = useState(false);
  const [contractContent, setContractContent] = useState("");
  const [editingContract, setEditingContract] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerId: "",
    title: "",
    description: "",
    contractType: "maintenance",
    monthlyValue: "",
    startDate: "",
    endDate: "",
    renewalDate: "",
    billingDay: "1",
    notes: "",
  });

  const { data: contracts, refetch } = trpc.contracts.list.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();

  const createMutation = trpc.contracts.create.useMutation({
    onSuccess: () => {
      toast.success("Contrato criado com sucesso!");
      setIsDialogOpen(false);
      refetch();
      setFormData({
        customerId: "",
        title: "",
        description: "",
        contractType: "maintenance",
        monthlyValue: "",
        startDate: "",
        endDate: "",
        renewalDate: "",
        billingDay: "1",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error("Erro ao criar contrato: " + error.message);
    },
  });

  const updateMutation = trpc.contracts.update.useMutation({
    onSuccess: () => {
      toast.success("Contrato atualizado com sucesso!");
      setIsDialogOpen(false);
      setEditingContract(null);
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar contrato: " + error.message);
    },
  });

  const deleteMutation = trpc.contracts.delete.useMutation({
    onSuccess: () => {
      toast.success("Contrato excluído com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir contrato: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      customerId: "",
      title: "",
      description: "",
      contractType: "maintenance",
      monthlyValue: "",
      startDate: "",
      endDate: "",
      renewalDate: "",
      billingDay: "1",
      notes: "",
    });
  };

  const handleEdit = (item: any) => {
    const contract = item.contract;
    setEditingContract(contract);
    setFormData({
      customerId: contract.customerId?.toString() || "",
      title: contract.title || "",
      description: contract.description || "",
      contractType: contract.contractType || "maintenance",
      monthlyValue: contract.monthlyValue || "",
      startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : "",
      endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : "",
      renewalDate: contract.renewalDate ? new Date(contract.renewalDate).toISOString().split('T')[0] : "",
      billingDay: contract.billingDay?.toString() || "1",
      notes: contract.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (contractId: number) => {
    if (confirm("Tem certeza que deseja excluir este contrato?")) {
      deleteMutation.mutate({ id: contractId });
    }
  };

  const handlePrintPDF = (item: any) => {
    const contract = item.contract;
    const customer = item.customer;
    
    const content = generateSoftwareLicenseContract(customer, {
      monthlyValue: contract.monthlyValue,
      startDate: contract.startDate,
    });
    
    // Criar janela de impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Contrato - ${contract.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; color: #666; }
            .contract-content { white-space: pre-wrap; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CONTRATO DE LICENÇA DE USO DE SOFTWARE</h1>
            <p>Contrato: ${contract.title}</p>
            <p>Cliente: ${customer?.name || '-'}</p>
            <p>Valor Mensal: R$ ${parseFloat(contract.monthlyValue || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div class="contract-content">${content}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      customerId: parseInt(formData.customerId),
      title: formData.title,
      description: formData.description,
      contractType: formData.contractType as any,
      monthlyValue: formData.monthlyValue,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      renewalDate: formData.renewalDate ? new Date(formData.renewalDate) : undefined,
      billingDay: parseInt(formData.billingDay),
      notes: formData.notes,
    };

    if (editingContract) {
      updateMutation.mutate({ id: editingContract.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const formatPrice = (value: string | null) => {
    if (!value) return "R$ 0,00";
    return `R$ ${parseFloat(value).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const isExpiringSoon = (renewalDate: Date | string | null) => {
    if (!renewalDate) return false;
    const renewal = new Date(renewalDate);
    const today = new Date();
    const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contratos</h1>
            <p className="text-muted-foreground">
              Gerencie contratos recorrentes e renovações
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingContract(null); resetForm(); } }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Contrato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingContract ? "Editar Contrato" : "Criar Novo Contrato"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="customerId">Cliente *</Label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, customerId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map((c: any) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="title">Título do Contrato *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contractType">Tipo *</Label>
                    <Select
                      value={formData.contractType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, contractType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(contractTypeMap).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="monthlyValue">Valor Mensal *</Label>
                    <Input
                      id="monthlyValue"
                      type="number"
                      step="0.01"
                      value={formData.monthlyValue}
                      onChange={(e) =>
                        setFormData({ ...formData, monthlyValue: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Data de Início *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Data de Término</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="renewalDate">Data de Renovação</Label>
                    <Input
                      id="renewalDate"
                      type="date"
                      value={formData.renewalDate}
                      onChange={(e) =>
                        setFormData({ ...formData, renewalDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingDay">Dia de Cobrança</Label>
                    <Input
                      id="billingDay"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.billingDay}
                      onChange={(e) =>
                        setFormData({ ...formData, billingDay: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                </div>
                
                {/* Botão para gerar template de contrato de licença */}
                {formData.contractType === "software_license" && formData.customerId && (
                  <div className="col-span-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 mb-2">
                      Tipo de contrato: Licença de Software. Você pode gerar o template do contrato automaticamente.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const customer = customers?.find((c: any) => c.id.toString() === formData.customerId);
                        const content = generateSoftwareLicenseContract(customer, {
                          monthlyValue: formData.monthlyValue,
                          startDate: formData.startDate,
                        });
                        setContractContent(content);
                        setViewContractOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Gerar Template do Contrato
                    </Button>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending 
                      ? (editingContract ? "Salvando..." : "Criando...") 
                      : (editingContract ? "Salvar Alterações" : "Criar Contrato")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog para visualizar contrato */}
          <Dialog open={viewContractOpen} onOpenChange={setViewContractOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Contrato de Licença de Software</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={contractContent}
                  onChange={(e) => setContractContent(e.target.value)}
                  rows={30}
                  className="font-mono text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(contractContent);
                      toast.success("Contrato copiado para a área de transferência!");
                    }}
                  >
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([contractContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'contrato-licenca-software.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Contrato baixado!");
                    }}
                  >
                    Baixar TXT
                  </Button>
                  <Button onClick={() => setViewContractOpen(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alertas de Renovação */}
        {contracts && contracts.filter((c: any) => isExpiringSoon(c.contract.renewalDate)).length > 0 && (
          <Card className="border-yellow-500 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-yellow-700">
                <AlertCircle className="h-4 w-4" />
                Contratos com Renovação Próxima (30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contracts
                  ?.filter((c: any) => isExpiringSoon(c.contract.renewalDate))
                  .map((item: any) => (
                    <div
                      key={item.contract.id}
                      className="flex items-center justify-between p-2 bg-white rounded"
                    >
                      <div>
                        <p className="font-medium">{item.contract.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.customer?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Renovação: {formatDate(item.contract.renewalDate)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.contract.monthlyValue)}/mês
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Contratos */}
        <Card>
          <CardHeader>
            <CardTitle>Todos os Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor Mensal</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Renovação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts && contracts.length > 0 ? contracts.map((item: any) => (
                  <TableRow key={item.contract.id}>
                    <TableCell className="font-medium">
                      {item.customer?.name || "-"}
                    </TableCell>
                    <TableCell>{item.contract.title}</TableCell>
                    <TableCell>
                      {contractTypeMap[item.contract.contractType as keyof typeof contractTypeMap] || item.contract.contractType}
                    </TableCell>
                    <TableCell>{formatPrice(item.contract.monthlyValue)}</TableCell>
                    <TableCell>{formatDate(item.contract.startDate)}</TableCell>
                    <TableCell>
                      {isExpiringSoon(item.contract.renewalDate) ? (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <AlertCircle className="h-3 w-3" />
                          {formatDate(item.contract.renewalDate)}
                        </span>
                      ) : (
                        formatDate(item.contract.renewalDate)
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusMap[item.contract.status as keyof typeof statusMap]?.color || 'bg-gray-500'} text-white`}
                      >
                        {statusMap[item.contract.status as keyof typeof statusMap]?.label || item.contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(item)}
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePrintPDF(item)}
                          title="Imprimir PDF"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(item.contract.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Nenhum contrato encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
