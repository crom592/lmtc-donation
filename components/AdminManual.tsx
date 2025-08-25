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
import { BookOpen, AlertCircle, QrCode, Search } from "lucide-react";

interface AdminManualProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminManual({ open, onOpenChange }: AdminManualProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-600" />
            관리자 사용 설명서
          </DialogTitle>
          <DialogDescription className="text-base">
            LMTC 4기 후원 티켓 관리 시스템 사용 방법
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 섹션 1: 주문 관리 */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-purple-700">📋 주문 관리</h2>
            
            <Card className="border-blue-200 bg-blue-50/50 mb-4">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-3">1. 입금 확인하기</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• 주문 목록에서 <span className="bg-yellow-200 px-1 rounded">입금 대기</span> 상태인 주문을 찾습니다</p>
                  <p>• 구매자 이름과 입금액을 확인합니다</p>
                  <p>• 실제 입금이 확인되면 <span className="font-semibold text-green-600">&ldquo;입금 확인&rdquo;</span> 버튼을 누릅니다</p>
                  <p>• 입금 확인을 누르면 자동으로 티켓이 발행됩니다</p>
                  <div className="bg-white p-3 rounded-lg mt-3">
                    <p className="font-semibold text-sm">💡 티켓 번호 형식</p>
                    <p className="text-sm">자동 생성되는 번호 (예: 0001, 0002, 0003...)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/50 mb-4">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-3">2. 주문 취소하기</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• 잘못된 주문이나 취소 요청시 <span className="font-semibold text-red-600">&ldquo;주문 취소&rdquo;</span> 버튼을 누릅니다</p>
                  <p>• 취소된 주문은 목록에서 <span className="bg-gray-200 px-1 rounded">취소됨</span> 상태로 표시됩니다</p>
                  <p>• 이미 발행된 티켓도 함께 취소됩니다</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 섹션 2: 티켓 사용 처리 */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-purple-700">🎫 티켓 사용 처리</h2>
            
            <Card className="border-green-200 bg-green-50/50 mb-4">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-3">방법 1: 티켓 번호 직접 입력</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• 화면 상단의 <span className="font-semibold">&ldquo;티켓 사용 처리&rdquo;</span> 섹션을 찾습니다</p>
                  <p>• 티켓 번호 입력란에 번호를 입력합니다 (예: 0001)</p>
                  <p>• <span className="font-semibold text-blue-600">&ldquo;사용 처리&rdquo;</span> 버튼을 누르거나 Enter 키를 누릅니다</p>
                  <p>• 사용 완료 메시지가 표시됩니다</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50 mb-4">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-3">방법 2: QR 코드 스캔 (권장)</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• 티켓 번호 입력란 옆의 <QrCode className="inline h-5 w-5" /> 버튼을 누릅니다</p>
                  <p>• <span className="font-semibold">&ldquo;카메라 시작&rdquo;</span> 버튼을 누릅니다</p>
                  <p>• 티켓의 QR 코드를 카메라에 비춥니다</p>
                  <p>• 자동으로 인식되어 사용 처리됩니다</p>
                  <div className="bg-yellow-100 p-3 rounded-lg mt-3">
                    <p className="text-sm">⚡ QR 스캔이 가장 빠르고 정확합니다!</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/50 mb-4">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-3">방법 3: 주문 목록에서 처리</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• 주문 목록에서 해당 구매자를 찾습니다</p>
                  <p>• 발행된 티켓 번호 목록이 표시됩니다</p>
                  <p>• 각 티켓 옆의 <span className="font-semibold">&ldquo;사용 처리&rdquo;</span> 버튼을 누릅니다</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 섹션 3: 검색 및 필터 */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-purple-700">🔍 검색 및 필터</h2>
            
            <Card className="border-gray-200 bg-gray-50/50 mb-4">
              <CardContent className="pt-6">
                <div className="space-y-2 text-gray-700">
                  <p>• <Search className="inline h-4 w-4" /> 검색창에 이름이나 전화번호를 입력하여 찾을 수 있습니다</p>
                  <p>• <span className="font-semibold">&ldquo;전체&rdquo;</span> - 모든 주문 표시</p>
                  <p>• <span className="font-semibold">&ldquo;입금 대기&rdquo;</span> - 입금 확인이 필요한 주문만 표시</p>
                  <p>• <span className="font-semibold">&ldquo;입금 완료&rdquo;</span> - 티켓이 발행된 주문만 표시</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 섹션 4: 통계 확인 */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-purple-700">📊 통계 확인</h2>
            
            <Card className="border-indigo-200 bg-indigo-50/50 mb-4">
              <CardContent className="pt-6">
                <div className="space-y-2 text-gray-700">
                  <p>화면 상단에 실시간 통계가 표시됩니다:</p>
                  <p>• <span className="font-semibold">전체 주문</span>: 총 주문 건수</p>
                  <p>• <span className="font-semibold">입금 대기</span>: 확인이 필요한 주문</p>
                  <p>• <span className="font-semibold">입금 완료</span>: 티켓 발행 완료</p>
                  <p>• <span className="font-semibold">발행 티켓</span>: 총 발행된 티켓 수</p>
                  <p>• <span className="font-semibold">사용된 티켓</span>: 사용 처리된 티켓</p>
                  <p>• <span className="font-semibold">총 매출</span>: 입금 완료된 총액</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 중요 안내 */}
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div className="space-y-2 flex-1">
                  <h3 className="font-bold text-lg text-red-900">주의사항</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>⚠️ 입금 확인은 실제 입금을 확인한 후에만 처리하세요</p>
                    <p>⚠️ 한번 사용 처리된 티켓은 다시 사용할 수 없습니다</p>
                    <p>⚠️ 주문 목록은 5초마다 자동으로 새로고침됩니다</p>
                    <p>⚠️ 30분 동안 활동이 없으면 자동 로그아웃됩니다</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 추가 팁 */}
          <div className="bg-purple-100 p-4 rounded-lg">
            <p className="text-center font-semibold text-purple-900 mb-2">
              💡 유용한 팁
            </p>
            <div className="space-y-1 text-sm text-purple-800">
              <p>• 새로고침 버튼으로 수동 새로고침 가능</p>
              <p>• 모바일에서도 모든 기능 사용 가능</p>
              <p>• QR 스캔은 밝은 곳에서 더 잘 작동합니다</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button onClick={() => onOpenChange(false)} size="lg" className="px-8">
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}