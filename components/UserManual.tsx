"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, AlertCircle, Smartphone } from "lucide-react";

interface UserManualProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserManual({ open, onOpenChange }: UserManualProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-blue-600" />
            티켓 구매 사용 설명서
          </DialogTitle>
          <DialogDescription className="text-base">
            LMTC 4기 후원 티켓 구매 방법을 안내해드립니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 스텝 1 */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  1
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-bold text-lg">구매 수량 선택하기</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>• <span className="font-semibold">+ 버튼</span>을 눌러 구매하실 티켓 수량을 늘립니다</p>
                    <p>• <span className="font-semibold">- 버튼</span>을 눌러 수량을 줄입니다</p>
                    <p>• 티켓 1매당 <span className="font-bold text-blue-600">10,000원</span>입니다</p>
                    <p>• 최대 10매까지 구매 가능합니다</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 스텝 2 */}
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  2
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-bold text-lg">구매자 정보 입력하기</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>• <span className="font-semibold">이름</span>: 실명을 입력해주세요 (예: 홍길동)</p>
                    <p>• <span className="font-semibold">연락처</span>: 휴대폰 번호를 입력해주세요</p>
                    <p>• <span className="text-green-600 font-semibold">하이픈 없이</span> 숫자만 입력하세요</p>
                    <p>• 예시: <span className="font-mono bg-gray-100 px-2 py-1 rounded">01012345678</span></p>
                    <p>• 자동으로 <span className="font-mono">010-1234-5678</span> 형식으로 저장됩니다</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 스텝 3 */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  3
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-bold text-lg">티켓 구매하기 버튼 누르기</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>• 파란색 <span className="font-semibold">&ldquo;티켓 구매하기&rdquo;</span> 버튼을 눌러주세요</p>
                    <p>• 입금 안내 페이지로 이동합니다</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 스텝 4 */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  4
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-bold text-lg">계좌로 입금하기</h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="bg-white p-3 rounded-lg border border-orange-300">
                      <p className="font-bold text-lg mb-2">📱 입금 계좌 정보</p>
                      <p>• 은행: <span className="font-bold">국민은행</span></p>
                      <p>• 계좌번호: <span className="font-bold text-blue-600">123-456-789012</span></p>
                      <p>• 예금주: <span className="font-bold">구리성광교회LMTC</span></p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <p className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <span className="font-semibold">입금자명은 반드시 구매시 입력한 이름으로!</span>
                      </p>
                    </div>
                    <p>• 계좌번호 복사 버튼을 누르면 자동으로 복사됩니다</p>
                    <p>• 정확한 금액을 입금해주세요</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 스텝 5 */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  5
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-bold text-lg">주문 완료하기 버튼 누르기</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>• 입금 후 <span className="font-semibold">&ldquo;주문 완료하기&rdquo;</span> 버튼을 눌러주세요</p>
                    <p>• 관리자가 입금을 확인하면 티켓이 발행됩니다</p>
                    <p>• 평일 기준 1~2시간 이내 처리됩니다</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 스텝 6 */}
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  6
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-bold text-lg">티켓 확인하기</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>• 메인 화면 우측 상단 <span className="font-semibold">&ldquo;내 티켓&rdquo;</span> 버튼을 누릅니다</p>
                    <p>• 구매시 입력한 <span className="font-semibold">이름</span>과 <span className="font-semibold">전화번호</span>를 입력합니다</p>
                    <p>• <span className="font-semibold">&ldquo;티켓 조회&rdquo;</span> 버튼을 누르면 티켓을 확인할 수 있습니다</p>
                    <p>• 티켓 이미지를 다운로드하여 보관하세요</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 중요 안내 */}
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div className="space-y-2 flex-1">
                  <h3 className="font-bold text-lg text-red-900">꼭 기억해주세요!</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>✅ 입금자명은 <span className="font-bold">반드시 구매시 입력한 이름</span>으로 보내주세요</p>
                    <p>✅ 티켓 이미지는 <span className="font-bold">휴대폰에 저장</span>해두세요</p>
                    <p>✅ 행사 당일 티켓 이미지를 보여주시면 됩니다</p>
                    <p>✅ 문의사항: <span className="font-bold">010-XXXX-XXXX</span> (LMTC 담당자)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 추가 도움말 */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-center text-gray-600">
              <Smartphone className="inline h-5 w-5 mr-2" />
              이 화면은 언제든지 다시 볼 수 있습니다
            </p>
            <p className="text-center text-gray-600 mt-2">
              메인 화면 상단의 <span className="font-semibold">&ldquo;사용 방법&rdquo;</span> 버튼을 누르세요
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button onClick={() => onOpenChange(false)} size="lg" className="px-8">
            확인했습니다
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}