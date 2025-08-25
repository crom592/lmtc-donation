"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface OrderData {
  id?: string;
  tickets: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  buyerInfo: {
    name: string;
    phone: string;
  };
  category?: string;
  totalAmount: number;
  createdAt: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed">("pending");

  // 계좌 정보
  const bankInfo = {
    bank: "국민은행",
    account: "123-456-789012",
    holder: "구리성광교회LMTC",
  };

  useEffect(() => {
    // sessionStorage에서 주문 정보 가져오기
    const storedOrder = sessionStorage.getItem("currentOrder");
    if (storedOrder) {
      const order = JSON.parse(storedOrder);
      setOrderData({
        id: order.id,
        tickets: [{
          id: "lmtc-ticket-10000",
          name: "LMTC 4기 후원 티켓",
          price: 10000,
          quantity: order.quantity,
        }],
        buyerInfo: {
          name: order.buyerName,
          phone: order.buyerPhone,
        },
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      });
    } else {
      // 주문 정보가 없으면 메인 페이지로 리다이렉트
      router.push("/");
    }
  }, [router]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "복사 완료",
      description: `${label}이(가) 클립보드에 복사되었습니다.`,
    });
  };

  const createOrder = () => {
    // 주문이 이미 생성되어 있으므로 상태만 변경
    if (orderData) {
      setPaymentStatus("completed");
      
      toast({
        title: "주문 완료",
        description: "입금 후 판매자가 확인하면 티켓이 발행됩니다.",
      });
    }
  };

  // 주문 상태 확인
  useEffect(() => {
    const checkOrderStatus = async () => {
      const currentOrderId = sessionStorage.getItem("currentOrderId");
      if (currentOrderId && paymentStatus === "completed") {
        try {
          const response = await fetch(`/api/orders?status=paid`);
          const orders = await response.json();
          const currentOrder = orders.find((o: OrderData) => o.id === currentOrderId);
          
          if (currentOrder && currentOrder.status === "paid") {
            toast({
              title: "입금 확인 완료!",
              description: "티켓이 발행되었습니다. 내 티켓 페이지로 이동합니다.",
            });
            sessionStorage.removeItem("currentOrderId");
            sessionStorage.removeItem("currentOrder");
            setTimeout(() => {
              router.push("/buyer/my-tickets");
            }, 2000);
          }
        } catch (error) {
          console.error('Order status check error:', error);
        }
      }
    };

    // 3초마다 주문 상태 확인
    const interval = setInterval(checkOrderStatus, 3000);
    return () => clearInterval(interval);
  }, [paymentStatus, router, toast]);

  if (!orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-primary text-primary-foreground py-4 px-4 sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/buyer/tickets">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">결제 안내</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 주문 요약 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>주문 내역</CardTitle>
            <CardDescription>구매자: {orderData.buyerInfo.name} ({orderData.buyerInfo.phone})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderData.tickets.map((ticket) => (
                <div key={ticket.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{ticket.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.price.toLocaleString()}원 × {ticket.quantity}매
                    </p>
                  </div>
                  <p className="font-semibold">
                    {(ticket.price * ticket.quantity).toLocaleString()}원
                  </p>
                </div>
              ))}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold">총 결제금액</p>
                  <p className="text-xl font-bold text-primary">
                    {orderData.totalAmount.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 계좌 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              입금 계좌 안내
            </CardTitle>
            <CardDescription>아래 계좌로 정확한 금액을 입금해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">은행</span>
                <span className="font-medium">{bankInfo.bank}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">계좌번호</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{bankInfo.account}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankInfo.account, "계좌번호")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">예금주</span>
                <span className="font-medium">{bankInfo.holder}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">입금액</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary text-lg">
                    {orderData.totalAmount.toLocaleString()}원
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(orderData.totalAmount.toString(), "입금액")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 입금자명을 <strong>{orderData.buyerInfo.name}</strong>으로 보내주세요
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 입금 확인 상태 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>입금 확인</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentStatus === "pending" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <p>입금 확인 대기 중입니다...</p>
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={createOrder}
                >
                  주문 완료하기
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  입금 후 판매자가 확인하면 티켓이 발행됩니다
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-600">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-medium">주문이 접수되었습니다!</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  입금 후 판매자 확인을 기다려주세요. 확인되면 자동으로 티켓이 발행됩니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 안내사항 */}
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle className="text-base">유의사항</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• 입금 확인은 평일 기준 1~2시간 이내 처리됩니다</p>
            <p>• 주말/공휴일은 확인이 지연될 수 있습니다</p>
            <p>• 입금 확인 후 티켓은 자동으로 발행됩니다</p>
            <p>• 문의: 010-XXXX-XXXX (LMTC 담당자)</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}