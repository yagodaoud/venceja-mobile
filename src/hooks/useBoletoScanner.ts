// src/hooks/useBoletoScanner.ts
import { useState } from 'react';
import { Boleto } from '@/types';
import { formatDate } from '@/lib/utils';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

/**
 * Hook consolidado para gerenciar todo o fluxo de scanner de boletos
 * Inclui: captura de imagem (câmera/galeria), processamento, retry e submit
 */
export const useBoletoScanner = () => {
  // Estado do modal de origem (câmera vs galeria)
  const [scanSourceModalVisible, setScanSourceModalVisible] = useState(false);
  
  // Estado do scan
  const [scannedBoleto, setScannedBoleto] = useState<Boleto | null>(null);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const [scannedBoletoId, setScannedBoletoId] = useState<number | null>(null);
  const [scanError, setScanError] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Captura de foto pela câmera
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  };

  // Upload de imagem da galeria
  const handleUploadImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
    return null;
  };

  // Processar scan da imagem
  const handleScan = (imageUri: string, scanBoleto: (uri: string, callbacks: any) => void) => {
    setScannedImageUri(imageUri);
    setScanError(false);
    setIsProcessingImage(true);

    scanBoleto(imageUri, {
      onSuccess: (data: Boleto) => {
        setScannedBoleto(data);
        setScannedBoletoId(data.id);
        setIsProcessingImage(false);
        setScanError(false);
      },
      onError: () => {
        setScannedBoleto(null);
        setScannedBoletoId(null);
        setIsProcessingImage(false);
        setScanError(true);
      },
    });
  };

  // Retry do scan
  const handleRetryScan = (scanBoleto: (uri: string, callbacks: any) => void) => {
    if (scannedImageUri) {
      setIsProcessingImage(true);
      handleScan(scannedImageUri, scanBoleto);
    }
  };

  // Fechar modal de scan (cleanup)
  const handleScanModalClose = (deleteBoleto: (id: number) => void) => {
    if (scannedBoletoId) {
      deleteBoleto(scannedBoletoId);
    }
    resetScanState();
  };

  // Submit dos dados escaneados
  const handleScanModalSubmit = (
    data: any,
    updateBoleto: (params: any, callbacks: any) => void,
    createBoleto: (params: any, callbacks: any) => void,
    refetch: () => void,
    onClose: () => void
  ) => {
    const valor = parseFloat(data.valor.replace(',', '.'));

    // Se já existe um boleto escaneado, atualiza se houver mudanças
    if (scannedBoleto && scannedBoletoId) {
      const scannedVencimentoFormatted = formatDate(scannedBoleto.vencimento);
      const hasChanges =
        scannedBoleto.fornecedor !== data.fornecedor ||
        Math.abs(scannedBoleto.valor - valor) > 0.01 ||
        scannedVencimentoFormatted !== data.vencimento ||
        (scannedBoleto.codigoBarras || '') !== (data.codigoBarras || '') ||
        (scannedBoleto.categoria?.id || null) !== (data.categoriaId || null);

      if (hasChanges) {
        updateBoleto(
          {
            id: scannedBoletoId,
            data: {
              fornecedor: data.fornecedor,
              valor,
              vencimento: data.vencimento,
              codigoBarras: data.codigoBarras || undefined,
              categoriaId: data.categoriaId || null,
            },
          },
          {
            onSuccess: () => {
              resetScanState();
              onClose();
              refetch();
            },
          }
        );
      } else {
        resetScanState();
        onClose();
        refetch();
      }
      return;
    }

    // Se não existe, cria novo boleto
    createBoleto(
      {
        fornecedor: data.fornecedor,
        valor,
        vencimento: data.vencimento,
        codigoBarras: data.codigoBarras || undefined,
        categoriaId: data.categoriaId || null,
      },
      {
        onSuccess: () => {
          resetScanState();
          onClose();
          refetch();
        },
      }
    );
  };

  const resetScanState = () => {
    setScannedBoleto(null);
    setScannedImageUri(null);
    setScannedBoletoId(null);
    setScanError(false);
  };

  return {
    // Estado dos modais
    scanSourceModalVisible,
    setScanSourceModalVisible,
    
    // Estado do scan
    scannedBoleto,
    scannedImageUri,
    scanError,
    isProcessingImage,
    
    // Handlers de captura
    handleTakePhoto,
    handleUploadImage,
    
    // Handlers de processamento
    handleScan,
    handleRetryScan,
    handleScanModalClose,
    handleScanModalSubmit,
    resetScanState,
  };
};