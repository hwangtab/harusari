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
    question: "앨범 디자인을 담당한 '@오와오와 스튜디오'의 실제 이름은?",
    options: [
      "김지혜",
      "황경하",
      "김한샘",
      "양상아"
    ],
    correct: 2
  },
  {
    question: "이 인터랙티브 웹사이트에서 그림을 그릴 수 있는 도구의 이름은?",
    options: [
      "포토샵",
      "페인트",
      "스케치북",
      "드로잉"
    ],
    correct: 2
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
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion === questions.length - 1) {
        // 게임 끝
        if (newScore === questions.length) {
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
          setGameState('failed');
        }
      } else {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 2000);
  };

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
      <div className="h-full bg-gradient-to-br from-purple-100 to-blue-100 p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-white rounded-lg p-8 shadow-2xl border-4 border-purple-400 max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-purple-800">게임 완료!</h2>
          <p className="text-lg mb-6 text-gray-700">{getResultMessage()}</p>
          
          {gameState === 'completed' && (
            <div className="mb-6 p-4 bg-green-100 rounded-lg border-2 border-green-400">
              <p className="text-green-800 font-semibold">
                🎁 비밀 파일이 열렸습니다!<br/>
                음원 다운로드 링크를 확인해보세요.
              </p>
            </div>
          )}
          
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-colors shadow-lg border-2 border-purple-700"
          >
            🔄 다시 도전하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-yellow-100 to-orange-100 p-4">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 rounded-t-lg border-4 border-blue-700 text-center">
        <h1 className="text-xl font-bold">🎵 하루살이 앨범 퀴즈 🎵</h1>
        <p className="text-blue-100">
          문제 {currentQuestion + 1}/{questions.length} | 점수: {score}/{questions.length}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-4 border-blue-700 border-t-0 px-4 py-2">
        <div className="bg-gray-200 rounded-full h-3">
          <div 
            className="bg-green-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Area */}
      <div className="bg-white border-4 border-blue-700 border-t-0 p-6 flex-1">
        <div className="text-center mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 leading-relaxed">
            {questions[currentQuestion].question}
          </h2>
          
          {showResult && (
            <div className={`text-xl font-bold mb-4 ${
              selectedAnswer === questions[currentQuestion].correct 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {getAnswerFeedback()}
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 gap-4">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`p-4 text-left font-semibold rounded-lg border-3 transition-all duration-200 ${
                selectedAnswer === null
                  ? 'bg-white border-gray-400 hover:bg-blue-50 hover:border-blue-400 hover:scale-105'
                  : selectedAnswer === index
                  ? showResult
                    ? index === questions[currentQuestion].correct
                      ? 'bg-green-200 border-green-500 text-green-800'
                      : 'bg-red-200 border-red-500 text-red-800'
                    : 'bg-blue-200 border-blue-500 text-blue-800'
                  : index === questions[currentQuestion].correct && showResult
                  ? 'bg-green-200 border-green-500 text-green-800'
                  : 'bg-gray-100 border-gray-300 text-gray-600'
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
          <div className="text-center mt-8">
            <button
              onClick={handleNextQuestion}
              className="px-8 py-4 bg-orange-400 text-white font-bold rounded-lg hover:bg-orange-500 transition-colors shadow-lg border-3 border-orange-600 text-lg"
            >
              {currentQuestion === questions.length - 1 ? '🏁 결과 보기' : '➡️ 다음 문제'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}