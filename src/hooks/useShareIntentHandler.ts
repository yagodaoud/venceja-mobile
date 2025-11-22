import { useState, useEffect, useRef } from 'react';
import { useShareIntent as useExpoShareIntent } from 'expo-share-intent';
import * as FileSystem from 'expo-file-system/legacy';
import { Boleto } from '@/types';
import Toast from 'react-native-toast-message';

interface UseShareIntentHandlerProps {
  lastCopiedBoletoId: number | null;
  boletos: Boleto[] | undefined;
  onShareReceived: (boleto: Boleto, fileUri: string) => void;
}

export function useShareIntentHandler({
  lastCopiedBoletoId,
  boletos,
  onShareReceived,
}: UseShareIntentHandlerProps) {
  const { hasShareIntent, shareIntent, resetShareIntent } = useExpoShareIntent({
    resetOnBackground: false,
  });
  
  const [sharedFileUri, setSharedFileUri] = useState<string | null>(null);
  const processedIntentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasShareIntent || !shareIntent) return;

    const handleShareIntent = async () => {
      try {
        // Verifica se é um tipo de arquivo suportado
        if (shareIntent.type !== 'media' && shareIntent.type !== 'file') {
          console.log('Tipo de compartilhamento não suportado:', shareIntent.type);
          resetShareIntent();
          return;
        }

        const file = shareIntent.files?.[0];
        if (!file?.path) {
          console.log('Nenhum arquivo encontrado no intent');
          resetShareIntent();
          return;
        }

        // Evita processar o mesmo intent múltiplas vezes
        const intentId = `${file.path}_${Date.now()}`;
        if (processedIntentRef.current === intentId) {
          return;
        }
        processedIntentRef.current = intentId;

        // Valida o tipo de arquivo
        const mimeType = file.mimeType?.toLowerCase() || '';
        const isImage = mimeType.includes('image') || file.path.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        const isPdf = mimeType.includes('pdf') || file.path.endsWith('.pdf');

        if (!isImage && !isPdf) {
          Toast.show({
            type: 'error',
            text1: 'Arquivo não suportado',
            text2: 'Envie uma imagem ou PDF',
            visibilityTime: 4000,
          });
          resetShareIntent();
          return;
        }

        // Copia o arquivo para o diretório do app
        const extension = isPdf ? 'pdf' : file.path.split('.').pop() || 'jpg';
        const fileName = `comprovante_${Date.now()}.${extension}`;
        const destUri = `${FileSystem.documentDirectory}${fileName}`;
        
        // Verifica se o arquivo fonte existe
        const fileInfo = await FileSystem.getInfoAsync(file.path);
        if (!fileInfo.exists) {
          throw new Error('Arquivo não encontrado');
        }

        await FileSystem.copyAsync({
          from: file.path,
          to: destUri,
        });

        console.log('Arquivo copiado para:', destUri);
        setSharedFileUri(destUri);

        // Encontra o boleto correspondente
        if (lastCopiedBoletoId && boletos) {
          const boleto = boletos.find(b => b.id === lastCopiedBoletoId);

          if (boleto && boleto.status === 'PENDENTE') {
            Toast.show({
              type: 'success',
              text1: 'Comprovante recebido!',
              text2: `Toque para anexar ao boleto de ${boleto.fornecedor}`,
              onPress: () => {
                onShareReceived(boleto, destUri);
                Toast.hide();
              },
              visibilityTime: 15000,
              autoHide: true,
            });
          } else if (boleto && boleto.status !== 'PENDENTE') {
            Toast.show({
              type: 'info',
              text1: 'Boleto já pago',
              text2: 'Este boleto já foi marcado como pago',
              visibilityTime: 4000,
            });
            resetShareIntent();
          } else {
            Toast.show({
              type: 'info',
              text1: 'Comprovante salvo',
              text2: 'Abra um boleto pendente para anexar',
              visibilityTime: 6000,
            });
          }
        } else {
          Toast.show({
            type: 'info',
            text1: 'Comprovante recebido',
            text2: 'Copie o código de barras de um boleto primeiro',
            visibilityTime: 6000,
          });
        }

      } catch (error) {
        console.error('Erro ao processar compartilhamento:', error);
        Toast.show({
          type: 'error',
          text1: 'Erro ao processar arquivo',
          text2: 'Tente novamente',
          visibilityTime: 4000,
        });
      } finally {
        resetShareIntent();
      }
    };

    handleShareIntent();
  }, [hasShareIntent, shareIntent, lastCopiedBoletoId, boletos, resetShareIntent, onShareReceived]);

  const clearSharedFile = async () => {
    if (sharedFileUri) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(sharedFileUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(sharedFileUri);
        }
      } catch (error) {
        console.error('Erro ao limpar arquivo:', error);
      }
    }
    setSharedFileUri(null);
    processedIntentRef.current = null;
  };

  return {
    sharedFileUri,
    clearSharedFile,
  };
}