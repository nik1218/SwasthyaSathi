import React, { useState } from 'react';
import CameraScreen from './CameraScreen';
import PhotoPreview from './PhotoPreview';

interface DocumentScannerProps {
  onDocumentScanned: (uri: string) => void;
  onClose: () => void;
}

type ScannerState = 'camera' | 'preview';

const DocumentScanner: React.FC<DocumentScannerProps> = ({
  onDocumentScanned,
  onClose,
}) => {
  const [state, setState] = useState<ScannerState>('camera');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string>('');

  const handlePhotoTaken = (uri: string) => {
    setCapturedPhotoUri(uri);
    setState('preview');
  };

  const handleRetake = () => {
    setCapturedPhotoUri('');
    setState('camera');
  };

  const handleUsePhoto = (processedUri: string) => {
    onDocumentScanned(processedUri);
  };

  if (state === 'camera') {
    return <CameraScreen onPhotoTaken={handlePhotoTaken} onClose={onClose} />;
  }

  if (state === 'preview' && capturedPhotoUri) {
    return (
      <PhotoPreview
        photoUri={capturedPhotoUri}
        onRetake={handleRetake}
        onUsePhoto={handleUsePhoto}
      />
    );
  }

  return null;
};

export default DocumentScanner;
