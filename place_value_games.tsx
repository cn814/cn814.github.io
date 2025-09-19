  const getLevelInfo = (level = mathLevel) => {
    const levelInfo = {
      1: { name: 'Rookie League', desc: 'Addition within 20', emoji: '🥎' },
      2: { name: 'Single-A', desc: 'Subtraction within 20', emoji: '⚾' },
      3: { name: 'Double-A', desc: 'Addition within 50', emoji: '🏟️' },
      4: { name: 'Triple-A', desc: 'Subtraction within 50', emoji: '🏆' },
      5: { name: 'Major League', desc: 'Mixed operations within 100', emoji: '👑' }
    };
    return levelInfo[level] || levelInfo[1];
  };import React, { useState, useEffect } from 'react';

const BaseballMathGames = () => {
  // Game state
  const [currentGame, setCurrentGame] = useState('menu');
  const [builderDice, setBuilderDice] = useState([0, 0, 0]);
  const [selectedDice, setSelectedDice] = useState(null);
  const [builderSlots, setBuilderSlots] = useState({ hundreds: null, tens: null, ones: null });
  const [bingoNumbers, setBingoNumbers] = useState([]);
  const [bingoMarked, setBingoMarked] = useState(new Set());
  const [bingoCallIndex, setBingoCallIndex] = useState(0);
  const [bingoCalls, setBingoCalls] = useState([]);
  const [totalMoney, setTotalMoney] = useState(0);
  const [concessionPrice, setConcessionPrice] = useState(247);
  const [walletOpen, setWalletOpen] = useState(false);
  const [blocksProblem, setBlocksProblem] = useState(null);
  const [blocksAnswer, setBlocksAnswer] = useState('');
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });
  
  // Math Quest game state
  const [mathProblem, setMathProblem] = useState(null);
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathScore, setMathScore] = useState(0);
  const [mathStreak, setMathStreak] = useState(0);
  const [mathLevel, setMathLevel] = useState(1);
  const [mathRuns, setMathRuns] = useState(0);

  // Base Running game state
  const [baseRunningProblem, setBaseRunningProblem] = useState(null);
  const [baseRunningAnswer, setBaseRunningAnswer] = useState('');
  const [baseRunningScore, setBaseRunningScore] = useState(0);
  const [expandedFormInputs, setExpandedFormInputs] = useState({ hundreds: '', tens: '', ones: '' });

  // Baseball concession items
  const concessionItems = [
    {
      name: "Championship Hot Dog",
      description: "All-beef hot dog with mustard and onions!",
      emoji: "🌭⚾",
      rarity: "Home Run Special"
    },
    {
      name: "Grand Slam Nachos", 
      description: "Loaded nachos with cheese and jalapeños!",
      emoji: "🧀⚾",
      rarity: "All-Star Favorite"
    },
    {
      name: "MVP Popcorn Bucket",
      description: "Fresh buttery popcorn in a souvenir bucket!",
      emoji: "🍿⚾",
      rarity: "Fan Favorite"
    },
    {
      name: "World Series Soda",
      description: "Ice-cold soda in a commemorative cup!",
      emoji: "🥤⚾",
      rarity: "Classic Choice"
    },
    {
      name: "Triple Play Pizza",
      description: "Personal pizza with your favorite toppings!",
      emoji: "🍕⚾",
      rarity: "Rookie Special"
    },
    {
      name: "Home Plate Ice Cream",
      description: "Vanilla ice cream in a baseball helmet bowl!",
      emoji: "🍦⚾",
      rarity: "Sweet Victory"
    }
  ];

  const [currentConcessionItem, setCurrentConcessionItem] = useState(concessionItems[0]);

  // Show feedback helper
  const showFeedback = (message, type) => {
    setFeedback({ show: true, message, type });
    setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 3000);
  };

  // ===== BATTING PRACTICE (Number Builder) =====
  const rollDice = () => {
    const newDice = [
      Math.floor(Math.random() * 9) + 1,
      Math.floor(Math.random() * 9) + 1,
      Math.floor(Math.random() * 9) + 1
    ];
    setBuilderDice(newDice);
    setSelectedDice(null);
    setBuilderSlots({ hundreds: null, tens: null, ones: null });
  };

  const selectDice = (index) => {
    if (builderDice[index] === null) return;
    setSelectedDice(index);
  };

  const placeInSlot = (place) => {
    if (selectedDice === null || builderDice[selectedDice] === null || builderSlots[place] !== null) return;
    
    const newSlots = { ...builderSlots };
    newSlots[place] = builderDice[selectedDice];
    setBuilderSlots(newSlots);
    
    const newDice = [...builderDice];
    newDice[selectedDice] = null;
    setBuilderDice(newDice);
    setSelectedDice(null);
    
    // Check if game is complete and provide feedback
    if (Object.values(newSlots).every(s => s !== null)) {
      checkOptimalNumber(newSlots);
    }
  };

  const checkOptimalNumber = (slots) => {
    const originalDice = [slots.hundreds, slots.tens, slots.ones].filter(Boolean);
    const sortedDice = originalDice.sort((a, b) => b - a);
    const optimalNumber = sortedDice[0] * 100 + sortedDice[1] * 10 + sortedDice[2];
    const playerNumber = (slots.hundreds || 0) * 100 + (slots.tens || 0) * 10 + (slots.ones || 0);
    
    if (playerNumber === optimalNumber) {
      showFeedback(`⚾ HOME RUN! ${playerNumber} is the highest possible score!`, 'success');
    } else {
      showFeedback(`Good swing! You scored ${playerNumber} runs, but the grand slam was ${optimalNumber}.`, 'error');
    }
  };

  const getBuilderNumber = () => {
    const hundreds = builderSlots.hundreds || 0;
    const tens = builderSlots.tens || 0;
    const ones = builderSlots.ones || 0;
    return hundreds * 100 + tens * 10 + ones;
  };

  // ===== STADIUM BINGO =====
  const initBingo = () => {
    const numbers = [];
    while (numbers.length < 25) {
      const num = Math.floor(Math.random() * 900) + 100;
      if (!numbers.includes(num)) numbers.push(num);
    }
    setBingoNumbers(numbers);
    const initialMarked = new Set();
    initialMarked.add(12); // Mark the center square (HOME PLATE) as already marked
    setBingoMarked(initialMarked);
    setBingoCallIndex(0);
    
    // Create comprehensive calls for all possible place values
    const allPossibleCalls = [];
    
    // Hundreds place calls (1-9)
    for (let digit = 1; digit <= 9; digit++) {
      allPossibleCalls.push({
        text: `Find a jersey number with ${digit} in the hundreds place`,
        answer: num => Math.floor(num / 100) === digit
      });
    }
    
    // Tens place calls (0-9)
    for (let digit = 0; digit <= 9; digit++) {
      allPossibleCalls.push({
        text: `Find a jersey number with ${digit} in the tens place`,
        answer: num => Math.floor((num % 100) / 10) === digit
      });
    }
    
    // Ones place calls (0-9)
    for (let digit = 0; digit <= 9; digit++) {
      allPossibleCalls.push({
        text: `Find a jersey number with ${digit} in the ones place`,
        answer: num => num % 10 === digit
      });
    }
    
    // Baseball-themed pattern calls
    allPossibleCalls.push(
      { text: "Find a jersey with the same digit in tens and ones (like a double play!)", answer: num => Math.floor((num % 100) / 10) === (num % 10) },
      { text: "Find a jersey with all different digits (triple play!)", answer: num => {
        const h = Math.floor(num / 100), t = Math.floor((num % 100) / 10), o = num % 10;
        return h !== t && h !== o && t !== o;
      }},
      { text: "Find a jersey number with a 0 (like a shutout!)", answer: num => num.toString().includes('0') },
      { text: "Find an even jersey number", answer: num => num % 2 === 0 },
      { text: "Find an odd jersey number", answer: num => num % 2 === 1 },
      { text: "Find a number higher than 500 (major league!)", answer: num => num > 500 },
      { text: "Find a number lower than 400 (minor league!)", answer: num => num < 400 },
      { text: "Find a number between 200-300 (rookie numbers!)", answer: num => num >= 200 && num <= 300 }
    );
    
    const validCalls = allPossibleCalls.filter(call => 
      numbers.some(num => call.answer(num))
    );
    
    const shuffledCalls = validCalls.sort(() => Math.random() - 0.5);
    const finalCalls = shuffledCalls.slice(0, Math.max(25, shuffledCalls.length));
    
    setBingoCalls(finalCalls);
  };

  const nextBingoCall = () => {
    if (bingoCallIndex < bingoCalls.length) {
      setBingoCallIndex(bingoCallIndex + 1);
    }
  };

  const markBingoCell = (number, index) => {
    if (bingoMarked.has(index) || bingoCallIndex === 0 || index === 12) return;
    
    const currentCall = bingoCalls[bingoCallIndex - 1];
    if (currentCall && currentCall.answer(number)) {
      const newMarked = new Set(bingoMarked);
      newMarked.add(index);
      setBingoMarked(newMarked);
      showFeedback('⚾ Great catch! Right on target!', 'success');
      
      if (newMarked.size >= 5) {
        setTimeout(() => showFeedback('🏆 BINGO! You won the World Series!', 'success'), 1000);
      }
    } else {
      showFeedback('Foul ball! Try again, slugger!', 'error');
    }
  };

  // ===== CONCESSION STAND =====
  const initConcessionStand = () => {
    const randomPrice = Math.floor(Math.random() * 800) + 100;
    setConcessionPrice(randomPrice);
    setTotalMoney(0);
    const randomItem = concessionItems[Math.floor(Math.random() * concessionItems.length)];
    setCurrentConcessionItem(randomItem);
  };

  const addMoney = (amount) => {
    setTotalMoney(prev => prev + amount);
  };

  const removeMoney = (amount) => {
    setTotalMoney(prev => Math.max(0, prev - amount));
  };

  const checkConcessionPurchase = () => {
    if (totalMoney === concessionPrice) {
      showFeedback('⚾ Perfect! You have exact change! Enjoy the game!', 'success');
    } else if (totalMoney > concessionPrice) {
      const change = totalMoney - concessionPrice;
      showFeedback(`💰 You have too much! You need $${change} in change back.`, 'error');
    } else {
      const needed = concessionPrice - totalMoney;
      showFeedback(`💸 You need $${needed} more for this ballpark treat!`, 'error');
    }
  };

  // ===== BASE-10 BLOCKS (Stats Board) =====
  const generateBlocksProblem = () => {
    const hundreds = Math.floor(Math.random() * 7);
    const tens = Math.floor(Math.random() * 10);
    const ones = Math.floor(Math.random() * 10);
    
    setBlocksProblem({
      hundreds,
      tens, 
      ones,
      answer: hundreds * 100 + tens * 10 + ones
    });
    setBlocksAnswer('');
  };

  const checkBlocksAnswer = () => {
    const userAnswer = parseInt(blocksAnswer);
    if (isNaN(userAnswer)) {
      showFeedback('Enter your stats total, champ!', 'error');
      return;
    }
    
    if (userAnswer === blocksProblem.answer) {
      showFeedback(`⚾ Home run! The total stats are ${blocksProblem.answer}!`, 'success');
    } else {
      const hint = `${blocksProblem.hundreds} hundreds + ${blocksProblem.tens} tens + ${blocksProblem.ones} ones`;
      showFeedback(`Strike! The correct total is ${blocksProblem.answer}. Count: ${hint}`, 'error');
    }
  };

  // ===== MATH CHAMPIONSHIP =====
  const generateMathProblem = () => {
    let num1, num2, answer, problem;
    
    if (mathLevel === 1) {
      // Level 1: Rookie League (Addition within 20)
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * (20 - num1)) + 1;
      answer = num1 + num2;
      problem = `${num1} + ${num2}`;
    } else if (mathLevel === 2) {
      // Level 2: Single-A (Subtraction within 20)
      num1 = Math.floor(Math.random() * 15) + 5;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      problem = `${num1} - ${num2}`;
    } else if (mathLevel === 3) {
      // Level 3: Double-A (Addition within 50)
      num1 = Math.floor(Math.random() * 25) + 1;
      num2 = Math.floor(Math.random() * (50 - num1)) + 1;
      answer = num1 + num2;
      problem = `${num1} + ${num2}`;
    } else if (mathLevel === 4) {
      // Level 4: Triple-A (Subtraction within 50)
      num1 = Math.floor(Math.random() * 40) + 10;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      problem = `${num1} - ${num2}`;
    } else {
      // Level 5: Major League (Mixed within 100)
      if (Math.random() < 0.5) {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * (100 - num1)) + 1;
        answer = num1 + num2;
        problem = `${num1} + ${num2}`;
      } else {
        num1 = Math.floor(Math.random() * 80) + 20;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        problem = `${num1} - ${num2}`;
      }
    }
    
    setMathProblem({ problem, answer });
    setMathAnswer('');
  };

  const checkMathAnswer = () => {
    const userAnswer = parseInt(mathAnswer);
    if (isNaN(userAnswer)) {
      showFeedback('Enter your answer to swing, batter!', 'error');
      return;
    }
    
    if (userAnswer === mathProblem.answer) {
      setMathScore(prev => prev + 1);
      setMathStreak(prev => prev + 1);
      setMathRuns(prev => prev + 1);
      
      // Level up every 5 correct answers
      if ((mathScore + 1) % 5 === 0 && mathLevel < 5) {
        setMathLevel(prev => prev + 1);
        showFeedback(`⚾ HOME RUN! Promoted to ${getLevelInfo(mathLevel + 1).name}!`, 'success');
      } else {
        const encouragements = [
          '⚾ Grand slam!', '🏟️ Home run!', '⭐ Triple!', 
          '🌟 Double!', '💫 Single!', '🎯 Base hit!'
        ];
        const message = encouragements[Math.floor(Math.random() * encouragements.length)];
        showFeedback(message, 'success');
      }
      
      setTimeout(() => {
        generateMathProblem();
      }, 1500);
    } else {
      setMathStreak(0);
      showFeedback(`Strike! ${mathProblem.problem} = ${mathProblem.answer}. Next batter up!`, 'error');
      
      setTimeout(() => {
        generateMathProblem();
      }, 2500);
    }
  };

  const resetMathChampionship = () => {
    setMathScore(0);
    setMathStreak(0);
    setMathLevel(1);
    setMathRuns(0);
    generateMathProblem();
  };

  // ===== BASE RUNNING (Expanded Form) =====
  const generateBaseRunningProblem = () => {
    const problemTypes = [
      'standardToExpanded',
      'expandedToStandard',
      'wordToStandard',
      'wordToExpanded'
    ];
    
    const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    
    // Generate a 3-digit number
    const hundreds = Math.floor(Math.random() * 9) + 1; // 1-9
    const tens = Math.floor(Math.random() * 10); // 0-9
    const ones = Math.floor(Math.random() * 10); // 0-9
    
    const standardForm = hundreds * 100 + tens * 10 + ones;
    const expandedForm = `${hundreds * 100} + ${tens * 10} + ${ones}`;
    const wordForm = `${getNumberWord(hundreds)} hundred ${tens > 0 ? getNumberWord(tens) : ''}${tens > 1 ? 'ty' : tens === 1 ? 'ten' : ''} ${ones > 0 ? getNumberWord(ones) : ''}`.trim().replace(/\s+/g, ' ');
    
    let question, correctAnswer, answerType;
    
    switch (problemType) {
      case 'standardToExpanded':
        question = `Convert to expanded form: ${standardForm}`;
        correctAnswer = expandedForm;
        answerType = 'expanded';
        break;
      case 'expandedToStandard':
        question = `What number is represented by: ${expandedForm}`;
        correctAnswer = standardForm.toString();
        answerType = 'standard';
        break;
      case 'wordToStandard':
        const simpleWordForm = getSimpleWordForm(standardForm);
        question = `Write the number: ${simpleWordForm}`;
        correctAnswer = standardForm.toString();
        answerType = 'standard';
        break;
      case 'wordToExpanded':
        const simpleWordForm2 = getSimpleWordForm(standardForm);
        question = `Write in expanded form: ${simpleWordForm2}`;
        correctAnswer = expandedForm;
        answerType = 'expanded';
        break;
    }
    
    setBaseRunningProblem({
      question,
      correctAnswer,
      answerType,
      standardForm,
      expandedForm
    });
    setBaseRunningAnswer('');
    setExpandedFormInputs({ hundreds: '', tens: '', ones: '' });
  };

  const getSimpleWordForm = (number) => {
    const hundreds = Math.floor(number / 100);
    const tens = Math.floor((number % 100) / 10);
    const ones = number % 10;
    
    const numberWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teenWords = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tensWords = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    let result = '';
    
    if (hundreds > 0) {
      result += numberWords[hundreds] + ' hundred';
    }
    
    if (tens > 0 || ones > 0) {
      if (result) result += ' ';
      
      if (tens === 1) {
        result += teenWords[ones];
      } else {
        if (tens > 0) {
          result += tensWords[tens];
        }
        if (ones > 0) {
          if (tens > 0) result += '-';
          result += numberWords[ones];
        }
      }
    }
    
    return result || 'zero';
  };

  const getNumberWord = (num) => {
    const words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    return words[num] || '';
  };

  const checkBaseRunningAnswer = () => {
    let userAnswer;
    let isCorrect = false;

    if (baseRunningProblem.answerType === 'expanded') {
      // For expanded form, check the three input boxes
      const h = parseInt(expandedFormInputs.hundreds) || 0;
      const t = parseInt(expandedFormInputs.tens) || 0;
      const o = parseInt(expandedFormInputs.ones) || 0;
      
      userAnswer = `${h} + ${t} + ${o}`;
      isCorrect = userAnswer === baseRunningProblem.correctAnswer;
    } else {
      // For standard form answers, use the single input
      userAnswer = baseRunningAnswer.trim();
      if (!userAnswer) {
        showFeedback('Enter your answer to run the bases!', 'error');
        return;
      }
      isCorrect = userAnswer.toLowerCase() === baseRunningProblem.correctAnswer.toLowerCase();
    }
    
    if (isCorrect) {
      setBaseRunningScore(prev => prev + 1);
      showFeedback('⚾ Safe at home! Great conversion!', 'success');
      
      // Generate new problem after short delay
      setTimeout(() => {
        generateBaseRunningProblem();
      }, 2000);
    } else {
      showFeedback(`Out at first base! The correct answer is: ${baseRunningProblem.correctAnswer}`, 'error');
      
      // Generate new problem after showing answer
      setTimeout(() => {
        generateBaseRunningProblem();
      }, 3000);
    }
  };

  // Initialize games when switching
  useEffect(() => {
    if (currentGame === 'bingo') initBingo();
    if (currentGame === 'concessions') initConcessionStand();
    if (currentGame === 'stats') generateBlocksProblem();
    if (currentGame === 'championship') generateMathProblem();
    if (currentGame === 'baserunning') {
      generateBaseRunningProblem();
      // Focus on the first input after a short delay to ensure the component is fully rendered
      setTimeout(() => {
        const firstInput = document.querySelector('#baserunning-first-input');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  }, [currentGame]);

  // Focus management for Base Running game
  useEffect(() => {
    if (currentGame === 'baserunning' && baseRunningProblem) {
      // Focus on the appropriate input when a new problem is generated
      setTimeout(() => {
        const firstInput = document.querySelector('#baserunning-first-input');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  }, [baseRunningProblem, currentGame]);

  return (
    <div className="font-sans">
      {/* Feedback Toast */}
      {feedback.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg font-bold text-white shadow-lg transform transition-all duration-300 ${
          feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {feedback.message}
        </div>
      )}
      
      {/* Main Menu */}
      {currentGame === 'menu' && (
        <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
                ⚾ Slugger's Math Stadium ⚾
              </h1>
              <p className="text-2xl text-green-100 mb-2">
                Step up to the plate and master your math skills!
              </p>
              <p className="text-lg text-green-200">
                🏟️ Play ball and learn place value, addition, and subtraction! 🏟️
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'batting', title: '⚾ Batting Practice', desc: 'Swing for the fences! Build the highest run score!' },
                { id: 'bingo', title: '🏟️ Stadium Bingo', desc: 'Mark jersey numbers based on place value clues!' },
                { id: 'concessions', title: '🍿 Concession Stand', desc: 'Buy ballpark treats with exact change!' },
                { id: 'stats', title: '📊 Stats Scoreboard', desc: 'Count up player statistics on the big board!' },
                { id: 'baserunning', title: '🏃 Base Running', desc: 'Convert between standard and expanded form!' },
                { id: 'championship', title: '🏆 Math Championship', desc: 'Compete in the ultimate math showdown!' }
              ].map(game => (
                <div
                  key={game.id}
                  onClick={() => setCurrentGame(game.id)}
                  className="bg-white rounded-2xl p-6 text-center shadow-xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-4 border-transparent hover:border-yellow-400"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{game.title}</h3>
                  <p className="text-lg text-gray-600">{game.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Batting Practice */}
      {currentGame === 'batting' && (
        <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentGame('menu')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-red-700"
            >
              ← Back to Stadium
            </button>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                ⚾ Batting Practice
              </h2>
              <p className="text-center text-lg mb-6">
                Roll your dice and strategically place them to hit the highest run score!
              </p>
              
              <div className="flex justify-center gap-5 mb-6">
                {builderDice.map((die, i) => (
                  <div
                    key={i}
                    onClick={() => selectDice(i)}
                    className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl font-bold cursor-pointer transition-all duration-300 bg-white shadow-lg ${
                      die === null 
                        ? 'bg-gray-200 text-gray-400 border-gray-300 opacity-50 cursor-default' 
                        : selectedDice === i 
                        ? 'bg-blue-500 text-white border-blue-600 transform scale-110' 
                        : 'text-gray-800 border-red-500 hover:scale-110 hover:border-red-600'
                    }`}
                  >
                    {die === null ? '⚾' : die || '?'}
                  </div>
                ))}
              </div>
              
              <div className="text-center mb-6">
                <button
                  onClick={rollDice}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg text-xl font-bold hover:bg-red-700 transform hover:scale-105"
                >
                  ⚾ Pitch the Ball!
                </button>
              </div>
              
              <div className="flex justify-center gap-4 mb-6">
                {[
                  { place: 'hundreds', label: 'Home Run', multiplier: '×100' },
                  { place: 'tens', label: 'Triple', multiplier: '×10' },
                  { place: 'ones', label: 'Single', multiplier: '×1' }
                ].map(({ place, label, multiplier }) => (
                  <div
                    key={place}
                    onClick={() => placeInSlot(place)}
                    className={`w-28 h-28 rounded-xl border-4 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                      builderSlots[place] !== null
                        ? 'bg-green-100 border-green-500 text-green-700 text-2xl font-bold'
                        : 'border-gray-300 text-gray-500 hover:border-yellow-400 hover:bg-yellow-50'
                    }`}
                  >
                    {builderSlots[place] !== null ? (
                      <>
                        <span className="text-3xl">{builderSlots[place]}</span>
                        <span className="text-xs">⚾</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-bold">{label}</span>
                        <small className="text-xs">{multiplier}</small>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center bg-green-100 rounded-2xl p-6 border-4 border-green-500">
                <h3 className="text-xl font-bold text-green-800 mb-2">🏟️ SCOREBOARD</h3>
                <div className="text-5xl font-bold text-green-800 min-h-16 flex items-center justify-center">
                  {builderDice.every(d => d === null) ? (
                    <>
                      {getBuilderNumber()} RUNS
                      {Object.values(builderSlots).every(s => s !== null) && ' 🎯'}
                    </>
                  ) : (
                    builderDice.some(d => d !== 0) ? 'Select a baseball, then choose your hit!' : 'Pitch the Ball to start!'
                  )}
                </div>
              </div>
              
              <div className="text-center mt-4">
                <button
                  onClick={rollDice}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700"
                >
                  ⚾ New At-Bat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stadium Bingo */}
      {currentGame === 'bingo' && (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentGame('menu')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-red-700"
            >
              ← Back to Stadium
            </button>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                🏟️ Stadium Bingo
              </h2>
              <p className="text-center text-lg mb-6">
                Listen to the announcer and mark the correct jersey number!
              </p>
              
              <div className="bg-blue-100 rounded-xl p-6 mb-6 text-center border-4 border-blue-500">
                <h3 className="text-lg font-bold text-blue-800 mb-2">📢 Stadium Announcer</h3>
                <div className="text-xl font-bold text-blue-800 min-h-16 flex items-center justify-center">
                  {bingoCallIndex === 0 
                    ? 'Click "Next Call" for the first announcement!' 
                    : bingoCallIndex <= bingoCalls.length 
                    ? bingoCalls[bingoCallIndex - 1]?.text || 'Game over! Great job, sports fans! ⚾'
                    : 'Game over! Great job, sports fans! ⚾'
                  }
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-2 max-w-md mx-auto mb-6">
                {bingoNumbers.map((num, i) => (
                  <div
                    key={i}
                    onClick={() => markBingoCell(num, i)}
                    className={`aspect-square border-2 rounded-lg flex items-center justify-center font-bold cursor-pointer transition-all duration-300 text-sm ${
                      i === 12 // Center square (HOME PLATE)
                        ? 'bg-yellow-400 text-gray-800 border-yellow-500 cursor-default'
                        : bingoMarked.has(i)
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-white text-gray-800 border-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {i === 12 ? (
                      <div className="text-center">
                        <div className="text-xs">HOME</div>
                        <div className="text-xs">PLATE</div>
                      </div>
                    ) : num}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={nextBingoCall}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
                >
                  📢 Next Call
                </button>
                <button
                  onClick={() => initBingo()}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700"
                >
                  🔄 New Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concession Stand */}
      {currentGame === 'concessions' && (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentGame('menu')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-red-700"
            >
              ← Back to Stadium
            </button>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                🍿 Ballpark Concession Stand
              </h2>
              <p className="text-center text-lg mb-6">
                Get your ballpark treats with exact change!
              </p>
              
              {/* Product Display */}
              <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-8 mb-6 text-white text-center">
                <div className="text-8xl mb-4">{currentConcessionItem.emoji}</div>
                <h3 className="text-3xl font-bold mb-2">{currentConcessionItem.name}</h3>
                <p className="text-xl mb-4">{currentConcessionItem.description}</p>
                <div className="bg-white/20 rounded-xl p-3 mb-6">
                  <span className="font-bold text-lg">{currentConcessionItem.rarity}</span>
                </div>
                <div className="bg-white/30 rounded-2xl p-4">
                  <div className="text-4xl font-bold">${concessionPrice}</div>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <button
                  onClick={() => setWalletOpen(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700"
                >
                  💰 Open Wallet
                </button>
              </div>
              
              {/* Money Display */}
              <div className="bg-green-100 border-4 border-green-500 rounded-xl p-6 mb-6 text-center">
                <h3 className="text-xl font-bold text-green-700 mb-2">💵 Your Money</h3>
                <div className="text-3xl font-bold text-green-700">${totalMoney}</div>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={checkConcessionPurchase}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
                >
                  ✅ Buy Treat
                </button>
                <button
                  onClick={initConcessionStand}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700"
                >
                  🔄 New Item
                </button>
              </div>
            </div>
          </div>
          
          {/* Wallet Modal */}
          {walletOpen && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setWalletOpen(false)}>
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-center mb-4">💰 Stadium Wallet</h3>
                
                <div className="bg-red-100 border-2 border-red-500 rounded-xl p-4 mb-6 text-center">
                  <h4 className="text-lg font-bold text-red-700 mb-2">🍿 Item Price:</h4>
                  <div className="text-2xl font-bold text-red-700">${concessionPrice}</div>
                </div>
                
                <p className="text-center mb-4">Click bills to add money:</p>
                
                <div className="flex justify-center gap-4 mb-6">
                  {[
                    { amount: 100, color: 'from-green-600 to-green-800', label: '$100' },
                    { amount: 10, color: 'from-blue-600 to-green-600', label: '$10' },
                    { amount: 1, color: 'from-green-700 to-green-900', label: '$1' }
                  ].map(bill => (
                    <div key={bill.amount} className="text-center">
                      <button
                        onClick={() => addMoney(bill.amount)}
                        className={`w-20 h-12 bg-gradient-to-br ${bill.color} text-white rounded-lg font-bold shadow-lg hover:scale-110 transition-transform mb-2`}
                      >
                        💵<br/>{bill.label}
                      </button>
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => addMoney(bill.amount)}
                          className="w-6 h-6 bg-white border-2 border-gray-400 rounded-full font-bold text-sm hover:bg-gray-100"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeMoney(bill.amount)}
                          className="w-6 h-6 bg-white border-2 border-gray-400 rounded-full font-bold text-sm hover:bg-gray-100"
                        >
                          −
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => setWalletOpen(false)}
                  className="w-full bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
                >
                  Close Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Scoreboard */}
      {currentGame === 'stats' && (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentGame('menu')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-red-700"
            >
              ← Back to Stadium
            </button>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                📊 Stats Scoreboard
              </h2>
              <p className="text-center text-lg mb-6">
                Count up the total statistics on the big board!
              </p>
              
              {/* Legend */}
              <div className="flex justify-center gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-yellow-500 border border-gray-600 rounded"></div>
                  <span>Home Runs (100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-orange-500 border border-gray-600 rounded"></div>
                  <span>Hits (10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-500 border border-gray-600 rounded"></div>
                  <span>RBIs (1)</span>
                </div>
              </div>
              
              {/* Stats Display */}
              <div className="border-4 border-gray-400 rounded-2xl p-6 mb-6 min-h-48 bg-green-100 flex flex-wrap gap-3 items-start justify-center">
                {blocksProblem && (
                  <>
                    {/* Home Runs (hundreds) */}
                    {Array.from({length: blocksProblem.hundreds}, (_, i) => (
                      <div key={`hr${i}`} className="w-16 h-16 bg-yellow-500 border-2 border-gray-800 rounded-lg grid grid-cols-10 gap-px p-1 shadow-lg">
                        {Array.from({length: 100}, (_, j) => (
                          <div key={j} className="bg-yellow-200 border border-yellow-400 rounded-sm"></div>
                        ))}
                      </div>
                    ))}
                    
                    {/* Hits (tens) */}
                    {Array.from({length: blocksProblem.tens}, (_, i) => (
                      <div key={`h${i}`} className="w-4 h-16 bg-orange-500 border-2 border-gray-800 rounded-lg grid grid-rows-10 gap-px p-1 shadow-lg">
                        {Array.from({length: 10}, (_, j) => (
                          <div key={j} className="bg-orange-200 border border-orange-400 rounded-sm"></div>
                        ))}
                      </div>
                    ))}
                    
                    {/* RBIs (ones) */}
                    {Array.from({length: blocksProblem.ones}, (_, i) => (
                      <div key={`rbi${i}`} className="w-4 h-4 bg-red-500 border-2 border-gray-800 rounded shadow-lg"></div>
                    ))}
                  </>
                )}
              </div>
              
              <div className="text-center mb-6">
                <input
                  type="number"
                  value={blocksAnswer}
                  onChange={(e) => setBlocksAnswer(e.target.value)}
                  placeholder="Total stats"
                  className="px-4 py-3 border-4 border-gray-300 rounded-lg text-xl text-center w-48 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={checkBlocksAnswer}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
                >
                  ✅ Check
                </button>
                <button
                  onClick={generateBlocksProblem}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700"
                >
                  🔄 New Stats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Base Running */}
      {currentGame === 'baserunning' && (
        <div className="min-h-screen bg-gradient-to-br from-teal-600 to-cyan-800 p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentGame('menu')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-red-700"
            >
              ← Back to Stadium
            </button>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                🏃 Base Running Challenge
              </h2>
              <p className="text-center text-lg mb-6">
                Run the bases by converting between standard and expanded form!
              </p>
              
              {/* Score Display */}
              <div className="bg-teal-100 border-4 border-teal-500 rounded-xl p-4 mb-6 text-center">
                <h3 className="text-xl font-bold text-teal-800 mb-2">🏃 Runs Scored</h3>
                <div className="text-3xl font-bold text-teal-800">{baseRunningScore}</div>
              </div>
              
              {/* Problem Display */}
              {baseRunningProblem && (
                <div className="bg-blue-100 rounded-2xl p-8 mb-6 text-center border-4 border-blue-500">
                  <div className="text-2xl font-bold text-blue-800 mb-6">
                    {baseRunningProblem.question}
                  </div>
                  
                  <div className="mb-4">
                    {baseRunningProblem.answerType === 'expanded' ? (
                      /* Three boxes for expanded form */
                      <div className="flex justify-center items-center gap-3 flex-wrap">
                        <input
                          id="baserunning-first-input"
                          type="number"
                          value={expandedFormInputs.hundreds}
                          onChange={(e) => setExpandedFormInputs(prev => ({ ...prev, hundreds: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              // Move to next input or submit if this is the last one
                              const tensInput = document.querySelector('#baserunning-tens-input');
                              if (tensInput) tensInput.focus();
                            }
                          }}
                          placeholder="000"
                          className="w-20 h-16 border-4 border-gray-300 rounded-xl text-xl text-center focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-2xl font-bold text-blue-800">+</span>
                        <input
                          id="baserunning-tens-input"
                          type="number"
                          value={expandedFormInputs.tens}
                          onChange={(e) => setExpandedFormInputs(prev => ({ ...prev, tens: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              // Move to next input
                              const onesInput = document.querySelector('#baserunning-ones-input');
                              if (onesInput) onesInput.focus();
                            }
                          }}
                          placeholder="00"
                          className="w-20 h-16 border-4 border-gray-300 rounded-xl text-xl text-center focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-2xl font-bold text-blue-800">+</span>
                        <input
                          id="baserunning-ones-input"
                          type="number"
                          value={expandedFormInputs.ones}
                          onChange={(e) => setExpandedFormInputs(prev => ({ ...prev, ones: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              // Submit the answer since this is the last input
                              checkBaseRunningAnswer();
                            }
                          }}
                          placeholder="0"
                          className="w-20 h-16 border-4 border-gray-300 rounded-xl text-xl text-center focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    ) : (
                      /* Single input for standard form */
                      <input
                        id="baserunning-first-input"
                        type="text"
                        value={baseRunningAnswer}
                        onChange={(e) => setBaseRunningAnswer(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && checkBaseRunningAnswer()}
                        placeholder="Your answer"
                        className="px-6 py-4 border-4 border-gray-300 rounded-xl text-xl text-center w-80 focus:border-blue-500 focus:outline-none"
                      />
                    )}
                  </div>
                  
                  <button
                    onClick={checkBaseRunningAnswer}
                    className="bg-teal-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-teal-700 transform hover:scale-105"
                  >
                    Run! 🏃
                  </button>
                </div>
              )}
              
              {/* Examples */}
              <div className="bg-gray-100 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3 text-center">📋 Examples:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg border">
                    <strong>Standard Form:</strong> 807<br/>
                    <strong>Expanded Form:</strong> 800 + 0 + 7<br/>
                    <small className="text-gray-600">Use the three boxes: [800] + [0] + [7]</small>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <strong>Word Form:</strong> four hundred twenty-nine<br/>
                    <strong>Standard Form:</strong> 429<br/>
                    <small className="text-gray-600">Type directly: 429</small>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={generateBaseRunningProblem}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
                >
                  🎯 New Problem
                </button>
                <button
                  onClick={() => setBaseRunningScore(0)}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700"
                >
                  🔄 Reset Score
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Math Championship */}
      {currentGame === 'championship' && (
        <div className="min-h-screen bg-gradient-to-br from-yellow-500 to-orange-600 p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentGame('menu')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-red-700"
            >
              ← Back to Stadium
            </button>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                🏆 Math Championship Series
              </h2>
              <p className="text-center text-lg mb-6">
                Swing for the mathematical fences and climb the leagues!
              </p>
              
              {/* Level and Score Display */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-100 border-4 border-blue-500 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">{getLevelInfo().emoji}</div>
                  <h3 className="font-bold text-blue-700">{getLevelInfo().name}</h3>
                  <p className="text-xs text-blue-500">{getLevelInfo().desc}</p>
                </div>
                
                <div className="bg-green-100 border-4 border-green-500 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">⚾</div>
                  <h3 className="font-bold text-green-700">At Bats</h3>
                  <p className="text-2xl font-bold text-green-600">{mathScore}</p>
                </div>
                
                <div className="bg-yellow-100 border-4 border-yellow-500 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🔥</div>
                  <h3 className="font-bold text-yellow-700">Hot Streak</h3>
                  <p className="text-2xl font-bold text-yellow-600">{mathStreak}</p>
                </div>

                <div className="bg-red-100 border-4 border-red-500 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🏃</div>
                  <h3 className="font-bold text-red-700">Runs</h3>
                  <p className="text-2xl font-bold text-red-600">{mathRuns}</p>
                </div>
              </div>
              
              {/* Math Problem Display */}
              {mathProblem && (
                <div className="bg-green-100 rounded-2xl p-8 mb-6 text-center border-4 border-green-500">
                  <div className="text-6xl font-bold text-green-800 mb-6">
                    {mathProblem.problem} = ?
                  </div>
                  
                  <div className="flex justify-center items-center gap-4">
                    <input
                      type="number"
                      value={mathAnswer}
                      onChange={(e) => setMathAnswer(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && checkMathAnswer()}
                      placeholder="Swing!"
                      className="px-6 py-4 border-4 border-gray-300 rounded-xl text-2xl text-center w-32 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={checkMathAnswer}
                      className="bg-red-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-red-700 transform hover:scale-105"
                    >
                      Swing! ⚾
                    </button>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={generateMathProblem}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
                >
                  🎯 Next Pitch
                </button>
                <button
                  onClick={resetMathChampionship}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700"
                >
                  🔄 New Season
                </button>
              </div>
              
              {/* Progress Info */}
              <div className="mt-6 text-center text-gray-600">
                <p className="text-sm">Score 5 hits to advance to the next league!</p>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2 border-2 border-gray-300">
                  <div 
                    className="bg-red-500 h-full rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold" 
                    style={{ width: `${Math.max(20, ((mathScore % 5) / 5) * 100)}%` }}
                  >
                    ⚾
                  </div>
                </div>
                <p className="text-xs mt-1">{mathScore % 5}/5 hits until promotion</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseballMathGames;
              