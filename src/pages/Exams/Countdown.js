import { useEffect, useRef, useState } from "react";

const CountdownTimer = ({ timerValue }) => {
  const Ref = useRef(null);
  const [timer, setTimer] = useState("00:00:00");

  const getTimeRemaining = (deadline) => {
    const total = Date.parse(deadline) - Date.now();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60));
    return { total, hours, minutes, seconds };
  };

  const startTimer = (deadline) => {
    const { total, hours, minutes, seconds } = getTimeRemaining(deadline);
    if (total >= 0) {
      setTimer(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    } else {
      clearInterval(Ref.current);
      setTimer("00:00:00");
    }
  };

  const startCountdown = () => {
    const deadline = new Date(Date.now() + timerValue * 60 * 1000); // timerValue in minutes
    if (Ref.current) clearInterval(Ref.current);
    Ref.current = setInterval(() => startTimer(deadline), 1000);
  };

  useEffect(() => {
    if (timerValue) {
      startCountdown();
    }
    return () => clearInterval(Ref.current);
  }, [timerValue]);

  return (
    <div>
      <p>{timer}</p>
    </div>
  );
};

export default CountdownTimer;
