"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Minus, ShoppingCart, Coffee, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TicketItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  quantity: number;
}

const bazaarTickets = [
  { id: "bazaar-5000", name: "바자회 5,000원권", price: 5000, description: "바자회에서 5,000원 상당 이용 가능" },
  { id: "bazaar-10000", name: "바자회 10,000원권", price: 10000, description: "바자회에서 10,000원 상당 이용 가능" },
  { id: "bazaar-20000", name: "바자회 20,000원권", price: 20000, description: "바자회에서 20,000원 상당 이용 가능" },
];

const cafeTickets = [
  { id: "cafe-americano", name: "아메리카노", price: 3000, description: "따뜻한 아메리카노 1잔" },
  { id: "cafe-latte", name: "카페라떼", price: 4000, description: "부드러운 카페라떼 1잔" },
  { id: "cafe-dessert", name: "디저트 세트", price: 6000, description: "음료 + 디저트 세트" },
];

function TicketsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "bazaar";
  
  const [selectedTickets, setSelectedTickets] = useState<TicketItem[]>([]);
  const [buyerInfo, setBuyerInfo] = useState({
    name: "",
    phone: "",
  });

  const tickets = category === "bazaar" ? bazaarTickets : cafeTickets;
  const categoryName = category === "bazaar" ? "바자회" : "카페";
  const categoryIcon = category === "bazaar" ? <ShoppingBag className="h-5 w-5" /> : <Coffee className="h-5 w-5" />;

  const handleQuantityChange = (ticketId: string, change: number) => {
    setSelectedTickets(prev => {
      const existing = prev.find(t => t.id === ticketId);
      const ticket = tickets.find(t => t.id === ticketId);
      
      if (!ticket) return prev;
      
      if (existing) {
        const newQuantity = existing.quantity + change;
        if (newQuantity <= 0) {
          return prev.filter(t => t.id !== ticketId);
        }
        return prev.map(t => 
          t.id === ticketId ? { ...t, quantity: newQuantity } : t
        );
      } else if (change > 0) {
        return [...prev, { ...ticket, quantity: 1 }];
      }
      return prev;
    });
  };

  const getQuantity = (ticketId: string) => {
    const ticket = selectedTickets.find(t => t.id === ticketId);
    return ticket?.quantity || 0;
  };

  const getTotalAmount = () => {
    return selectedTickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
  };

  const getTotalCount = () => {
    return selectedTickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  };

  const handleProceedToPayment = () => {
    if (!buyerInfo.name || !buyerInfo.phone) {
      alert("이름과 연락처를 입력해주세요.");
      return;
    }
    if (selectedTickets.length === 0) {
      alert("티켓을 선택해주세요.");
      return;
    }
    
    // 주문 정보를 localStorage에 저장
    const orderData = {
      tickets: selectedTickets,
      buyerInfo,
      category,
      totalAmount: getTotalAmount(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("pendingOrder", JSON.stringify(orderData));
    
    // 결제 안내 페이지로 이동
    router.push("/buyer/payment");
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
              {categoryIcon}
              <h1 className="text-xl font-bold">{categoryName} 티켓 구매</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-32">
        {/* 티켓 선택 섹션 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>티켓 선택</CardTitle>
            <CardDescription>구매하실 티켓의 수량을 선택해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{ticket.name}</h3>
                  <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  <p className="text-lg font-bold text-primary mt-1">
                    {ticket.price.toLocaleString()}원
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(ticket.id, -1)}
                    disabled={getQuantity(ticket.id) === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-12 text-center font-semibold">
                    {getQuantity(ticket.id)}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(ticket.id, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 구매자 정보 입력 */}
        <Card>
          <CardHeader>
            <CardTitle>구매자 정보</CardTitle>
            <CardDescription>티켓 발송을 위한 정보를 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                placeholder="홍길동"
                value={buyerInfo.name}
                onChange={(e) => setBuyerInfo(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">연락처 *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={buyerInfo.phone}
                onChange={(e) => setBuyerInfo(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 하단 고정 결제 버튼 */}
      {getTotalCount() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">총 {getTotalCount()}매</p>
                <p className="text-2xl font-bold">{getTotalAmount().toLocaleString()}원</p>
              </div>
              <Button 
                size="lg" 
                className="min-w-[120px]"
                onClick={handleProceedToPayment}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                결제하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TicketsContent />
    </Suspense>
  );
}