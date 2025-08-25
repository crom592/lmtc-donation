"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import QRCode from 'qrcode';

interface TicketImageProps {
  ticketNumber: string;
  buyerName: string;
  purchaseDate: string;
}

export default function TicketImage({ ticketNumber, buyerName, purchaseDate }: TicketImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `lmtc-ticket-${ticketNumber}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 실제 티켓 이미지 로드
        const img = new window.Image();
        img.onload = async () => {
          // 캔버스 크기를 이미지 크기에 맞춤
          canvas.width = img.width;
          canvas.height = img.height;
          
          // 이미지 그리기
          ctx.drawImage(img, 0, 0);
          
          // 티켓 번호 추가 (오른쪽 상단 흰색 영역)
          ctx.save();
          
          // 번호 배경 (반투명 흰색)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fillRect(img.width - 280, 20, 260, 120);
          
          // 번호 텍스트 (인덱스 번호만)
          ctx.fillStyle = '#1e3a8a'; // 진한 파란색
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(ticketNumber, img.width - 270, 85);
          
          // QR 코드 생성 및 추가
          try {
            const qrDataUrl = await QRCode.toDataURL(ticketNumber, {
              width: 80,
              margin: 1,
              color: {
                dark: '#1e3a8a',
                light: '#ffffff'
              }
            });
            
            const qrImg = new window.Image();
            qrImg.onload = () => {
              // QR 코드를 번호 오른쪽에 그리기
              ctx.drawImage(qrImg, img.width - 110, 35, 80, 80);
            };
            qrImg.src = qrDataUrl;
          } catch (err) {
            console.error('QR code generation error:', err);
          }
          
          ctx.restore();
          setImageLoaded(true);
        };
        img.src = '/1.jpg'; // 앞면 이미지 사용
      }
    }
  }, [ticketNumber, buyerName]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-2 rounded-lg shadow-lg">
        <canvas 
          ref={canvasRef}
          className="max-w-full h-auto"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      {imageLoaded && (
        <Button onClick={downloadImage} size="lg">
          <Download className="mr-2 h-5 w-5" />
          티켓 이미지 다운로드
        </Button>
      )}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>티켓 번호: <span className="font-mono font-bold">{ticketNumber}</span></p>
        <p>구매자: {buyerName}</p>
        <p>구매일: {purchaseDate}</p>
      </div>
    </div>
  );
}