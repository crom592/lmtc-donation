"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  RefreshCw,
  Ban,
  LogOut,
  QrCode,
  Check,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

const QRScanner = dynamic(() => import('@/components/QRScanner'), { 
  ssr: false 
});

const AdminManual = dynamic(() => import('@/components/AdminManual'), {
  ssr: false
});

interface TicketData {
  id: string;
  ticketNumber: string;
  status: string;
  usedAt?: string;
  usedBy?: string;
}

interface OrderData {
  id: string;
  buyerName: string;
  buyerPhone: string;
  quantity: number;
  totalAmount: number;
  status: string;
  paidAt?: string;
  createdAt: string;
  tickets: TicketData[];
}

export default function AdminPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [ticketNumberInput, setTicketNumberInput] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // API에서 주문 가져오기
  const loadOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Order fetch error:', error);
      toast({
        title: "오류",
        description: "주문 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // 인증 체크
  useEffect(() => {
    const checkAuth = () => {
      const auth = sessionStorage.getItem("adminAuth");
      const authTime = sessionStorage.getItem("adminAuthTime");
      
      if (!auth || auth !== "true") {
        router.push("/admin/login");
        return;
      }
      
      // 30분 세션 타임아웃
      if (authTime) {
        const elapsed = Date.now() - parseInt(authTime);
        if (elapsed > 30 * 60 * 1000) { // 30분
          sessionStorage.removeItem("adminAuth");
          sessionStorage.removeItem("adminAuthTime");
          router.push("/admin/login");
          return;
        }
      }
      
      setIsAuthorized(true);
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      loadOrders();
      // 5초마다 자동 새로고침
      const interval = setInterval(loadOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthorized, loadOrders]);

  // 입금 확인 처리
  const confirmPayment = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'paid' }),
      });

      if (!response.ok) throw new Error('Failed to update order');
      
      await loadOrders();
      
      toast({
        title: "입금 확인 완료",
        description: "티켓이 발행되었습니다.",
      });
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast({
        title: "오류",
        description: "입금 확인 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 주문 취소 처리
  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) throw new Error('Failed to cancel order');
      
      await loadOrders();
      
      toast({
        title: "주문 취소",
        description: "주문이 취소되었습니다.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Order cancel error:', error);
      toast({
        title: "오류",
        description: "주문 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 티켓 사용 처리
  const handleQRScan = async (ticketNumber: string) => {
    setShowQRScanner(false);
    setTicketNumberInput(ticketNumber);
    await processTicketUse(ticketNumber);
  };

  const handleTicketUse = async () => {
    if (!ticketNumberInput) {
      toast({
        title: "입력 오류",
        description: "티켓 번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    await processTicketUse(ticketNumberInput);
  };

  const processTicketUse = async (ticketNumber: string) => {
    // 모든 티켓에서 해당 번호 찾기
    let foundTicket: TicketData | null = null;
    for (const order of orders) {
      const ticket = order.tickets.find(t => 
        t.ticketNumber === ticketNumber || 
        t.ticketNumber.endsWith(ticketNumber)
      );
      if (ticket) {
        foundTicket = ticket;
        break;
      }
    }

    if (!foundTicket) {
      toast({
        title: "티켓 없음",
        description: "해당 번호의 티켓을 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    if (foundTicket.status === 'used') {
      toast({
        title: "이미 사용됨",
        description: `이 티켓은 ${new Date(foundTicket.usedAt!).toLocaleString('ko-KR')}에 이미 사용되었습니다.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/tickets/${foundTicket.id}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usedBy: 'admin' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to use ticket');
      }

      await loadOrders();
      setTicketNumberInput("");
      
      toast({
        title: "티켓 사용 완료",
        description: `티켓 #${foundTicket.ticketNumber.slice(-4)}이(가) 사용 처리되었습니다.`,
      });
    } catch (error) {
      console.error('Ticket use error:', error);
      toast({
        title: "오류",
        description: "티켓 사용 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 필터링된 주문 목록
  const filteredOrders = orders
    .filter(order => filter === 'all' || order.status === filter)
    .filter(order => 
      order.buyerName.includes(searchTerm) || 
      order.buyerPhone.includes(searchTerm)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 통계 계산
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    totalRevenue: orders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0),
    totalTickets: orders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + o.tickets.length, 0),
    usedTickets: orders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + o.tickets.filter(t => t.status === 'used').length, 0),
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    sessionStorage.removeItem("adminAuthTime");
    router.push("/admin/login");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="w-3 h-3 mr-1" />입금 대기</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />입금 완료</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50"><Ban className="w-3 h-3 mr-1" />취소됨</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!isAuthorized) {
    return null; // 인증 체크 중
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-primary text-primary-foreground py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">판매자 관리 시스템</h1>
              <p className="text-sm opacity-90 mt-1">LMTC 4기 후원 티켓 관리</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowManual(true)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                사용 방법
              </Button>
              <Button 
                variant="secondary" 
                size="icon"
                onClick={loadOrders}
                title="새로고침"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              <Button 
                variant="secondary" 
                size="icon"
                onClick={handleLogout}
                title="로그아웃"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">전체 주문</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">입금 대기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">입금 완료</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 매출</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.totalRevenue.toLocaleString()}원</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">발행 티켓</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">사용 티켓</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.usedTickets}</div>
            </CardContent>
          </Card>
        </div>

        {/* 티켓 사용 처리 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              티켓 사용 처리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="티켓 번호 입력 (예: 0001)"
                value={ticketNumberInput}
                onChange={(e) => setTicketNumberInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTicketUse()}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowQRScanner(true)}
                title="QR 스캔"
              >
                <QrCode className="h-4 w-4" />
              </Button>
              <Button onClick={handleTicketUse}>
                <Check className="mr-2 h-4 w-4" />
                사용 처리
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 필터 및 검색 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>주문 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="이름 또는 전화번호로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                >
                  전체
                </Button>
                <Button
                  variant={filter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilter('pending')}
                >
                  입금 대기
                </Button>
                <Button
                  variant={filter === 'paid' ? 'default' : 'outline'}
                  onClick={() => setFilter('paid')}
                >
                  입금 완료
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 주문 목록 */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">주문 내역이 없습니다</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {order.buyerName} ({order.buyerPhone})
                      </CardTitle>
                      <CardDescription>
                        주문일시: {formatDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div>
                        <p className="font-medium">LMTC 4기 후원 티켓</p>
                        <p className="text-sm text-muted-foreground">
                          10,000원 × {order.quantity}매
                        </p>
                      </div>
                      <p className="text-lg font-bold">
                        {order.totalAmount.toLocaleString()}원
                      </p>
                    </div>
                    
                    {order.status === 'paid' && order.tickets.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">티켓 번호:</p>
                        <div className="flex flex-wrap gap-2">
                          {order.tickets.map((ticket) => (
                            <Badge 
                              key={ticket.id} 
                              variant={ticket.status === 'used' ? 'secondary' : 'default'}
                            >
                              #{ticket.ticketNumber}
                              {ticket.status === 'used' && ' (사용됨)'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          onClick={() => confirmPayment(order.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          입금 확인
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => cancelOrder(order.id)}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          취소
                        </Button>
                      </div>
                    )}
                    
                    {order.status === 'paid' && order.paidAt && (
                      <div className="text-sm text-muted-foreground">
                        입금 확인: {formatDate(order.paidAt)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner 
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Admin Manual Modal */}
      {showManual && (
        <AdminManual 
          open={showManual}
          onOpenChange={setShowManual}
        />
      )}
    </div>
  );
}