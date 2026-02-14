import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Building2, User, MapPin, Save, Loader2, Search, Upload, X, Image } from "lucide-react";
import { useViaCep } from "@/hooks/useViaCep";

export default function CompanySettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    companyName: "",
    tradeName: "",
    logo: "",
    cnpj: "",
    stateRegistration: "",
    municipalRegistration: "",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    ownerName: "",
    ownerCpf: "",
    ownerRole: "",
    ownerNationality: "brasileiro",
    ownerMaritalStatus: "",
    ownerProfession: "",
    ownerAddress: "",
  });

  const { data: settings, isLoading, refetch } = trpc.companySettings.get.useQuery();
  const { fetchAddress, isLoading: isLoadingCep } = useViaCep();

  const clearAllDataMutation = trpc.admin.clearAllData.useMutation({
    onSuccess: () => {
      toast.success("Todos os dados foram limpos com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao limpar dados: " + error.message);
    },
  });

  const upsertMutation = trpc.companySettings.upsert.useMutation({
    onSuccess: (data) => {
      console.log("Save success, response:", data);
      toast.success("Configurações salvas com sucesso!");
      refetch();
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  useEffect(() => {
    if (settings) {
      console.log("Loading settings from server, logo length:", settings.logo?.length || 0);
      setFormData(prev => ({
        id: settings.id,
        companyName: settings.companyName || "",
        tradeName: settings.tradeName || "",
        logo: settings.logo || prev.logo || "",
        cnpj: settings.cnpj || "",
        stateRegistration: settings.stateRegistration || "",
        municipalRegistration: settings.municipalRegistration || "",
        address: settings.address || "",
        neighborhood: settings.neighborhood || "",
        city: settings.city || "",
        state: settings.state || "",
        zipCode: settings.zipCode || "",
        phone: settings.phone || "",
        email: settings.email || "",
        website: settings.website || "",
        ownerName: settings.ownerName || "",
        ownerCpf: settings.ownerCpf || "",
        ownerRole: settings.ownerRole || "",
        ownerNationality: settings.ownerNationality || "brasileiro",
        ownerMaritalStatus: settings.ownerMaritalStatus || "",
        ownerProfession: settings.ownerProfession || "",
        ownerAddress: settings.ownerAddress || "",
      }));
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleLogoUpload called");
    const file = e.target.files?.[0];
    console.log("File selected:", file?.name, file?.size, file?.type);
    
    if (!file) {
      console.log("No file selected");
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    toast.info("Enviando imagem...");

    // Converter para base64 e fazer upload
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      console.log("Logo base64 loaded, length:", base64.length);
      
      try {
        // Fazer upload para o servidor
        const response = await fetch("/api/upload-logo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logo: base64 }),
        });
        
        if (!response.ok) {
          throw new Error("Erro no upload");
        }
        
        const data = await response.json();
        console.log("Upload response:", data);
        
        // Salvar URL do logo no formData
        setFormData(prev => ({ ...prev, logo: data.logoUrl }));
        toast.success("Logo carregado! Clique em Salvar para confirmar.");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Erro ao fazer upload do logo");
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      toast.error("Erro ao carregar a imagem");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCepSearch = async () => {
    const address = await fetchAddress(formData.zipCode);
    if (address) {
      setFormData(prev => ({
        ...prev,
        address: address.address,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
      }));
      toast.success("Endereço encontrado!");
    } else {
      toast.error("CEP não encontrado");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting formData:", { ...formData, logo: formData.logo ? `[base64 length: ${formData.logo.length}]` : 'empty' });
    upsertMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações da Empresa</h1>
          <p className="text-muted-foreground">
            Configure os dados da sua empresa para contratos e documentos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>
                Informações que aparecerão nos contratos como CONTRATADA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo da Empresa */}
              <div className="space-y-2">
                <Label>Logo da Empresa</Label>
                <div className="flex items-start gap-4">
                  <div className="relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
                    {formData.logo ? (
                      <>
                        <img
                          src={formData.logo}
                          alt="Logo da empresa"
                          className="w-full h-full object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={handleRemoveLogo}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Image className="h-8 w-8 mx-auto mb-1" />
                        <span className="text-xs">Sem logo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Carregar Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Formatos: PNG, JPG, SVG. Máximo: 2MB.<br />
                      O logo aparecerá no menu lateral e nos PDFs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Razão Social *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Razão Social da Empresa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tradeName">Nome Fantasia</Label>
                  <Input
                    id="tradeName"
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    placeholder="Nome Fantasia"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
                  <Input
                    id="stateRegistration"
                    value={formData.stateRegistration}
                    onChange={(e) => setFormData({ ...formData, stateRegistration: e.target.value })}
                    placeholder="Inscrição Estadual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipalRegistration">Inscrição Municipal</Label>
                  <Input
                    id="municipalRegistration"
                    value={formData.municipalRegistration}
                    onChange={(e) => setFormData({ ...formData, municipalRegistration: e.target.value })}
                    placeholder="Inscrição Municipal"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="www.empresa.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCepSearch();
                        }
                      }}
                      placeholder="00000-000"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCepSearch}
                      disabled={isLoadingCep || formData.zipCode.replace(/\D/g, "").length < 8}
                    >
                      {isLoadingCep ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, complemento"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder="Bairro"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase().slice(0, 2) })}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Responsável */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados do Responsável Legal
              </CardTitle>
              <CardDescription>
                Informações do representante legal que assinará os contratos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nome Completo</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerCpf">CPF</Label>
                  <Input
                    id="ownerCpf"
                    value={formData.ownerCpf}
                    onChange={(e) => setFormData({ ...formData, ownerCpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerRole">Cargo</Label>
                  <Input
                    id="ownerRole"
                    value={formData.ownerRole}
                    onChange={(e) => setFormData({ ...formData, ownerRole: e.target.value })}
                    placeholder="Ex: Diretor, Sócio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerNationality">Nacionalidade</Label>
                  <Input
                    id="ownerNationality"
                    value={formData.ownerNationality}
                    onChange={(e) => setFormData({ ...formData, ownerNationality: e.target.value })}
                    placeholder="brasileiro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerMaritalStatus">Estado Civil</Label>
                  <Input
                    id="ownerMaritalStatus"
                    value={formData.ownerMaritalStatus}
                    onChange={(e) => setFormData({ ...formData, ownerMaritalStatus: e.target.value })}
                    placeholder="Ex: casado, solteiro"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerProfession">Profissão</Label>
                  <Input
                    id="ownerProfession"
                    value={formData.ownerProfession}
                    onChange={(e) => setFormData({ ...formData, ownerProfession: e.target.value })}
                    placeholder="Ex: empresário"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerAddress">Endereço Completo</Label>
                  <Input
                    id="ownerAddress"
                    value={formData.ownerAddress}
                    onChange={(e) => setFormData({ ...formData, ownerAddress: e.target.value })}
                    placeholder="Endereço residencial completo"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <Button type="submit" disabled={upsertMutation.isPending} size="lg">
              {upsertMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Zona de Perigo */}
        <Card className="border-red-300 mt-8">
          <CardHeader>
            <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
            <CardDescription>Ações irreversíveis. Use com cuidado.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Limpar todos os dados</p>
                <p className="text-sm text-muted-foreground">Remove todos os clientes, pedidos, orçamentos, contas e demais registros. Configurações da empresa e usuários são mantidos.</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm("ATENÇÃO: Isso vai apagar TODOS os dados do sistema (clientes, pedidos, orçamentos, contas, etc). Deseja continuar?")) {
                    if (confirm("Tem CERTEZA ABSOLUTA? Esta ação é IRREVERSÍVEL!")) {
                      clearAllDataMutation.mutate();
                    }
                  }
                }}
                disabled={clearAllDataMutation.isPending}
              >
                {clearAllDataMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Limpando...
                  </>
                ) : (
                  "Limpar Tudo"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
