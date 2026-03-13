import { useState, useEffect } from 'react';

const MOTIVATIONAL_QUOTES = [
  "Plan it. Do it. Own it",
  "Turn pain into power",
  "Small steps. Big impact",
  "Focus. Execute. Repeat",
  "Small steps. Big wins",
  "Make this week count",
  "Progress starts now",
  "Stay focused. Stay sharp",
  "Discipline = Freedom",
  "Win your week",
  "Show up every day",
  "Build better habits ",
  "This week, no excuses",
  "हर दिन एक कदम आगे। ",
  "Reset. Refocus. Restart",
  "Consistency is power ",
  "Turn plans into action ",
  "Dream it. Do it. Repeat ",
  "Start strong. Finish stronger ",
  "No pressure. No diamonds ",
  "Earn your results ",
  "Level up daily ",
  "Chase growth, not comfort ",
  "Action beats intention ",
  "Push past limits ",
  "Rise. Grind. Shine ",
  "Make discipline your habit ",
  "Do it scared. Do it anyway ",
  "Stack small wins ",
  "Focus fuels success ",
  "Create your momentum ",
  "One day or day one ",
  "Outwork yesterday ",
  "Be stronger than excuses ",
  "Results need effort ",
  "Stay hungry. Stay humble ",
  "आज मेहनत, कल जीत। ",
  "Think big. Start small ",
  "Discipline over motivation ",
  "Make yourself proud ",
  "Keep moving forward ",
  "Your pace. Your race ",
  "Habits build greatness ",
  "Pressure builds power ",
  "Commit. Conquer. Celebrate ",
  "Win the morning  ",
  "Strive for progress "
];

export function MotivationalQuotes() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeOut(true);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
        setFadeOut(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+Grande:wght@400;500;600;700&display=swap');
        
        .brush-font {
          font-family: 'Fredoka Grande', sans-serif;
          font-weight: 550;
          letter-spacing: 0.5px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1), -1px -1px 2px rgba(255, 255, 255, 0.5);
        }
      `}</style>
      <div className="inline-block min-w-0 w-full max-w-[420px] xl:max-w-[540px] overflow-hidden">
        <div
          className={`text-center transition-opacity duration-500 ${
            fadeOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <p
            className="brush-font overflow-hidden text-ellipsis whitespace-nowrap text-base lg:text-lg xl:text-xl text-gray-700 dark:text-gray-300"
            title={MOTIVATIONAL_QUOTES[currentQuoteIndex]}
          >
            {MOTIVATIONAL_QUOTES[currentQuoteIndex]}
          </p>
        </div>
      </div>
    </>
  );
}
