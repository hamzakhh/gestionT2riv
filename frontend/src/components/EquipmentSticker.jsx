import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import EquipmentQRCode from './EquipmentQRCode';
import logoImage from '../assets/images/t2riv-logo.jpg';

const EquipmentSticker = ({ equipment, printMode = false }) => {
  // Ne rien afficher si l'Asset ID est absent
  if (!equipment || !equipment.assetId) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center', 
        border: '2px dashed #ccc',
        borderRadius: 2
      }}>
        <Typography variant="body1" color="text.secondary">
          Asset ID requis
        </Typography>
      </Box>
    );
  }

  const { assetId, name, serialNumber, category } = equipment;

  return (
    <Paper
      sx={{
        width: '100%',
        maxWidth: '681px',
        aspectRatio: '3 / 2',
        p: 3,
        backgroundColor: '#ffffff',
        border: '2px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      {/* Header avec logo centré */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Box
          component="img"
          src={logoImage}
          alt="T2Riv Logo"
          sx={{
            width: 60,
            height: 60,
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* Nom de l'équipement - centré et géré pour les noms longs */}
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            color: '#1976d2',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
            minHeight: '2.6rem',
          }}
        >
          {name || '—'}
        </Typography>
      </Box>

      {/* Informations structurées */}
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Asset ID - Très visible avec encadré */}
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            p: 1.5,
            borderLeft: 4,
            borderColor: '#1976d2',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.25 }}>
            Asset ID
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: '#1976d2',
              letterSpacing: 0.5,
              lineHeight: 1.2,
            }}
          >
            {assetId}
          </Typography>
        </Box>

        {/* Numéro de série */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.25 }}>
              N° de série
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#333',
              }}
            >
              {serialNumber || '—'}
            </Typography>
          </Box>

          {/* Catégorie */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.25 }}>
              Catégorie
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#333',
              }}
            >
              {category || '—'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Footer avec QR Code et nom de l'association */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: '#666',
              fontSize: '0.7rem',
              textAlign: 'center',
              display: 'block',
            }}
          >
            Tunisiens des deux rives
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EquipmentQRCode assetId={assetId} size={100} />
        </Box>
      </Box>
    </Paper>
  );
};

export default EquipmentSticker;
