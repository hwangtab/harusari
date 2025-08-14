'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';

interface QuizWindowProps {
  windowId: string;
}

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const quizQuestions: Question[] = [
  {
    question: "이 앨범의 정확한 제목은 무엇인가요?",
    options: [
      "하루살이 프로젝트 1: 알 수 없는 느낌",
      "하루살이 프로젝트 2: 알 수 없는 느낌", 
      "하루살이 프로젝트: 모르는 느낌",
      "하루살이 프로젝트 2: 이상한 느낌"
    ],
    correct: 1
  },
  {
    question: "이 앨범의 믹싱과 마스터링을 담당한 사람은 누구인가요?",
    options: [
      "김지혜",
      "황경하",
      "김한샘", 
      "송창식"
    ],
    correct: 1
  },
  {
    question: "이 앨범의 총 트랙 수는 몇 개인가요?",
    options: [
      "10개",
      "12개",
      "13개",
      "15개"
    ],
    correct: 2
  },
  {
    question: "앨범 디자인을 담당한 '@오와오와 스튜디오'의 디자이너 이름은?",
    options: [
      "김지혜",
      "황경하",
      "김한샘",
      "윤석열"
    ],
    correct: 2
  },
  {
    question: "10번 트랙의 제목은?",
    options: [
      "사람생각",
      "말 필요 없는 노래",
      "다 니맘때로",
      "그림을 그려"
    ],
    correct: 1
  }
];

export default function QuizWindow({ windowId: _ }: QuizWindowProps) {
  const { openWindow } = useStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed' | 'failed'>('playing');
  const [showResult, setShowResult] = useState(false);
  const [questions] = useState(quizQuestions);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correct;
    setShowResult(true);

    if (isCorrect) {
      // 정답일 때
      const newScore = score + 1;
      setScore(newScore);

      setTimeout(() => {
        if (currentQuestion === questions.length - 1) {
          // 마지막 문제 정답 - 게임 완료
          setGameState('completed');
          // secret.txt 창 자동 열기
          setTimeout(() => {
            openWindow({
              id: `window-secret-${Date.now()}`,
              title: 'secret.txt',
              component: 'SecretTxtWindow',
              x: Math.random() * 200 + 100,
              y: Math.random() * 200 + 100,
              width: 700,
              height: 600,
              isMinimized: false,
              isMaximized: false
            });
          }, 1000);
        } else {
          // 다음 문제로 진행
          setCurrentQuestion(prev => prev + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        }
      }, 1000);
    } else {
      // 틀렸을 때 - 다시 시도 가능
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowResult(false);
      }, 1000);
    }
  };;

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setGameState('playing');
    setShowResult(false);
  };

  const getResultMessage = () => {
    if (gameState === 'completed') {
      return "🎉 축하합니다! 모든 문제를 맞추셨습니다!";
    } else if (gameState === 'failed') {
      return `😅 ${score}/${questions.length}개 정답입니다. 다시 도전해보세요!`;
    }
    return "";
  };

  const getAnswerFeedback = () => {
    if (selectedAnswer === null || !showResult) return "";
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correct;
    return isCorrect ? "🎊 정답입니다!" : "❌ 틀렸습니다!";
  };

  if (gameState !== 'playing') {
    return (
      <div className="h-full bg-cream text-retro-black font-system p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-cream border-2 border-retro-black p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-retro-black">게임 완료!</h2>
          <p className="text-lg mb-6 text-retro-black">{getResultMessage()}</p>
          
          {gameState === 'completed' && (
            <div className="mb-6 p-4 bg-album-orange border-2 border-retro-black">
              <p className="text-retro-black font-semibold">
                🎁 비밀 파일이 열렸습니다!<br/>
                음원 다운로드 링크를 확인해보세요.
              </p>
            </div>
          )}
          
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-album-purple text-cream font-bold border-2 border-retro-black hover:bg-album-purple/80 transition-colors"
          >
            🔄 다시 도전하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-cream text-retro-black font-system p-4">
      {/* Header */}
      <div className="bg-album-purple text-cream p-4 border-2 border-retro-black text-center">
        <h1 className="text-xl font-bold">🎵 하루살이 앨범 퀴즈 🎵</h1>
        <p className="text-cream">
          문제 {currentQuestion + 1}/{questions.length} | 점수: {score}/{questions.length}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-cream border-2 border-retro-black border-t-0 px-4 py-2">
        <div className="bg-retro-black border border-retro-black h-3">
          <div 
            className="bg-album-orange h-full transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Area - Scrollable */}
      <div className="bg-cream border-2 border-retro-black border-t-0 flex-1 flex flex-col overflow-hidden">
        <div className="p-6 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5A45C #F5F3E7' }}>
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-retro-black mb-4 leading-relaxed">
            {questions[currentQuestion].question}
          </h2>
          
          {/* Fixed height feedback area to prevent layout shift */}
          <div className="h-12 flex items-center justify-center mb-4">
            {showResult && (
              <div className={`text-xl font-bold ${
                selectedAnswer === questions[currentQuestion].correct 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {getAnswerFeedback()}
              </div>
            )}
          </div>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 gap-4">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`p-4 text-left font-semibold border-2 transition-all duration-200 ${
                selectedAnswer === null
                  ? 'bg-cream border-retro-black text-retro-black hover:bg-album-orange hover:border-retro-black'
                  : selectedAnswer === index
                  ? showResult
                    ? index === questions[currentQuestion].correct
                      ? 'bg-album-orange border-retro-black text-retro-black'
                      : 'bg-glitch-magenta border-retro-black text-cream'
                    : 'bg-album-purple border-retro-black text-cream'
                  : index === questions[currentQuestion].correct && showResult
                  ? 'bg-album-orange border-retro-black text-retro-black'
                  : 'bg-cream border-retro-black text-retro-black opacity-60'
              }`}
            >
              <span className="font-bold mr-3">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Next Button */}
        {selectedAnswer !== null && (
          <div className="text-center mt-6">
            <button
              onClick={handleNextQuestion}
              className="px-8 py-4 bg-album-orange text-retro-black font-bold border-2 border-retro-black hover:bg-album-orange/80 transition-colors text-lg"
            >
              {showResult 
                ? (selectedAnswer === questions[currentQuestion].correct 
                    ? (currentQuestion === questions.length - 1 ? '🏁 결과 보기' : '➡️ 다음 문제')
                    : '🔄 다시 시도')
                : '✅ 확인'
              }
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}