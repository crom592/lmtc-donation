"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Ticket, CheckCircle, Search, AlertCircle } from "lucide-react";
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

  const handleSearch = async () => {
    if (!searchInfo.name || !searchInfo.phone) {
      toast({
        title: "입력 오류",
        description: "이름과 전화번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/tickets?name=${encodeURIComponent(searchInfo.name)}&phone=${encodeURIComponent(searchInfo.phone)}`
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
    const allTickets: any[] = [];
    orders.forEach((order) => {
      order.tickets.forEach((ticket, index) => {
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
                    placeholder="010-1234-5678"
                    value={searchInfo.phone}
                    onChange={(e) => setSearchInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
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
                    <CardTitle>구매 티켓</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      총 {getTotalTicketCount()}매 (사용 가능: {getActiveTicketCount()}매)
                    </CardDescription>
                  </CardHeader>
                  {allTickets.length > 1 && (
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        {allTickets.map((ticket, index) => (
                          <Button
                            key={index}
                            variant={selectedTicketIndex === index ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTicketIndex(index)}
                            disabled={ticket.status === 'used'}
                          >
                            티켓 #{ticket.ticketNumber.slice(-4)}
                            {ticket.status === 'used' && " (사용됨)"}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* 선택된 티켓 이미지 */}
                {currentTicket && (
                  <Card>
                    <CardHeader>
                      <CardTitle>티켓 #{currentTicket.ticketNumber.slice(-4)}</CardTitle>
                      <CardDescription>
                        {currentTicket.status === 'used' 
                          ? `사용 완료 (${new Date(currentTicket.usedAt).toLocaleString('ko-KR')})`
                          : '사용 가능'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {currentTicket.status === 'active' ? (
                        <TicketImage
                          ticketNumber={currentTicket.ticketNumber.slice(-4)}
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