"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ADMIN_PASSWORD = "100400";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      // 로그인 성공 - 세션에 저장
      sessionStorage.setItem("adminAuth", "true");
      sessionStorage.setItem("adminAuthTime", Date.now().toString());
      router.push("/admin");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 뒤로가기 버튼 */}
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            메인으로
          </Button>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>관리자 로그인</CardTitle>
            <CardDescription>
              판매자 관리 시스템에 접근하려면 비밀번호를 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                로그인
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>LMTC 4기 후원 티켓 관리 시스템</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}