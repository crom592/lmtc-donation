"use client";

import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Set worker path
    QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js';
    // Check if camera is available
    QrScanner.hasCamera().then(setHasCamera);
  }, []);

  useEffect(() => {
    if (isScanning && videoRef.current) {
      // Create scanner instance
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          // Successfully scanned
          onScan(result.data);
          stopScanning();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
          preferredCamera: 'environment',
        }
      );

      scannerRef.current = scanner;

      // Start scanning
      scanner.start().catch((err) => {
        console.error('Failed to start scanner:', err);
        setError("카메라를 시작할 수 없습니다. 카메라 권한을 확인해주세요.");
      });

      // Cleanup
      return () => {
        if (scannerRef.current) {
          scannerRef.current.stop();
          scannerRef.current.destroy();
          scannerRef.current = null;
        }
      };
    }
  }, [isScanning, onScan]);

  const startScanning = () => {
    setError("");
    setIsScanning(true);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
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
          {!hasCamera ? (
            <div className="text-center space-y-4">
              <p className="text-red-600">
                카메라를 사용할 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.
              </p>
            </div>
          ) : !isScanning ? (
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
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  style={{ maxHeight: '400px' }}
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm text-center">
                  {error}
                </div>
              )}
              <p className="text-sm text-muted-foreground text-center">
                QR 코드를 카메라 화면 중앙에 맞춰주세요
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}