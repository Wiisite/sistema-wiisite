import { useState, useCallback } from "react";

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface AddressData {
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface UseViaCepReturn {
  fetchAddress: (cep: string) => Promise<AddressData | null>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para buscar endereço via CEP usando a API ViaCEP
 */
export function useViaCep(): UseViaCepReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddress = useCallback(async (cep: string): Promise<AddressData | null> => {
    // Limpar CEP (remover caracteres não numéricos)
    const cleanCep = cep.replace(/\D/g, "");

    // Validar CEP
    if (cleanCep.length !== 8) {
      setError("CEP deve ter 8 dígitos");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error("Erro ao buscar CEP");
      }

      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        setError("CEP não encontrado");
        return null;
      }

      const addressData: AddressData = {
        address: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
        zipCode: data.cep || cleanCep,
      };

      return addressData;
    } catch (err) {
      setError("Erro ao buscar endereço. Tente novamente.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchAddress,
    isLoading,
    error,
  };
}
