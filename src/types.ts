export interface Delegacao {
  id: string;
  nomeEscola: string;
  endereco: string;
  embarque: string;
  destino: string;
  horarioSaida: string;
  horarioRetorno: string;
  responsavel: string;
  contato: string;
  quantidade: number;
  dataCadastro: string;
  documento?: string;      // Base64 string of file
  documentoNome?: string;  // Name of the uploaded file
}
