"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2
        },
        false
      );
    }

    const onScanSuccess = (decodedText: string) => {
      onScan(decodedText);
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      setIsScanning(false);
    };

    const onScanFailure = () => {
      // 스캔 실패는 무시 (계속 스캔 시도)
    };

    if (isScanning) {
      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear scanner", error);
        });
      }
    };
  }, [isScanning, onScan]);

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setIsScanning(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR 코드 스캔
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={stopScanning}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {!isScanning ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                티켓의 QR 코드를 스캔하여 빠르게 사용 처리할 수 있습니다.
              </p>
              <Button onClick={startScanning} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                카메라 시작
              </Button>
            </div>
          ) : (
            <div>
              <div id="qr-reader" className="w-full"></div>
              <p className="text-sm text-muted-foreground text-center mt-4">
                QR 코드를 카메라 화면 중앙에 맞춰주세요
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}