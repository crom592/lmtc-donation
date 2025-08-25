"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Ticket, CheckCircle, Search, AlertCircle, Download, CheckSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import TicketImage from "@/components/TicketImage";
import { useToast } from "@/hooks/use-toast";

interface TicketData {
  id: string;
  ticketNumber: string;
  status: string;
  usedAt?: string;
}

interface OrderData {
  id: string;
  buyerName: string;
  buyerPhone: string;
  quantity: number;
  totalAmount: number;
  status: string;
  paidAt: string;
  createdAt: string;
  tickets: TicketData[];
}

export default function MyTicketsPage() {
  const { toast } = useToast();
  const [searchInfo, setSearchInfo] = useState({
    name: "",
    phone: "",
  });
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (phone: string) => {
    const numbers = phone.replace(/[^0-9]/g, '');
    if (numbers.length === 11) {
      return numbers.slice(0, 3) + '-' + numbers.slice(3, 7) + '-' + numbers.slice(7);
    } else if (numbers.length === 10) {
      return numbers.slice(0, 3) + '-' + numbers.slice(3, 6) + '-' + numbers.slice(6);
    }
    return phone;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbersOnly = value.replace(/[^0-9]/g, '');
    setSearchInfo(prev => ({ ...prev, phone: numbersOnly }));
  };

  const handleSearch = async () => {
    if (!searchInfo.name || !searchInfo.phone) {
      toast({
        title: "입력 오류",
        description: "이름과 전화번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const formattedPhone = formatPhoneNumber(searchInfo.phone);

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/tickets?name=${encodeURIComponent(searchInfo.name)}&phone=${encodeURIComponent(formattedPhone)}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setOrders(data);
      setHasSearched(true);
      
      if (data.length === 0) {
        toast({
          title: "조회 결과 없음",
          description: "입력하신 정보로 구매한 티켓이 없습니다.",
        });
      }
    } catch (error) {
      console.error("Ticket fetch error:", error);
      toast({
        title: "조회 실패",
        description: "티켓 조회 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTotalTicketCount = () => {
    return orders.reduce((sum, order) => sum + order.tickets.length, 0);
  };

  const getActiveTicketCount = () => {
    return orders.reduce((sum, order) => 
      sum + order.tickets.filter(t => t.status === 'active').length, 0
    );
  };

  // 모든 티켓을 평면화하여 배열로 만들기
  const getAllTickets = () => {
    const allTickets: Array<{
      ticketNumber: string;
      buyerName: string;
      purchaseDate: string;
      status: string;
      usedAt?: string;
    }> = [];
    orders.forEach((order) => {
      order.tickets.forEach((ticket) => {
        allTickets.push({
          ticketNumber: ticket.ticketNumber,
          buyerName: order.buyerName,
          purchaseDate: formatDate(order.paidAt),
          status: ticket.status,
          usedAt: ticket.usedAt,
        });
      });
    });
    return allTickets;
  };

  const allTickets = getAllTickets();
  const currentTicket = allTickets[selectedTicketIndex];

  // 티켓 선택 토글
  const toggleTicketSelection = (index: number) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTickets(newSelected);
  };

  // 전체 선택/해제
  const toggleAllSelection = () => {
    const activeTickets = allTickets
      .map((ticket, index) => ({ ticket, index }))
      .filter(({ ticket }) => ticket.status === 'active');
    
    if (selectedTickets.size === activeTickets.length) {
      setSelectedTickets(new Set());
    } else {
      const newSelected = new Set<number>();
      activeTickets.forEach(({ index }) => {
        newSelected.add(index);
      });
      setSelectedTickets(newSelected);
    }
  };

  // 선택된 티켓을 ZIP으로 다운로드
  const downloadSelectedTickets = async () => {
    if (selectedTickets.size === 0) {
      toast({
        title: "선택 오류",
        description: "다운로드할 티켓을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      const activeTickets = Array.from(selectedTickets)
        .map(index => allTickets[index])
        .filter(ticket => ticket.status === 'active');
      
      // 각 티켓을 ZIP에 추가
      for (let i = 0; i < activeTickets.length; i++) {
        const ticket = activeTickets[i];
        
        const imageBlob = await generateTicketImageBlob(
          ticket.ticketNumber,
          ticket.buyerName,
          ticket.purchaseDate
        );
        
        if (imageBlob) {
          zip.file(`lmtc-ticket-${ticket.ticketNumber}.png`, imageBlob);
        }
        
        // 진행 상황 표시를 위한 작은 지연
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // ZIP 파일 생성 및 다운로드
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `lmtc-tickets-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      toast({
        title: "ZIP 다운로드 완료",
        description: `${activeTickets.length}개의 티켓이 ZIP 파일로 다운로드되었습니다.`,
      });
      
    } catch (error) {
      console.error('ZIP download error:', error);
      toast({
        title: "다운로드 실패",
        description: "ZIP 파일 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // 티켓 이미지 Blob 생성 함수
  const generateTicketImageBlob = async (
    ticketNumber: string,
    buyerName: string,
    purchaseDate: string
  ): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // 번호 배경
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(img.width - 280, 20, 260, 120);
        
        // 번호 텍스트
        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(ticketNumber, img.width - 270, 85);
        
        // QR 코드 추가
        try {
          const QRCode = (await import('qrcode')).default;
          const qrDataUrl = await QRCode.toDataURL(ticketNumber, {
            width: 80,
            margin: 1,
            color: {
              dark: '#1e3a8a',
              light: '#ffffff'
            }
          });
          
          const qrImg = new Image();
          qrImg.onload = () => {
            ctx.drawImage(qrImg, img.width - 110, 35, 80, 80);
            
            // Canvas를 Blob으로 변환
            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/png');
          };
          qrImg.src = qrDataUrl;
        } catch (err) {
          console.error('QR code generation error:', err);
          // QR 없이 Blob 생성
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png');
        }
      };
      img.src = '/1.jpg';
    });
  };

  // 티켓 이미지 다운로드 함수 (단일 다운로드용)
  const downloadTicketImage = async (
    ticketNumber: string,
    buyerName: string,
    purchaseDate: string
  ): Promise<void> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // 번호 배경
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(img.width - 280, 20, 260, 120);
        
        // 번호 텍스트
        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(ticketNumber, img.width - 270, 85);
        
        // QR 코드 추가
        try {
          const QRCode = (await import('qrcode')).default;
          const qrDataUrl = await QRCode.toDataURL(ticketNumber, {
            width: 80,
            margin: 1,
            color: {
              dark: '#1e3a8a',
              light: '#ffffff'
            }
          });
          
          const qrImg = new Image();
          qrImg.onload = () => {
            ctx.drawImage(qrImg, img.width - 110, 35, 80, 80);
            
            // 다운로드
            const link = document.createElement('a');
            link.download = `lmtc-ticket-${ticketNumber}.png`;
            link.href = canvas.toDataURL();
            link.click();
            resolve();
          };
          qrImg.src = qrDataUrl;
        } catch (err) {
          console.error('QR code generation error:', err);
          // QR 없이 다운로드
          const link = document.createElement('a');
          link.download = `lmtc-ticket-${ticketNumber}.png`;
          link.href = canvas.toDataURL();
          link.click();
          resolve();
        }
      };
      img.src = '/1.jpg';
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-primary text-primary-foreground py-4 px-4 sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              <h1 className="text-xl font-bold">내 티켓 조회</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 조회 폼 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>티켓 조회</CardTitle>
            <CardDescription>
              구매 시 입력한 이름과 전화번호로 티켓을 조회하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search-name">이름</Label>
                  <Input
                    id="search-name"
                    placeholder="홍길동"
                    value={searchInfo.name}
                    onChange={(e) => setSearchInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search-phone">전화번호</Label>
                  <Input
                    id="search-phone"
                    type="tel"
                    placeholder="01012345678 (하이픈 없이)"
                    value={searchInfo.phone}
                    onChange={handlePhoneChange}
                    maxLength={11}
                  />
                  {searchInfo.phone && (
                    <p className="text-xs text-muted-foreground mt-1">
                      조회할 번호: {formatPhoneNumber(searchInfo.phone)}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="w-full"
              >
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? "조회 중..." : "티켓 조회"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 조회 결과 */}
        {hasSearched && (
          <>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">조회된 티켓이 없습니다</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* 티켓 요약 정보 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>구매 티켓</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          총 {getTotalTicketCount()}매 (사용 가능: {getActiveTicketCount()}매)
                        </CardDescription>
                      </div>
                      {getActiveTicketCount() > 0 && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleAllSelection}
                          >
                            <CheckSquare className="h-4 w-4 mr-2" />
                            전체 선택
                          </Button>
                          <Button
                            size="sm"
                            onClick={downloadSelectedTickets}
                            disabled={selectedTickets.size === 0 || isDownloading}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {isDownloading 
                              ? "ZIP 생성 중..." 
                              : `ZIP 다운로드 (${selectedTickets.size})`}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  {allTickets.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        {allTickets.map((ticket, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              selectedTicketIndex === index ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                            } ${ticket.status === 'used' ? 'opacity-50' : ''}`}
                          >
                            {ticket.status === 'active' && (
                              <Checkbox
                                checked={selectedTickets.has(index)}
                                onCheckedChange={() => toggleTicketSelection(index)}
                              />
                            )}
                            <Button
                              variant="ghost"
                              className="flex-1 justify-start"
                              onClick={() => setSelectedTicketIndex(index)}
                            >
                              <span className="font-mono font-bold mr-2">
                                #{ticket.ticketNumber}
                              </span>
                              {ticket.status === 'used' && (
                                <Badge variant="secondary" className="ml-2">
                                  사용됨
                                </Badge>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* 선택된 티켓 이미지 */}
                {currentTicket && (
                  <Card>
                    <CardHeader>
                      <CardTitle>티켓 #{currentTicket.ticketNumber}</CardTitle>
                      <CardDescription>
                        {currentTicket.status === 'used' 
                          ? `사용 완료 (${currentTicket.usedAt ? new Date(currentTicket.usedAt).toLocaleString('ko-KR') : ''})`
                          : '사용 가능'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {currentTicket.status === 'active' ? (
                        <TicketImage
                          ticketNumber={currentTicket.ticketNumber}
                          buyerName={currentTicket.buyerName}
                          purchaseDate={currentTicket.purchaseDate}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">이미 사용된 티켓입니다</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 사용 안내 */}
                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle className="text-base">사용 안내</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• 티켓 이미지를 다운로드하여 보관하세요</p>
                    <p>• 행사 당일 티켓 이미지를 보여주시면 됩니다</p>
                    <p>• 티켓 번호로 본인 확인이 가능합니다</p>
                    <p>• 문의: 010-XXXX-XXXX (LMTC 담당자)</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}