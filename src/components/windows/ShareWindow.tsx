'use client';

import { shareActions } from '@/utils/shareUtils';

interface ShareWindowProps {
  windowId: string;
}

export default function ShareWindow({ windowId }: ShareWindowProps) {
  const shareButtons = [
    {
      id: 'twitter',
      label: 'X (Twitter)',
      icon: '𝕏',
      action: shareActions.twitter,
      bgColor: 'bg-black',
      textColor: 'text-white',
      customStyle: 'bg-[#000000]'
    },
    {
      id: 'threads',
      label: 'Threads',
      icon: '@',
      action: shareActions.threads,
      bgColor: 'bg-purple-600',
      textColor: 'text-white',
      customStyle: 'bg-[#6B46C1]'
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: 'f',
      action: shareActions.facebook,
      bgColor: 'bg-blue-600',
      textColor: 'text-white',
      customStyle: 'bg-[#1877F2]'
    },
    {
      id: 'kakao',
      label: '카카오톡',
      icon: '💬',
      action: shareActions.kakao,
      bgColor: 'bg-yellow-400',
      textColor: 'text-black',
      customStyle: 'bg-[#FEE500]'
    },
    {
      id: 'copy',
      label: '링크 복사',
      icon: '📋',
      action: shareActions.copy,
      bgColor: 'bg-gray-600',
      textColor: 'text-white',
      customStyle: 'bg-[#6B7280]'
    }
  ];

  return (
    <div className="w-full h-full bg-cream text-retro-black p-3 font-mono overflow-hidden">
      <div className="h-full flex flex-col">
        <h2 className="text-base font-bold mb-3 text-center border-b-2 border-retro-black pb-2">
          하루살이 프로젝트 공유하기
        </h2>
        
        <p className="text-xs text-center mb-4 text-gray-600">
          아래 버튼을 클릭해서 하루살이 프로젝트를 공유해보세요!
        </p>
        
        <div className="flex-1 space-y-2 overflow-y-auto p-1">
          {shareButtons.map((button) => (
            <button
              key={button.id}
              onClick={button.action}
              className={`
                w-full p-2 border-2 border-retro-black 
                ${button.customStyle || button.bgColor} ${button.textColor}
                font-bold text-sm
                transition-all duration-150
                hover:scale-[0.98] hover:shadow-[3px_3px_0px_0px_rgba(44,44,44,1)]
                active:scale-[0.96] active:shadow-[1px_1px_0px_0px_rgba(44,44,44,1)]
                flex items-center justify-center gap-2
                min-h-[40px]
              `}
            >
              <span className="text-base">{button.icon}</span>
              <span className="font-mono">{button.label}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-4 p-2 border border-retro-black bg-gray-100">
          <p className="text-xs text-center text-gray-600">
            💡 공유 링크에는 앨범 소개와 웹사이트 주소가 포함됩니다.
          </p>
        </div>
        
        <div className="mt-2 text-center">
          <div className="border-2 border-retro-black px-3 py-2 bg-album-blue text-xs w-fit mx-auto">
            <span className="font-mono">harusali.vercel.app</span>
          </div>
        </div>
      </div>
    </div>
  );
}