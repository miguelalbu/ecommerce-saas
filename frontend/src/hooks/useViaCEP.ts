import { useState } from 'react';

export type ViaCEPResult = {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export const useViaCEP = () => {
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [cepNotFound, setCepNotFound] = useState(false);

  const fetchAddressByCEP = async (cep: string): Promise<ViaCEPResult | null> => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return null;

    setIsLoadingCEP(true);
    setCepNotFound(false);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepNotFound(true);
        return null;
      }

      return {
        rua: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      };
    } catch {
      setCepNotFound(true);
      return null;
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const resetCEPState = () => setCepNotFound(false);

  return { isLoadingCEP, cepNotFound, fetchAddressByCEP, resetCEPState };
};
