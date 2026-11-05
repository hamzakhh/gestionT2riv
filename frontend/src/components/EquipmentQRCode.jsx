import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Box } from '@mui/material';

const EquipmentQRCode = ({ assetId, size = 200 }) => {
  // Ne rien afficher si l'Asset ID est absent
  if (!assetId) {
    return null;
  }

  // Construire l'URL de la fiche équipement
  const equipmentUrl = `${window.location.origin}/equipment/${assetId}`;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <QRCodeSVG
        value={equipmentUrl}
        size={size}
        level="H"
        includeMargin={true}
      />
    </Box>
  );
};

export default EquipmentQRCode;
