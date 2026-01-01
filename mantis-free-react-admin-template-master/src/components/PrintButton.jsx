import { Button, IconButton, Tooltip } from '@mui/material';
import { PrinterOutlined } from '@ant-design/icons';

// ==============================|| PRINT BUTTON ||============================== //

// Fonction pour imprimer uniquement le tableau avec le logo
const printTableWithLogo = (pageTitle = 'Liste') => {
  // Récupérer le tableau (cherche le premier TableContainer)
  const tableContainer = document.querySelector('[class*="MuiTableContainer"]');
  
  if (!tableContainer) {
    alert('Aucun tableau à imprimer');
    return;
  }

  // Récupérer le logo depuis le DOM
  const logoElement = document.querySelector('img[alt*="T2RIV"], img[alt*="Logo"]');
  const logoSrc = logoElement ? logoElement.src : '';

  // Créer une fenêtre d'impression
  const printWindow = window.open('', '_blank');
  
  const tableHTML = tableContainer.innerHTML;
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${pageTitle} - T2RIV</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Roboto', 'Arial', sans-serif;
            padding: 20px;
            color: #333;
          }
          
          .print-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #1976d2;
          }
          
          .logo-section {
            flex: 1;
          }
          
          .logo-section img {
            max-height: 80px;
            width: auto;
          }
          
          .title-section {
            flex: 2;
            text-align: center;
          }
          
          .title-section h1 {
            color: #1976d2;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 5px;
          }
          
          .title-section p {
            color: #666;
            font-size: 14px;
          }
          
          .date-section {
            flex: 1;
            text-align: right;
            font-size: 12px;
            color: #666;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          th {
            background-color: #1976d2;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            border: 1px solid #1565c0;
          }
          
          td {
            padding: 10px 8px;
            border: 1px solid #e0e0e0;
            font-size: 12px;
          }
          
          tr:nth-child(even) {
            background-color: #f5f5f5;
          }
          
          tr:hover {
            background-color: #e3f2fd;
          }
          
          /* Masquer les boutons d'action dans le tableau */
          button, .MuiIconButton-root, [class*="IconButton"] {
            display: none !important;
          }
          
          .print-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
            font-size: 11px;
            color: #999;
          }
          
          @media print {
            body {
              padding: 10px;
            }
            
            .print-header {
              margin-bottom: 20px;
              padding-bottom: 15px;
            }
            
            table {
              page-break-inside: auto;
            }
            
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div class="logo-section">
            ${logoSrc ? `<img src="${logoSrc}" alt="T2RIV Logo" />` : '<h2 style="color:#1976d2;">T2RIV</h2>'}
          </div>
          <div class="title-section">
            <h1>${pageTitle}</h1>
            <p>T2RIV - Deux rives solidaires • Succursale de Tunis</p>
          </div>
          <div class="date-section">
            <p>Date d'impression:</p>
            <p><strong>${currentDate}</strong></p>
          </div>
        </div>
        
        <div class="table-content">
          ${tableHTML}
        </div>
        
        <div class="print-footer">
          <p>Document généré par T2RIV - Système de Gestion</p>
        </div>
        
        <script>
          window.onload = function() {
            // Supprimer tous les boutons et icônes d'action
            const buttons = document.querySelectorAll('button, [role="button"], svg');
            buttons.forEach(btn => btn.remove());
            
            // Lancer l'impression
            setTimeout(() => {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }, 250);
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};

export default function PrintButton({ variant = 'icon', size = 'medium', title = 'Imprimer', onClick, pageTitle }) {
  const handlePrint = () => {
    if (onClick) {
      onClick();
    } else {
      printTableWithLogo(pageTitle || document.title);
    }
  };

  if (variant === 'icon') {
    return (
      <Tooltip title={title}>
        <IconButton onClick={handlePrint} color="primary" size={size}>
          <PrinterOutlined style={{ fontSize: size === 'small' ? '16px' : '20px' }} />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="outlined"
      startIcon={<PrinterOutlined />}
      onClick={handlePrint}
      size={size}
      sx={{
        borderColor: 'primary.main',
        color: 'primary.main',
        '&:hover': {
          borderColor: 'primary.dark',
          bgcolor: 'primary.lighter'
        }
      }}
    >
      {title}
    </Button>
  );
}
