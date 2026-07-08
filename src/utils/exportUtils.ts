import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Delegacao } from '../types';

// Helper to format date
const formatarData = (dateString: string) => {
  try {
    const d = new Date(dateString);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

// 1. Export entire table to Excel (XLSX)
export const exportToExcel = (delegacoes: Delegacao[]) => {
  if (delegacoes.length === 0) return;

  // Map data to clean portuguese column headers
  const dataToExport = delegacoes.map((item, index) => ({
    "Nº": index + 1,
    "Nome da Escola": item.nomeEscola,
    "Endereço": item.endereco,
    "Local de Embarque": item.embarque,
    "Destino": item.destino,
    "Horário de Saída": item.horarioSaida,
    "Horário de Retorno": item.horarioRetorno,
    "Responsável": item.responsavel,
    "Contato": item.contato,
    "Quantidade de Participantes": item.quantidade,
    "Data de Cadastro": formatarData(item.dataCadastro)
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Escolas Inscritas");

  // Autofit columns (basic width calculation)
  const maxProps = Object.keys(dataToExport[0] || {});
  const wscols = maxProps.map(key => {
    let maxLen = key.length;
    dataToExport.forEach(row => {
      const val = row[key as keyof typeof row];
      if (val !== undefined && val !== null) {
        maxLen = Math.max(maxLen, val.toString().length);
      }
    });
    return { wch: Math.min(maxLen + 3, 40) }; // limit max width to 40
  });
  worksheet['!cols'] = wscols;

  // Write file
  XLSX.writeFile(workbook, "Caminhada_do_ECA_Delegoes_Escolares.xlsx");
};

// Helper to load logo image
const loadLogo = (): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = '/logo.png';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};

// 2. Export entire table to PDF (Relatório de Delegações)
export const exportToPDF = async (delegacoes: Delegacao[]) => {
  if (delegacoes.length === 0) return;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const totalAlunos = delegacoes.reduce((acc, curr) => acc + curr.quantidade, 0);
  const logo = await loadLogo();

  // Styling helpers
  doc.setFillColor(26, 54, 93); // Dark Navy Blue (#1A365D)
  doc.rect(0, 0, 297, 40, 'F'); // Header bar

  // Draw Logo in Header
  if (logo) {
    doc.addImage(logo, 'PNG', 15, 8, 24, 24);
  }
  const textX = logo ? 44 : 15;

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text("CONSELHO TUTELAR DE SALVADOR", textX, 17);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text("Organização da Caminhada do ECA - 13 de Julho - Concentração: 08:00h no Campo Grande", textX, 24);
  doc.text("Comemoração do Estatuto da Criança e do Adolescente (Lei Federal nº 8.069)", textX, 30);

  // Right-aligned header info
  doc.setFontSize(9.5);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 245, 14);
  doc.text(`Total de Escolas: ${delegacoes.length}`, 245, 21);
  doc.text(`Total de Participantes: ${totalAlunos}`, 245, 28);

  // Title of report
  doc.setTextColor(26, 54, 93);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("RELATÓRIO GERAL DE DELEGAÇÕES ESCOLARES INSCRITAS", 15, 48);

  // Table columns
  const tableColumn = [
    "Escola", 
    "Responsável", 
    "Contato", 
    "Saída", 
    "Retorno", 
    "Embarque", 
    "Destino", 
    "Qtd"
  ];
  
  const tableRows = delegacoes.map(item => [
    item.nomeEscola,
    item.responsavel,
    item.contato,
    item.horarioSaida,
    item.horarioRetorno,
    item.embarque,
    item.destino,
    item.quantidade.toString()
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 53,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 54, 93],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [50, 50, 50]
    },
    columnStyles: {
      0: { cellWidth: 55 }, // Escola
      1: { cellWidth: 35 }, // Responsavel
      2: { cellWidth: 25 }, // Contato
      3: { cellWidth: 15 }, // Saida
      4: { cellWidth: 15 }, // Retorno
      5: { cellWidth: 50 }, // Embarque
      6: { cellWidth: 50 }, // Destino
      7: { cellWidth: 15, halign: 'center' } // Qtd
    },
    margin: { left: 15, right: 15 },
    didDrawPage: (data) => {
      // Footer page count
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Caminhada do ECA - Salvador, BA | Página ${data.pageNumber}`, 
        15, 
        doc.internal.pageSize.height - 10
      );
    }
  });

  doc.save("Caminhada_do_ECA_Lista_Delegoes.pdf");
};

// 3. Export individual confirmation receipt PDF (Recibo de Inscrição)
export const exportReciboPDF = async (delegacao: Delegacao) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Load logo
  const logo = await loadLogo();

  // Color Palette
  const primaryColor = [26, 54, 93]; // Deep Navy
  const secondaryColor = [217, 119, 6]; // Amber/Orange
  const lightBg = [248, 250, 252]; // Soft Gray-White

  // Draw background frame/border
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.rect(8, 8, 194, 281); // External border

  // Beautiful Top Banner
  doc.setFillColor(26, 54, 93);
  doc.rect(10, 10, 190, 32, 'F');

  // Draw Logo inside Header Banner
  if (logo) {
    doc.addImage(logo, 'PNG', 15, 12, 20, 20);
  }
  const textX = logo ? 38 : 16;

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("CONSELHO TUTELAR DE SALVADOR", textX, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text("Caminhada do ECA | 13 de Julho - Salvador/BA", textX, 26);
  doc.setFontSize(7.5);
  doc.text("Garantindo a Prioridade Absoluta e Proteção Integral a Crianças e Adolescentes", textX, 31);

  // Receipt Title
  doc.setTextColor(26, 54, 93);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("COMPROVANTE DE INSCRIÇÃO DE DELEGAÇÃO ESCOLAR", 15, 55);

  // Confirmation message
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const introText = "O Conselho Tutelar de Salvador confirma, para fins de credenciamento e planejamento logístico, a inscrição oficial da delegação escolar listada abaixo para participação na Caminhada do ECA, que ocorrerá no dia 13 de Julho de 2026, com concentração inicial programada para às 08:00h no Campo Grande.";
  const textLines = doc.splitTextToSize(introText, 180);
  doc.text(textLines, 15, 63);

  // Draw elegant divider
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1);
  doc.line(15, 80, 195, 80);

  // Section 1: Escola e Responsável
  doc.setTextColor(26, 54, 93);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("DADOS DA INSTITUIÇÃO E RESPONSÁVEL", 15, 87);

  // Box 1 background
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 91, 180, 42, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(15, 91, 180, 42);

  // Box 1 content
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text("Nome da Escola:", 20, 98);
  doc.setFont('helvetica', 'normal');
  doc.text(delegacao.nomeEscola, 52, 98);

  doc.setFont('helvetica', 'bold');
  doc.text("Endereço:", 20, 106);
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(delegacao.endereco, 138);
  doc.text(addressLines, 52, 106);

  doc.setFont('helvetica', 'bold');
  doc.text("Responsável:", 20, 119);
  doc.setFont('helvetica', 'normal');
  doc.text(delegacao.responsavel, 52, 119);

  doc.setFont('helvetica', 'bold');
  doc.text("Contato/Celular:", 20, 127);
  doc.setFont('helvetica', 'normal');
  doc.text(delegacao.contato, 52, 127);


  // Section 2: Logística de Transporte
  doc.setTextColor(26, 54, 93);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("INFORMAÇÕES DE LOGÍSTICA E TRANSPORTE", 15, 145);

  // Box 2 background
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 149, 180, 42, 'F');
  doc.rect(15, 149, 180, 42);

  // Box 2 content (increased X offset for values to 62 to prevent overlaps)
  doc.setTextColor(51, 65, 85);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Local de Embarque:", 20, 156);
  doc.setFont('helvetica', 'normal');
  doc.text(delegacao.embarque, 62, 156);

  doc.setFont('helvetica', 'bold');
  doc.text("Destino Final:", 20, 164);
  doc.setFont('helvetica', 'normal');
  doc.text(delegacao.destino, 62, 164);

  doc.setFont('helvetica', 'bold');
  doc.text("Horário de Saída:", 20, 172);
  doc.setFont('helvetica', 'normal');
  doc.text(`${delegacao.horarioSaida} h`, 62, 172);

  doc.setFont('helvetica', 'bold');
  doc.text("Horário de Retorno:", 20, 180);
  doc.setFont('helvetica', 'normal');
  doc.text(`${delegacao.horarioRetorno} h`, 62, 180);


  // Section 3: Delegação e Contagem
  doc.setTextColor(26, 54, 93);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("CONVOLUÇÃO DE INTEGRANTES E CADASTRO", 15, 202);

  // Box 3 background
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 206, 180, 25, 'F');
  doc.rect(15, 206, 180, 25);

  // Box 3 content (increased X offset for quantity value to 92 to prevent overlaps)
  doc.setTextColor(51, 65, 85);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Quantidade Estimada de Participantes:", 20, 213);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6);
  doc.setFontSize(11);
  doc.text(`${delegacao.quantidade} integrantes (Alunos, Professores, Coordenadores)`, 92, 213);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text("Data do Cadastro Virtual:", 20, 222);
  doc.setFont('helvetica', 'normal');
  doc.text(formatarData(delegacao.dataCadastro), 65, 222);


  // Signature / Approval seal
  doc.setDrawColor(226, 232, 240);
  doc.line(45, 260, 165, 260);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Assinatura / Carimbo do Responsável pela Homologação", 62, 264);
  doc.setFontSize(8);
  doc.text("Conselho Tutelar de Salvador - Organização Geral", 73, 268);

  // Official badge confirm stamp
  doc.setFillColor(236, 253, 245); // Light Green
  doc.rect(145, 235, 45, 12, 'F');
  doc.setDrawColor(16, 185, 129); // Green 500
  doc.rect(145, 235, 45, 12);
  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text("INSCRIÇÃO DEFERIDA", 150, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text("Processo Homologado", 154, 244);

  // Footer text
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Este documento é um comprovante oficial virtual emitido pela plataforma de cadastro da Caminhada do ECA de Salvador.", 20, 284);

  // Save PDF
  const safeSchoolName = delegacao.nomeEscola.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`Recibo_ECA_${safeSchoolName}.pdf`);
};
