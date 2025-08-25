"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Ticket, Users, Heart, Plus, Minus, ShoppingCart, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [buyerInfo, setBuyerInfo] = useState({
    name: "",
    phone: "",
  });

  const ticketPrice = 10000;
  const totalAmount = ticketPrice * quantity;

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = async () => {
    if (!buyerInfo.name || !buyerInfo.phone) {
      alert("이름과 연락처를 입력해주세요.");
      return;
    }

    try {
      // API를 통해 주문 생성
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerName: buyerInfo.name,
          buyerPhone: buyerInfo.phone,
          quantity: quantity,
          totalAmount: totalAmount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      
      // 주문 ID를 세션 스토리지에 저장
      sessionStorage.setItem('currentOrderId', order.id);
      sessionStorage.setItem('currentOrder', JSON.stringify(order));
      
      // 결제 안내 페이지로 이동
      router.push("/buyer/payment");
    } catch (error) {
      console.error('Order creation error:', error);
      alert('주문 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="bg-primary text-primary-foreground py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">LMTC 4기 후원 티켓</h1>
              <p className="text-sm opacity-90 mt-1">구리 성광교회 선교여행 후원</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/buyer/my-tickets">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                  <Ticket className="h-4 w-4 mr-2" />
                  내 티켓
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="secondary" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  관리자
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* 소개 섹션 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              LMTC 4기 선교여행을 응원해주세요!
            </CardTitle>
            <CardDescription>
              여러분의 따뜻한 후원이 선교의 발걸음이 됩니다.
              후원 티켓을 구매하시면 실물 티켓 이미지를 받으실 수 있습니다.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 티켓 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Ticket className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">LMTC 후원 티켓</CardTitle>
                  <CardDescription>선교여행 후원금</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {ticketPrice.toLocaleString()}원
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 수량 선택 */}
              <div>
                <Label>구매 수량</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-16 text-center">
                    <span className="text-2xl font-bold">{quantity}</span>
                    <span className="text-sm text-muted-foreground ml-1">매</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity === 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 총 금액 */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">총 후원금액</span>
                  <span className="text-2xl font-bold text-primary">
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 구매자 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>구매자 정보</CardTitle>
            <CardDescription>티켓 이미지 전송을 위한 정보입니다</CardDescription>
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

        {/* 구매 버튼 */}
        <Button 
          size="lg" 
          className="w-full"
          onClick={handlePurchase}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          티켓 구매하기
        </Button>

        {/* 안내 사항 */}
        <Card className="mt-6 bg-muted">
          <CardHeader>
            <CardTitle className="text-base">이용 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• 티켓 1매당 10,000원입니다</p>
            <p>• 구매 완료 후 고유번호가 부여된 티켓 이미지를 받으실 수 있습니다</p>
            <p>• 티켓 이미지는 화면에 표시되며 다운로드 가능합니다</p>
            <p>• 행사 당일 티켓 이미지를 보여주시면 됩니다</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}