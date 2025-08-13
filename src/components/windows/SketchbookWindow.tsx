'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface SketchbookWindowProps {
  windowId: string;
}

type Tool = 'crayon' | 'pencil' | 'pastel' | 'eraser';

interface CrayonColor {
  name: string;
  color: string;
}

const crayonColors: CrayonColor[] = [
  { name: '빨강', color: '#FF6B6B' },
  { name: '주황', color: '#FF8E53' },
  { name: '노랑', color: '#FFE66D' },
  { name: '연두', color: '#95E1D3' },
  { name: '초록', color: '#4ECDC4' },
  { name: '하늘', color: '#45B7D1' },
  { name: '파랑', color: '#5B9BD5' },
  { name: '보라', color: '#A78BFA' },
  { name: '분홍', color: '#FF8B94' },
  { name: '갈색', color: '#D4A574' },
  { name: '회색', color: '#95A5A6' },
  { name: '검정', color: '#2C3E50' },
];

export default function SketchbookWindow({ windowId: _ }: SketchbookWindowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('crayon');
  const [currentColor, setCurrentColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(8);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // 색상을 파스텔 톤으로 변환하는 함수
  const toPastelColor = useCallback((hexColor: string) => {
    // hex를 RGB로 변환
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // 파스텔 톤으로 변환 (밝기 증가, 채도 감소)
    const pastelR = Math.min(255, r + (255 - r) * 0.6);
    const pastelG = Math.min(255, g + (255 - g) * 0.6);
    const pastelB = Math.min(255, b + (255 - b) * 0.6);
    
    return `rgb(${Math.round(pastelR)}, ${Math.round(pastelG)}, ${Math.round(pastelB)})`;
  }, []);

  // Canvas 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 종이 질감 배경
    ctx.fillStyle = '#FFFEF7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 종이 텍스처 추가
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillStyle = Math.random() > 0.5 ? '#E8E8E8' : '#F5F5F5';
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
  }, []);

  // 크레용 텍스처 브러시 그리기
  const drawCrayonStroke = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, pressure: number = 1) => {
    const size = brushSize * pressure;
    
    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      return;
    }

    ctx.fillStyle = currentColor;
    
    switch (currentTool) {
      case 'crayon':
        // 크레용 거친 텍스처
        ctx.globalAlpha = 0.6;
        for (let i = 0; i < 8; i++) {
          const offsetX = (Math.random() - 0.5) * size * 0.8;
          const offsetY = (Math.random() - 0.5) * size * 0.8;
          const dotSize = Math.random() * size * 0.3 + 1;
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'pencil':
        // 색연필 선명한 선
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, size / 3, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'pastel':
        // 파스텔 부드러운 효과
        const pastelColor = toPastelColor(currentColor);
        ctx.fillStyle = pastelColor;
        
        // 매우 연한 투명도로 여러 층 그리기
        ctx.globalAlpha = 0.12;
        
        // 중심에서 바깥으로 페이드되는 그라데이션 생성
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.8);
        gradient.addColorStop(0, pastelColor);
        gradient.addColorStop(0.7, pastelColor);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        
        // 메인 브러시 스트로크
        ctx.beginPath();
        ctx.arc(x, y, size * 1.8, 0, Math.PI * 2);
        ctx.fill();
        
        // 추가 부드러운 점들로 자연스러운 텍스처
        ctx.fillStyle = pastelColor;
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 12; i++) {
          const offsetX = (Math.random() - 0.5) * size * 1.5;
          const offsetY = (Math.random() - 0.5) * size * 1.5;
          const dotSize = Math.random() * size * 0.6 + size * 0.3;
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
    }
    
    ctx.globalAlpha = 1;
  }, [currentTool, currentColor, brushSize, toPastelColor]);

  // 연속된 점들 사이를 연결하여 부드러운 선 그리기
  const drawLine = useCallback((ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
    const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
    const steps = Math.max(1, Math.floor(distance / 2));
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const x = from.x + (to.x - from.x) * progress;
      const y = from.y + (to.y - from.y) * progress;
      const pressure = 1 - (distance / 100) * 0.3; // 속도에 따른 압력 변화
      drawCrayonStroke(ctx, x, y, Math.max(0.3, pressure));
    }
  }, [drawCrayonStroke]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation(); // 창 드래그 이벤트 전파 차단
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setLastPoint({ x, y });

    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawCrayonStroke(ctx, x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    
    e.stopPropagation(); // 창 드래그 이벤트 전파 차단
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawLine(ctx, lastPoint, { x, y });
    }

    setLastPoint({ x, y });
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (e) {
      e.stopPropagation(); // 창 드래그 이벤트 전파 차단
    }
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 종이 배경으로 초기화
    ctx.fillStyle = '#FFFEF7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 종이 텍스처 다시 추가
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillStyle = Math.random() > 0.5 ? '#E8E8E8' : '#F5F5F5';
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
  };

  return (
    <div className="h-full bg-amber-50 flex flex-col">
      {/* 툴바 */}
      <div className="bg-yellow-100 border-b-2 border-orange-200 p-2 flex-shrink-0">
        <div className="flex items-center gap-4 mb-2">
          {/* 도구 선택 */}
          <div className="flex gap-1">
            {[
              { tool: 'crayon' as Tool, label: '🖍️', name: '크레용' },
              { tool: 'pencil' as Tool, label: '✏️', name: '색연필' },
              { tool: 'pastel' as Tool, label: '🎨', name: '파스텔' },
              { tool: 'eraser' as Tool, label: '🧽', name: '지우개' },
            ].map(({ tool, label, name }) => (
              <button
                key={tool}
                onClick={() => setCurrentTool(tool)}
                className={`px-3 py-2 text-sm rounded-lg border-2 font-medium transition-all ${
                  currentTool === tool
                    ? 'bg-orange-200 border-orange-400 text-orange-800 shadow-inner'
                    : 'bg-white border-orange-300 text-orange-700 hover:bg-orange-50'
                }`}
                title={name}
              >
                {label} {name}
              </button>
            ))}
          </div>

          {/* 브러시 크기 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-orange-800">크기:</span>
            <input
              type="range"
              min="2"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-orange-700 w-6">{brushSize}</span>
          </div>

          {/* 전체 지우기 */}
          <button
            onClick={clearCanvas}
            className="px-3 py-2 text-sm bg-red-100 border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            🗑️ 지우기
          </button>
        </div>

        {/* 색상 팔레트 */}
        <div className="flex flex-wrap gap-1">
          {crayonColors.map(({ name, color }) => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              className={`w-8 h-8 rounded-full border-3 transition-all ${
                currentColor === color
                  ? 'border-yellow-600 scale-110 shadow-lg'
                  : 'border-yellow-400 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={name}
            />
          ))}
        </div>
      </div>

      {/* 캔버스 영역 */}
      <div className="flex-1 p-4 overflow-hidden">
        <div 
          className="w-full h-full border-4 border-orange-200 rounded-lg shadow-inner bg-white relative"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={() => stopDrawing()}
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      {/* 상태바 */}
      <div className="bg-yellow-100 border-t-2 border-orange-200 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-orange-800">
          <span>
            도구: {currentTool === 'crayon' ? '🖍️ 크레용' : 
                   currentTool === 'pencil' ? '✏️ 색연필' : 
                   currentTool === 'pastel' ? '🎨 파스텔' : '🧽 지우개'}
          </span>
          <span>크기: {brushSize}px</span>
          <span>색상: {crayonColors.find(c => c.color === currentColor)?.name || '색상'}</span>
        </div>
      </div>
    </div>
  );
}