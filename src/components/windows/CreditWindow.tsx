'use client';

interface CreditWindowProps {
  windowId: string;
}

export default function CreditWindow({ windowId }: CreditWindowProps) {
  return (
    <div className="h-full bg-cream text-retro-black font-system">
      <div 
        className="h-full overflow-auto p-4 text-sm leading-relaxed"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-bold mb-6">Credit</h2>
          
          <div>
            <strong>작사, 작곡, 편곡, 녹음:</strong> 김지혜
          </div>
          
          <div>
            <strong>믹싱, 마스터링:</strong> 황경하 (
            <a 
              href="https://studionol.co.kr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-album-purple underline hover:text-album-orange hover:no-underline transition-colors cursor-pointer"
            >
              @스튜디오 놀
            </a>
            )
          </div>
          
          <div>
            <strong>디자인:</strong> 김한샘 (
            <a 
              href="https://www.instagram.com/owaowa_studio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-album-purple underline hover:text-album-orange hover:no-underline transition-colors cursor-pointer"
            >
              @오와오와 스튜디오
            </a>
            )
          </div>
          
          <div>
            <strong>뮤직비디오:</strong> 송창식, 신명
          </div>
          
          <div className="mt-8 pt-4 border-t border-retro-black text-xs opacity-80">
            © & ℗ Harusali Project, 2025. All rights of the producer and of the owner of the work reproduced reserved. Unauthorised copying, hiring, lending, public performance and broadcasting of this recording prohibited.
          </div>
        </div>
      </div>
    </div>
  );
}