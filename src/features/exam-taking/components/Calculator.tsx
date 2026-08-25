import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calculator as CalculatorIcon, X } from 'lucide-react';

interface CalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Calculator({ open, onOpenChange }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    if (previousValue !== null && operation) {
      const inputValue = parseFloat(display);
      const newValue = calculate(previousValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalculatorIcon className="h-5 w-5" />
            Calculator
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Display */}
          <div className="bg-gray-900 text-white p-4 rounded-lg text-right">
            <div className="text-3xl font-mono font-bold overflow-x-auto">
              {display}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              className="col-span-2 h-12"
              onClick={clear}
            >
              Clear
            </Button>
            <Button
              variant="outline"
              className="h-12"
              onClick={() => inputOperation('/')}
            >
              ÷
            </Button>
            <Button
              variant="outline"
              className="h-12"
              onClick={() => inputOperation('*')}
            >
              ×
            </Button>

            <Button variant="outline" className="h-12" onClick={() => inputNumber('7')}>
              7
            </Button>
            <Button variant="outline" className="h-12" onClick={() => inputNumber('8')}>
              8
            </Button>
            <Button variant="outline" className="h-12" onClick={() => inputNumber('9')}>
              9
            </Button>
            <Button
              variant="outline"
              className="h-12"
              onClick={() => inputOperation('-')}
            >
              −
            </Button>

            <Button variant="outline" className="h-12" onClick={() => inputNumber('4')}>
              4
            </Button>
            <Button variant="outline" className="h-12" onClick={() => inputNumber('5')}>
              5
            </Button>
            <Button variant="outline" className="h-12" onClick={() => inputNumber('6')}>
              6
            </Button>
            <Button
              variant="outline"
              className="h-12"
              onClick={() => inputOperation('+')}
            >
              +
            </Button>

            <Button variant="outline" className="h-12" onClick={() => inputNumber('1')}>
              1
            </Button>
            <Button variant="outline" className="h-12" onClick={() => inputNumber('2')}>
              2
            </Button>
            <Button variant="outline" className="h-12" onClick={() => inputNumber('3')}>
              3
            </Button>
            <Button
              variant="default"
              className="h-12 row-span-2"
              onClick={performCalculation}
            >
              =
            </Button>

            <Button
              variant="outline"
              className="h-12 col-span-2"
              onClick={() => inputNumber('0')}
            >
              0
            </Button>
            <Button variant="outline" className="h-12" onClick={inputDecimal}>
              .
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


